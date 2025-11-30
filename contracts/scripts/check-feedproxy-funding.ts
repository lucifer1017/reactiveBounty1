import { createPublicClient, http, formatEther } from "viem";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Check if FeedProxy on Sepolia needs funding for callbacks
 */

const FEED_PROXY_ADDRESS = "0xae7bFF837C0E6Df30c337CDaA0f2E46f32309D57" as `0x${string}`;
const CALLBACK_PROXY = "0xc9f36411C9897e7F959D99ffca2a0Ba7ee0D7bDA" as `0x${string}`;
const SEPOLIA_RPC = process.env.DEST_RPC_URL || "https://rpc.sepolia.org";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(SEPOLIA_RPC),
});

const CallbackProxyABI = [
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "debts",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "reserves",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

async function checkFeedProxyFunding() {
  console.log("🔍 Checking FeedProxy Funding Status on Sepolia\n");
  console.log("=".repeat(60));
  console.log(`FeedProxy: ${FEED_PROXY_ADDRESS}`);
  console.log(`Callback Proxy: ${CALLBACK_PROXY}`);
  console.log(`Network: Ethereum Sepolia (Chain ID: 11155111)\n`);

  try {
    // 1. Check FeedProxy balance
    console.log("📊 FeedProxy Balance:");
    const balance = await publicClient.getBalance({
      address: FEED_PROXY_ADDRESS,
    });
    console.log(`   Balance: ${formatEther(balance)} ETH`);
    console.log(`   (Raw: ${balance.toString()} wei)\n`);

    // 2. Check debt (amount owed to callback proxy)
    console.log("💳 FeedProxy Debt:");
    const debt = await publicClient.readContract({
      address: CALLBACK_PROXY,
      abi: CallbackProxyABI,
      functionName: "debts",
      args: [FEED_PROXY_ADDRESS],
    });
    console.log(`   Debt: ${formatEther(debt)} ETH`);
    console.log(`   (Raw: ${debt.toString()} wei)\n`);

    // 3. Check reserves (amount held by callback proxy for FeedProxy)
    console.log("💰 FeedProxy Reserves:");
    const reserves = await publicClient.readContract({
      address: CALLBACK_PROXY,
      abi: CallbackProxyABI,
      functionName: "reserves",
      args: [FEED_PROXY_ADDRESS],
    });
    console.log(`   Reserves: ${formatEther(reserves)} ETH`);
    console.log(`   (Raw: ${reserves.toString()} wei)\n`);

    // 4. Summary
    console.log("📋 Summary:");
    const netAvailable = balance + reserves - debt;
    console.log(`   Net Available: ${formatEther(netAvailable)} ETH`);
    console.log(`   (Balance + Reserves - Debt)\n`);

    if (debt > 0n) {
      console.log("⚠️  FeedProxy has outstanding debt!");
      console.log("   This needs to be settled before callbacks can execute.");
      console.log("   Fund FeedProxy via Callback Proxy depositTo() method.\n");
    } else if (reserves === 0n && balance === 0n) {
      console.log("❌ CRITICAL: FeedProxy has NO funds!");
      console.log("   According to Reactive Network docs:");
      console.log("   'Callbacks require the same payment mechanism as reactive transactions'");
      console.log("   FeedProxy needs ETH on Sepolia to pay for callback execution.\n");
      console.log("💡 Solution:");
      console.log("   Fund FeedProxy using Callback Proxy depositTo() method:");
      console.log(`   cast send --rpc-url $SEPOLIA_RPC --private-key $PRIVATE_KEY \\`);
      console.log(`     ${CALLBACK_PROXY} "depositTo(address)" ${FEED_PROXY_ADDRESS} --value 0.1ether\n`);
    } else {
      console.log("✅ FeedProxy has funds available for callbacks.");
    }

  } catch (error: any) {
    console.error("\n❌ Error checking FeedProxy funding:");
    console.error(error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
  }
}

checkFeedProxyFunding().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});



