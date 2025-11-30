import { createPublicClient, http, formatEther } from "viem";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Check FeedProxy state on Sepolia
 * 
 * This script helps diagnose why callbacks might be failing
 */

const FEED_PROXY_ADDRESS = "0xae7bFF837C0E6Df30c337CDaA0f2E46f32309D57" as `0x${string}`;
const SEPOLIA_RPC = process.env.DEST_RPC_URL || `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`;

const FeedProxyABI = [
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "", type: "uint80" },
      { internalType: "int256", name: "", type: "int256" },
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint80", name: "", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "reactiveVmId",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRound",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

async function checkFeedProxyState() {
  console.log("🔍 Checking FeedProxy State on Sepolia\n");
  console.log("=".repeat(60));

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(SEPOLIA_RPC),
  });

  try {
    // Check latest round data
    const roundData = await publicClient.readContract({
      address: FEED_PROXY_ADDRESS,
      abi: FeedProxyABI,
      functionName: "latestRoundData",
    });

    console.log("\n📊 Latest Round Data:");
    console.log(`   Round ID: ${roundData[0]}`);
    console.log(`   Price: ${roundData[1]} (${Number(roundData[1]) / 1e8})`);
    console.log(`   Started At: ${new Date(Number(roundData[2]) * 1000).toISOString()}`);
    console.log(`   Updated At: ${new Date(Number(roundData[3]) * 1000).toISOString()}`);
    console.log(`   Answered In Round: ${roundData[4]}`);

    // Check reactiveVmId
    const reactiveVmId = await publicClient.readContract({
      address: FEED_PROXY_ADDRESS,
      abi: FeedProxyABI,
      functionName: "reactiveVmId",
    });

    console.log("\n🔑 Configuration:");
    console.log(`   ReactiveVM ID: ${reactiveVmId}`);
    console.log(`   Expected: 0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5`);
    console.log(`   Match: ${reactiveVmId.toLowerCase() === "0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5".toLowerCase() ? "✅" : "❌"}`);

    // Check latestRound struct directly
    const latestRound = await publicClient.readContract({
      address: FEED_PROXY_ADDRESS,
      abi: FeedProxyABI,
      functionName: "latestRound",
    });

    console.log("\n📋 Latest Round Struct:");
    console.log(`   Round ID: ${latestRound.roundId}`);
    console.log(`   Answer: ${latestRound.answer}`);
    console.log(`   Started At: ${latestRound.startedAt}`);
    console.log(`   Updated At: ${latestRound.updatedAt}`);
    console.log(`   Answered In Round: ${latestRound.answeredInRound}`);

    // Check if price is stale
    const now = Math.floor(Date.now() / 1000);
    const age = now - Number(latestRound.updatedAt);
    console.log(`\n⏰ Price Age: ${age} seconds (${(age / 60).toFixed(1)} minutes)`);

    if (age > 300) {
      console.log("   ⚠️  Price is more than 5 minutes old - might be stale");
    }

    console.log("\n" + "=".repeat(60));
    console.log("\n💡 Diagnostic Info:");
    console.log("   If price is not updating, possible reasons:");
    console.log("   1. Callback not reaching FeedProxy (check Reactive Network logs)");
    console.log("   2. Authorization failure (sender != reactiveVmId)");
    console.log("   3. Domain separator mismatch");
    console.log("   4. Stale price check failing (_updatedAt <= latestRound.updatedAt)");
    console.log("   5. Gas limit too low (500000 might not be enough)");
    console.log("   6. Callback still processing (can take 1-2 minutes)");

  } catch (error: any) {
    console.error("\n❌ Error checking FeedProxy state:");
    console.error(error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
    process.exit(1);
  }
}

checkFeedProxyState().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});


