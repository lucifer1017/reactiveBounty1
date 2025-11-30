import { createPublicClient, http, formatEther } from "viem";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Diagnostic script to check FeedProxy state and potential callback issues
 */

const FEED_PROXY_ADDRESS = "0xae7bFF837C0E6Df30c337CDaA0f2E46f32309D57" as `0x${string}`;
const SEPOLIA_RPC = process.env.DEST_RPC_URL || "https://rpc.sepolia.org";

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
    name: "DOMAIN_SEPARATOR",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
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

async function diagnose() {
  console.log("🔍 Diagnosing FeedProxy Callback Issues\n");
  console.log("=".repeat(60));

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(SEPOLIA_RPC),
  });

  try {
    // 1. Check current state
    console.log("\n📊 FeedProxy Current State:");
    const latestRound = await publicClient.readContract({
      address: FEED_PROXY_ADDRESS,
      abi: FeedProxyABI,
      functionName: "latestRoundData",
    });

    console.log(`   Round ID: ${latestRound[0]}`);
    console.log(`   Price: ${latestRound[1]}`);
    console.log(`   Started At: ${new Date(Number(latestRound[2]) * 1000).toISOString()}`);
    console.log(`   Updated At: ${new Date(Number(latestRound[3]) * 1000).toISOString()}`);
    console.log(`   Answered In Round: ${latestRound[4]}`);

    // 2. Check configuration
    console.log("\n⚙️  FeedProxy Configuration:");
    const reactiveVmId = await publicClient.readContract({
      address: FEED_PROXY_ADDRESS,
      abi: FeedProxyABI,
      functionName: "reactiveVmId",
    });
    console.log(`   ReactiveVM ID: ${reactiveVmId}`);
    console.log(`   Expected: 0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5`);
    console.log(`   Match: ${reactiveVmId.toLowerCase() === "0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5" ? "✅" : "❌"}`);

    const domainSeparator = await publicClient.readContract({
      address: FEED_PROXY_ADDRESS,
      abi: FeedProxyABI,
      functionName: "DOMAIN_SEPARATOR",
    });
    console.log(`   Domain Separator: ${domainSeparator}`);

    // 3. Check for recent events
    console.log("\n📡 Checking for Recent PriceUpdated Events...");
    const currentBlock = await publicClient.getBlockNumber();
    const fromBlock = currentBlock - 1000n; // Last ~1000 blocks

    const events = await publicClient.getLogs({
      address: FEED_PROXY_ADDRESS,
      event: {
        type: "event",
        name: "PriceUpdated",
        inputs: [
          { indexed: false, name: "roundId", type: "uint80" },
          { indexed: false, name: "answer", type: "int256" },
          { indexed: false, name: "startedAt", type: "uint256" },
          { indexed: false, name: "updatedAt", type: "uint256" },
          { indexed: false, name: "answeredInRound", type: "uint80" },
        ],
      },
      fromBlock,
      toBlock: currentBlock,
    });

    console.log(`   Found ${events.length} PriceUpdated events in last ~1000 blocks`);
    if (events.length > 0) {
      const latestEvent = events[events.length - 1];
      console.log(`   Latest event at block: ${latestEvent.blockNumber}`);
      console.log(`   Latest event roundId: ${latestEvent.args.roundId}`);
    }

    // 4. Potential issues
    console.log("\n⚠️  Potential Issues:");
    console.log("   1. ReactiveMirror balance is 0 - may need funding for callbacks");
    console.log("   2. Gas limit (500000) might be insufficient");
    console.log("   3. Callback might be reverting due to validation checks");
    console.log("   4. Network latency - callbacks can take 1-5 minutes");

    console.log("\n💡 Recommendations:");
    console.log("   1. Fund ReactiveMirror with more lReact tokens");
    console.log("   2. Increase CALLBACK_GAS_LIMIT in ReactiveMirror");
    console.log("   3. Check Reactive Network explorer for callback status");
    console.log("   4. Wait a few minutes and check again");

  } catch (error: any) {
    console.error("\n❌ Error during diagnosis:");
    console.error(error.message);
  }
}

diagnose().catch(console.error);





