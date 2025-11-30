import { createWalletClient, createPublicClient, http, formatEther, parseEther, getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Fund ReactiveMirror using System Contract's depositTo() method
 * 
 * This is the RECOMMENDED method because it:
 * - Automatically settles any outstanding debt
 * - No need to call coverDebt() separately
 * - Handles all the payment logic
 * 
 * Usage:
 * npx tsx scripts/deposit-to-reactive-mirror.ts
 * 
 * Optional: Set DEPOSIT_AMOUNT in .env to change funding amount (default: 0.5 lReact)
 * Example: DEPOSIT_AMOUNT=1.0
 * 
 * Note: MetaMask expects "lReact" as the currency symbol (not "REACT").
 * When adding Reactive Network to MetaMask, use "lReact" if it auto-suggests it.
 */

const REACTIVE_MIRROR_ADDRESS = "0x8dc634d4D6e290c9C04E9b64F9D68e5e5DCA6742" as `0x${string}`;
const SYSTEM_CONTRACT = "0x0000000000000000000000000000000000fffFfF" as `0x${string}`;
const REACTIVE_RPC = process.env.REACTIVE_RPC_URL;

if (!REACTIVE_RPC) {
  console.error("❌ REACTIVE_RPC_URL not found in .env");
  process.exit(1);
}

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error("❌ PRIVATE_KEY not found in .env");
  process.exit(1);
}

const account = privateKeyToAccount(`0x${privateKey}` as `0x${string}`);

const reactiveChain = {
  id: 5318007,
  name: "Reactive Network",
  network: "reactive",
  nativeCurrency: {
    decimals: 18,
    name: "REACT",
    symbol: "lReact", // MetaMask expects "lReact" - this is the network's actual symbol
  },
  rpcUrls: {
    default: {
      http: [REACTIVE_RPC],
    },
  },
};

// Public client for reading balances
const publicClient = createPublicClient({
  chain: reactiveChain,
  transport: http(REACTIVE_RPC),
});

// Wallet client for sending transactions
const walletClient = createWalletClient({
  account,
  chain: reactiveChain,
  transport: http(REACTIVE_RPC),
});

async function depositToReactiveMirror() {
  console.log("💰 Funding ReactiveMirror via System Contract (Method 2)\n");
  console.log("=".repeat(60));

  // Check current balance
  console.log("\n📊 Checking current status...");
  const balance = await publicClient.getBalance({
    address: REACTIVE_MIRROR_ADDRESS,
  });
  console.log(`Current ReactiveMirror balance: ${formatEther(balance)} lReact`);

      // Amount to deposit (configurable via environment variable or default to 0.5 lReact)
      // You can set DEPOSIT_AMOUNT in .env to change this (e.g., DEPOSIT_AMOUNT=1.0 for 1.0 lReact)
      const depositAmount = process.env.DEPOSIT_AMOUNT || "0.5";
  const amountToDeposit = parseEther(depositAmount);
  console.log(`\n💵 Amount to deposit: ${formatEther(amountToDeposit)} lReact`);
  console.log(`   (You can change this by setting DEPOSIT_AMOUNT in .env)`);

  // Check your account balance
  const yourBalance = await publicClient.getBalance({
    address: account.address,
  });
  console.log(`Your account balance: ${formatEther(yourBalance)} lReact`);

  if (yourBalance < amountToDeposit) {
    console.error(`\n❌ Insufficient balance! You need at least ${formatEther(amountToDeposit)} lReact`);
    console.error("Get lReact tokens from Reactive Network faucet or exchange.");
    process.exit(1);
  }

  console.log("\n📤 Calling System Contract depositTo()...");
  console.log(`   System Contract: ${SYSTEM_CONTRACT}`);
  console.log(`   Target Contract: ${REACTIVE_MIRROR_ADDRESS}`);
  console.log(`   Amount: ${formatEther(amountToDeposit)} lReact`);

  try {
    // ABI for the depositTo(address) function on System Contract
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
    const systemContract = getContract({
      address: SYSTEM_CONTRACT,
      abi: depositToAbi,
      client: walletClient,
    });

    console.log("\n🔄 Sending transaction...");
    const txHash = await systemContract.write.depositTo([REACTIVE_MIRROR_ADDRESS], {
      value: amountToDeposit,
    });

    console.log(`\n✅ Transaction sent!`);
    console.log(`   Hash: ${txHash}`);
    console.log(`\n⏳ Waiting for confirmation...`);

    // Wait for actual transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    // Check new balance
    const newBalance = await publicClient.getBalance({
      address: REACTIVE_MIRROR_ADDRESS,
    });

    console.log(`\n✅ Transaction confirmed!`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`   New ReactiveMirror balance: ${formatEther(newBalance)} lReact`);
    console.log(`\n🎉 ReactiveMirror should now be ACTIVE!`);
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Wait 1-2 minutes for status to update on Reactive Scan`);
    console.log(`   2. Check Reactive Scan: https://reactivescan.io/`);
    console.log(`   3. Verify contract status shows "Active"`);
    console.log(`   4. Try updating price on Origin again`);
  } catch (error: any) {
    console.error("\n❌ Error funding contract:");
    console.error(error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
    process.exit(1);
  }
}

depositToReactiveMirror().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

