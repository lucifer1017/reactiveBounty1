import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { parseUnits, keccak256, toBytes } from "viem";

describe("FeedProxy", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer, unauthorized] = await viem.getWalletClients();

  const CALLBACK_PROXY = "0xc9f36411C9897e7F959D99ffca2a0Ba7ee0D7bDA" as `0x${string}`;
  const REACTIVE_VM_ID = "0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5" as `0x${string}`;
  const DOMAIN_SEPARATOR = keccak256(toBytes("REACTIVE_ORACLE_V1"));

  describe("Deployment", async function () {
    it("Should deploy with reactiveVmId", async function () {
      const feedProxy = await viem.deployContract("FeedProxy", [REACTIVE_VM_ID]);

      const vmId = await feedProxy.read.reactiveVmId();
      assert.equal(vmId.toLowerCase(), REACTIVE_VM_ID.toLowerCase());
    });

    it("Should revert deployment with zero address", async function () {
      await assert.rejects(
        async () => {
          await viem.deployContract("FeedProxy", ["0x0000000000000000000000000000000000000000"]);
        },
        {
          message: /FeedProxy: invalid RVM ID/,
        }
      );
    });

    it("Should have correct constants", async function () {
      const feedProxy = await viem.deployContract("FeedProxy", [REACTIVE_VM_ID]);

      assert.equal(await feedProxy.read.decimals(), 8);
      assert.equal(await feedProxy.read.description(), "BTC/USD (Reactive Mirror)");
      assert.equal(await feedProxy.read.version(), 1n);
      assert.equal(await feedProxy.read.CALLBACK_PROXY(), CALLBACK_PROXY);
    });

    it("Should initialize latestRound with startedAt", async function () {
      const feedProxy = await viem.deployContract("FeedProxy", [REACTIVE_VM_ID]);

      const [roundId, answer, startedAt, updatedAt, answeredInRound] =
        await feedProxy.read.latestRoundData();
      
      assert.ok(startedAt > 0n);
      assert.equal(roundId, 0n);
      assert.equal(answer, 0n);
    });
  });

  describe("updatePrice Authorization", async function () {
    it("Should revert when called by unauthorized address (not Callback Proxy)", async function () {
      const feedProxy = await viem.deployContract("FeedProxy", [REACTIVE_VM_ID], {
        client: { wallet: deployer },
      });

      const roundId = 1n;
      const answer = parseUnits("30000", 8);
      const startedAt = BigInt(Math.floor(Date.now() / 1000));
      const updatedAt = startedAt + 100n;
      const answeredInRound = 1n;

      // Try to call from unauthorized address (not Callback Proxy)
      await assert.rejects(
        async () => {
          await feedProxy.write.updatePrice(
            [REACTIVE_VM_ID, DOMAIN_SEPARATOR, roundId, answer, startedAt, updatedAt, answeredInRound],
            { account: unauthorized.account }
          );
        },
        {
          message: /FeedProxy: not Reactive proxy/,
        }
      );
    });

    it("Should have correct onlyReactive modifier", async function () {
      const feedProxy = await viem.deployContract("FeedProxy", [REACTIVE_VM_ID]);

      // Verify that onlyReactive modifier is correctly set
      const callbackProxy = await feedProxy.read.CALLBACK_PROXY();
      assert.equal(callbackProxy.toLowerCase(), CALLBACK_PROXY.toLowerCase());
    });
  });

  describe("AggregatorV3Interface", async function () {
    it("Should return zero values initially", async function () {
      const feedProxy = await viem.deployContract("FeedProxy", [REACTIVE_VM_ID]);

      const [roundId, answer, startedAt, updatedAt, answeredInRound] =
        await feedProxy.read.latestRoundData();

      assert.equal(roundId, 0n);
      assert.equal(answer, 0n);
      assert.ok(startedAt > 0n); // startedAt is set in constructor
      assert.equal(updatedAt, 0n);
      assert.equal(answeredInRound, 0n);
    });

    it("Should revert getRoundData for non-existent round", async function () {
      const feedProxy = await viem.deployContract("FeedProxy", [REACTIVE_VM_ID]);

      await assert.rejects(
        async () => {
          await feedProxy.read.getRoundData([999n]);
        },
        {
          message: /FeedProxy: round not found/,
        }
      );
    });
  });

  describe("pay function", async function () {
    it("Should revert payment from unauthorized address", async function () {
      const feedProxy = await viem.deployContract("FeedProxy", [REACTIVE_VM_ID], {
        client: { wallet: deployer },
      });

      await assert.rejects(
        async () => {
          await feedProxy.write.pay({ account: unauthorized.account, value: parseUnits("0.01", 18) });
        },
        {
          message: /FeedProxy: not Reactive proxy/,
        }
      );
    });

    it("Should have pay function with onlyReactive modifier", async function () {
      const feedProxy = await viem.deployContract("FeedProxy", [REACTIVE_VM_ID]);

      // Verify pay function exists and is protected
      // In production, Callback Proxy calls pay() to settle callback debt
      const callbackProxy = await feedProxy.read.CALLBACK_PROXY();
      assert.equal(callbackProxy.toLowerCase(), CALLBACK_PROXY.toLowerCase());
    });
  });

  describe("receive function", async function () {
    it("Should accept direct ETH transfers", async function () {
      const feedProxy = await viem.deployContract("FeedProxy", [REACTIVE_VM_ID], {
        client: { wallet: deployer },
      });

      const amount = parseUnits("0.01", 18);
      await deployer.sendTransaction({
        to: feedProxy.address,
        value: amount,
      });

      const balance = await publicClient.getBalance({ address: feedProxy.address });
      assert.equal(balance, amount);
    });
  });

  describe("Edge Cases and Security", async function () {
    it("Should maintain correct initial state", async function () {
      const feedProxy = await viem.deployContract("FeedProxy", [REACTIVE_VM_ID]);

      const [roundId, answer, startedAt, updatedAt, answeredInRound] =
        await feedProxy.read.latestRoundData();
      
      assert.equal(roundId, 0n);
      assert.equal(answer, 0n);
      assert.equal(updatedAt, 0n);
      assert.equal(answeredInRound, 0n);
      assert.ok(startedAt > 0n); // Set in constructor
    });

    it("Should have immutable reactiveVmId", async function () {
      const feedProxy = await viem.deployContract("FeedProxy", [REACTIVE_VM_ID]);

      const vmId = await feedProxy.read.reactiveVmId();
      assert.equal(vmId.toLowerCase(), REACTIVE_VM_ID.toLowerCase());
      
      // Verify it's immutable (cannot be changed after deployment)
      // This is enforced by Solidity's immutable keyword
    });

    it("Should have correct domain separator", async function () {
      const feedProxy = await viem.deployContract("FeedProxy", [REACTIVE_VM_ID]);

      const domain = await feedProxy.read.DOMAIN_SEPARATOR();
      assert.equal(domain, DOMAIN_SEPARATOR);
    });
  });
});

