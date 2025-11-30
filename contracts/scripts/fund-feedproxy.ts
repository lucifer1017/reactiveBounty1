import { createWalletClient, createPublicClient, http, formatEther, parseEther, getContract } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Fund FeedProxy on Sepolia using Callback Proxy's depositTo() method
 * 
 * According to Reactive Network docs, callback contracts need funding
 * on the destination chain to pay for callback execution.
 * 
 * Usage:
 * npx tsx scripts/fund-feedproxy.ts
 */

const FEED_PROXY_ADDRESS = "0xae7bFF837C0E6Df30c337CDaA0f2E46f32309D57" as `0x${string}`;
const CALLBACK_PROXY = "0xc9f36411C9897e7F959D99ffca2a0Ba7ee0D7bDA" as `0x${string}`;
const SEPOLIA_RPC = process.env.DEST_RPC_URL || "https://rpc.sepolia.org";

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error("❌ PRIVATE_KEY not found in .env");
  process.exit(1);
}

const account = privateKeyToAccount(`0x${privateKey}` as `0x${string}`);

// Public client for reading balances
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(SEPOLIA_RPC),
});

// Wallet client for sending transactions
const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(SEPOLIA_RPC),
});

async function fundFeedProxy() {
  console.log("💰 Funding FeedProxy on Sepolia via Callback Proxy\n");
  console.log("=".repeat(60));

  // Check current status
  console.log("\n📊 Checking current status...");
  const balance = await publicClient.getBalance({
    address: FEED_PROXY_ADDRESS,
  });
  console.log(`Current FeedProxy balance: ${formatEther(balance)} ETH`);

  // Amount to deposit (default 0.01 ETH)
  const depositAmount = process.env.DEPOSIT_AMOUNT || "0.01";
  const amountToDeposit = parseEther(depositAmount);
  console.log(`\n💵 Amount to deposit: ${formatEther(amountToDeposit)} ETH`);

  // Check your account balance
  const yourBalance = await publicClient.getBalance({
    address: account.address,
  });
  console.log(`Your account balance: ${formatEther(yourBalance)} ETH`);

  if (yourBalance < amountToDeposit) {
    console.error(`\n❌ Insufficient balance! You need at least ${formatEther(amountToDeposit)} ETH`);
    console.error("Get ETH from Sepolia faucet.");
    process.exit(1);
  }

  console.log("\n📤 Calling Callback Proxy depositTo()...");
  console.log(`   Callback Proxy: ${CALLBACK_PROXY}`);
  console.log(`   Target Contract: ${FEED_PROXY_ADDRESS}`);
  console.log(`   Amount: ${formatEther(amountToDeposit)} ETH`);

  try {
    // ABI for the depositTo(address) function on Callback Proxy
    const depositToAbi = [
      {
        inputs: [{ internalType: "address", name: "contractAddress", type: "address" }],
        name: "depositTo",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
    ] as const;

    // Get contract instance
    const callbackProxy = getContract({
      address: CALLBACK_PROXY,
      abi: depositToAbi,
      client: walletClient,
    });

    console.log("\n🔄 Sending transaction...");
    const txHash = await callbackProxy.write.depositTo([FEED_PROXY_ADDRESS], {
      value: amountToDeposit,
    });

    console.log(`\n✅ Transaction sent!`);
    console.log(`   Hash: ${txHash}`);
    console.log(`\n⏳ Waiting for confirmation...`);

    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    // Check new balance
    const newBalance = await publicClient.getBalance({
      address: FEED_PROXY_ADDRESS,
    });

    console.log(`\n✅ Transaction confirmed!`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`   New FeedProxy balance: ${formatEther(newBalance)} ETH`);
    console.log(`\n🎉 FeedProxy is now funded and ready for callbacks!`);
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Try updating price on Origin chain again`);
    console.log(`   2. Check if callbacks now execute on Sepolia`);
  } catch (error: any) {
    console.error("\n❌ Error funding FeedProxy:");
    console.error(error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
    process.exit(1);
  }
}

fundFeedProxy().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

