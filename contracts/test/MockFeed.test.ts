import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { parseUnits } from "viem";

describe("MockFeed", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer, user] = await viem.getWalletClients();

  describe("Deployment", async function () {
    it("Should deploy with initial price", async function () {
      const initialPrice = parseUnits("30000", 8); // $30,000 with 8 decimals
      const mockFeed = await viem.deployContract("MockFeed", [initialPrice]);

      const [roundId, answer, startedAt, updatedAt, answeredInRound] =
        await mockFeed.read.latestRoundData();

      assert.equal(roundId, 1n);
      assert.equal(answer, initialPrice);
      assert.equal(answeredInRound, 1n);
      assert.ok(startedAt > 0n);
      assert.ok(updatedAt > 0n);
    });

    it("Should have correct constants", async function () {
      const initialPrice = parseUnits("30000", 8);
      const mockFeed = await viem.deployContract("MockFeed", [initialPrice]);

      assert.equal(await mockFeed.read.decimals(), 8);
      assert.equal(await mockFeed.read.description(), "Mock BTC/USD");
      assert.equal(await mockFeed.read.version(), 1n);
    });
  });

  describe("updatePrice", async function () {
    it("Should update price and emit AnswerUpdated event", async function () {
      const initialPrice = parseUnits("30000", 8);
      const mockFeed = await viem.deployContract("MockFeed", [initialPrice]);
      const deploymentBlockNumber = await publicClient.getBlockNumber();

      const newPrice = parseUnits("31100", 8); // $31,100

      const txHash = await mockFeed.write.updatePrice([newPrice]);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Verify event was emitted
      const events = await publicClient.getContractEvents({
        address: mockFeed.address,
        abi: mockFeed.abi,
        eventName: "AnswerUpdated",
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber,
        strict: true,
      });

      assert.equal(events.length, 1);
      assert.equal(events[0].args.current, newPrice);
      assert.equal(events[0].args.roundId, 2n);
      assert.ok(events[0].args.updatedAt > 0n);

      const [roundId, answer] = await mockFeed.read.latestRoundData();
      assert.equal(roundId, 2n);
      assert.equal(answer, newPrice);
    });

    it("Should increment roundId on each update", async function () {
      const initialPrice = parseUnits("30000", 8);
      const mockFeed = await viem.deployContract("MockFeed", [initialPrice]);

      const prices = [
        parseUnits("31000", 8),
        parseUnits("32000", 8),
        parseUnits("33000", 8),
      ];

      for (let i = 0; i < prices.length; i++) {
        await mockFeed.write.updatePrice([prices[i]]);
        const [roundId] = await mockFeed.read.latestRoundData();
        assert.equal(roundId, BigInt(i + 2)); // Starts at 1, so first update is 2
      }
    });

    it("Should update startedAt to previous updatedAt", async function () {
      const initialPrice = parseUnits("30000", 8);
      const mockFeed = await viem.deployContract("MockFeed", [initialPrice]);

      const [, , startedAt1, updatedAt1] = await mockFeed.read.latestRoundData();

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newPrice = parseUnits("31100", 8);
      await mockFeed.write.updatePrice([newPrice]);

      const [, , startedAt2, updatedAt2] = await mockFeed.read.latestRoundData();

      assert.equal(startedAt2, updatedAt1, "startedAt should equal previous updatedAt");
      assert.ok(updatedAt2 > updatedAt1, "updatedAt should increase");
    });

    it("Should allow any address to update price", async function () {
      const initialPrice = parseUnits("30000", 8);
      const mockFeed = await viem.deployContract("MockFeed", [initialPrice], {
        client: { wallet: deployer },
      });

      const newPrice = parseUnits("31100", 8);
      await mockFeed.write.updatePrice([newPrice], {
        account: user.account,
      });

      const [, answer] = await mockFeed.read.latestRoundData();
      assert.equal(answer, newPrice);
    });

    it("Should handle negative prices", async function () {
      const initialPrice = parseUnits("30000", 8);
      const mockFeed = await viem.deployContract("MockFeed", [initialPrice]);

      // Note: In practice, prices are usually positive, but int256 supports negative
      const negativePrice = -parseUnits("1000", 8);
      await mockFeed.write.updatePrice([negativePrice]);

      const [, answer] = await mockFeed.read.latestRoundData();
      assert.equal(answer, negativePrice);
    });
  });

  describe("AggregatorV3Interface", async function () {
    it("Should return correct latestRoundData", async function () {
      const initialPrice = parseUnits("30000", 8);
      const mockFeed = await viem.deployContract("MockFeed", [initialPrice]);

      const newPrice = parseUnits("31100", 8);
      await mockFeed.write.updatePrice([newPrice]);

      const [roundId, answer, startedAt, updatedAt, answeredInRound] =
        await mockFeed.read.latestRoundData();

      assert.equal(roundId, 2n);
      assert.equal(answer, newPrice);
      assert.ok(startedAt > 0n);
      assert.ok(updatedAt > 0n);
      assert.equal(answeredInRound, 2n);
    });

    it("Should return correct getRoundData for existing round", async function () {
      const initialPrice = parseUnits("30000", 8);
      const mockFeed = await viem.deployContract("MockFeed", [initialPrice]);

      const newPrice = parseUnits("31100", 8);
      await mockFeed.write.updatePrice([newPrice]);

      const [roundId, answer, startedAt, updatedAt, answeredInRound] =
        await mockFeed.read.getRoundData([2n]);

      assert.equal(roundId, 2n);
      assert.equal(answer, newPrice);
      assert.ok(startedAt > 0n);
      assert.ok(updatedAt > 0n);
      assert.equal(answeredInRound, 2n);
    });

    it("Should revert getRoundData for non-existent round", async function () {
      const initialPrice = parseUnits("30000", 8);
      const mockFeed = await viem.deployContract("MockFeed", [initialPrice]);

      await assert.rejects(
        async () => {
          await mockFeed.read.getRoundData([999n]);
        },
        {
          message: /Round not found/,
        }
      );
    });
  });

  describe("Events", async function () {
    it("Should emit AnswerUpdated with correct parameters", async function () {
      const initialPrice = parseUnits("30000", 8);
      const mockFeed = await viem.deployContract("MockFeed", [initialPrice]);
      const deploymentBlockNumber = await publicClient.getBlockNumber();

      const newPrice = parseUnits("31100", 8);
      await mockFeed.write.updatePrice([newPrice]);

      const events = await publicClient.getContractEvents({
        address: mockFeed.address,
        abi: mockFeed.abi,
        eventName: "AnswerUpdated",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      assert.equal(events.length, 1);
      const event = events[0];
      assert.equal(event.args.current, newPrice);
      assert.equal(event.args.roundId, 2n);
      assert.ok(event.args.updatedAt > 0n);
    });

    it("Should emit multiple AnswerUpdated events for multiple updates", async function () {
      const initialPrice = parseUnits("30000", 8);
      const mockFeed = await viem.deployContract("MockFeed", [initialPrice]);
      const deploymentBlockNumber = await publicClient.getBlockNumber();

      const prices = [
        parseUnits("31000", 8),
        parseUnits("32000", 8),
        parseUnits("33000", 8),
      ];

      for (const price of prices) {
        await mockFeed.write.updatePrice([price]);
      }

      const events = await publicClient.getContractEvents({
        address: mockFeed.address,
        abi: mockFeed.abi,
        eventName: "AnswerUpdated",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      assert.equal(events.length, 3);
      assert.equal(events[0].args.roundId, 2n);
      assert.equal(events[1].args.roundId, 3n);
      assert.equal(events[2].args.roundId, 4n);
    });
  });
});

