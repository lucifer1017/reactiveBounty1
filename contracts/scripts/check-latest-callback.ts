import { createPublicClient, http, decodeEventLog } from "viem";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Check if Callback event was actually emitted in the latest RVM transaction
 */

const REACTIVE_MIRROR_ADDRESS = "0x1d3EafEf3DCa8457Fb3a2923Ac24eF5950415Ba1" as `0x${string}`;
const REACTIVE_RPC = process.env.REACTIVE_RPC_URL;

if (!REACTIVE_RPC) {
  console.error("❌ REACTIVE_RPC_URL not found in .env");
  process.exit(1);
}

const reactiveChain = {
  id: 5318007,
  name: "Reactive Network",
  network: "reactive",
  nativeCurrency: {
    decimals: 18,
    name: "REACT",
    symbol: "lReact",
  },
  rpcUrls: {
    default: {
      http: [REACTIVE_RPC],
    },
  },
};

const publicClient = createPublicClient({
  chain: reactiveChain,
  transport: http(REACTIVE_RPC),
});

// Callback event ABI
const CallbackEventABI = {
  anonymous: false,
  inputs: [
    { indexed: true, name: "chain_id", type: "uint256" },
    { indexed: true, name: "_contract", type: "address" },
    { indexed: true, name: "gas_limit", type: "uint64" },
    { indexed: false, name: "payload", type: "bytes" },
  ],
  name: "Callback",
  type: "event",
} as const;

async function checkLatestCallback() {
  console.log("🔍 Checking Latest RVM Transaction for Callback Event\n");
  console.log("=".repeat(60));
  console.log(`Contract: ${REACTIVE_MIRROR_ADDRESS}\n`);

  try {
    // Get the latest transaction hash from the user's info
    // Transaction #10: 0x17bc6a...daf30b49
    const txHash = "0x17bc6adaf30b49" as `0x${string}`; // Partial hash, need full
    
    // Get recent blocks
    const currentBlock = await publicClient.getBlockNumber();
    const fromBlock = currentBlock - 50n; // Last 50 blocks

    console.log(`📊 Scanning blocks ${fromBlock} to ${currentBlock}...\n`);

    // Get all logs from this contract
    const logs = await publicClient.getLogs({
      address: REACTIVE_MIRROR_ADDRESS,
      fromBlock,
      toBlock: currentBlock,
    });

    console.log(`📋 Found ${logs.length} total event(s) from contract\n`);

    // Filter for Callback events
    const callbackLogs = logs.filter(log => {
      try {
        const decoded = decodeEventLog({
          abi: [CallbackEventABI],
          data: log.data,
          topics: log.topics,
        });
        return decoded.eventName === "Callback";
      } catch {
        return false;
      }
    });

    console.log(`✅ Found ${callbackLogs.length} Callback event(s)\n`);

    if (callbackLogs.length === 0) {
      console.log("❌ CRITICAL: No Callback events found!");
      console.log("   This means the Callback event is NOT being emitted.");
      console.log("   Possible causes:");
      console.log("   1. Early return in react() before emit Callback");
      console.log("   2. Validation failing (chain_id, contract, topic_0 mismatch)");
      console.log("   3. log.data.length < 96 check failing");
      console.log("   4. Event not in transaction trace (ReactVM vs RNK issue)");
    } else {
      for (let i = 0; i < callbackLogs.length; i++) {
        const log = callbackLogs[i];
        try {
          const decoded = decodeEventLog({
            abi: [CallbackEventABI],
            data: log.data,
            topics: log.topics,
          });
          
          console.log(`📋 Callback Event #${i + 1}:`);
          console.log(`   Block: ${log.blockNumber}`);
          console.log(`   Transaction: ${log.transactionHash}`);
          console.log(`   Chain ID: ${decoded.args.chain_id}`);
          console.log(`   Destination Contract: ${decoded.args._contract}`);
          console.log(`   Gas Limit: ${decoded.args.gas_limit}`);
          console.log(`   Payload Length: ${decoded.args.payload.length} bytes`);
          console.log("");
        } catch (e) {
          console.log(`   ⚠️  Could not decode event`);
        }
      }
      
      console.log("💡 Analysis:");
      console.log("   ✅ Callback events ARE being emitted");
      console.log("   ⚠️  But Reactive Network shows 'N/A' - not processing them");
      console.log("   This suggests Reactive Network is detecting but rejecting callbacks");
      console.log("   Possible reasons:");
      console.log("   1. Insufficient funds (but we have 0.5 lReact in reserves)");
      console.log("   2. Invalid destination chain ID or contract address");
      console.log("   3. Payload encoding issue");
      console.log("   4. Reactive Network internal validation failure");
      console.log("   5. Contract not properly implementing payment mechanism");
    }

    // Also check all events to see what's being emitted
    console.log("\n📋 All Events from Contract:");
    for (const log of logs.slice(0, 10)) {
      console.log(`   Block ${log.blockNumber}: ${log.topics[0]?.slice(0, 10)}... (${log.topics.length} topics)`);
    }

  } catch (error: any) {
    console.error("\n❌ Error checking callback events:");
    console.error(error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
  }
}

checkLatestCallback().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});



