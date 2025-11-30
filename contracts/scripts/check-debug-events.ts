import { createPublicClient, http, decodeEventLog } from "viem";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Check debug events from a specific transaction
 */

const REACTIVE_MIRROR_ADDRESS = "0xc2D8C2A71631eb121Fd635c34c31CB5A4Ae8E40A" as `0x${string}`;
const TX_HASH = "0x58362df3e07e6993c9e1c2584244149aa8a8ecd74803c16b2df91d0f648a7271" as `0x${string}`;
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

// Debug event ABIs
const DebugEventsABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "step", type: "string" },
      { indexed: false, name: "value1", type: "uint256" },
      { indexed: false, name: "value2", type: "uint256" },
    ],
    name: "DebugStep",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "data", type: "bytes" },
      { indexed: false, name: "length", type: "uint256" },
    ],
    name: "DebugData",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "answer", type: "int256" },
      { indexed: false, name: "roundId", type: "uint256" },
      { indexed: false, name: "updatedAt", type: "uint256" },
    ],
    name: "DebugDecodeSuccess",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [],
    name: "DebugDecodeFailed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "chainId", type: "uint256" },
      { indexed: false, name: "destContract", type: "address" },
      { indexed: false, name: "gasLimit", type: "uint64" },
    ],
    name: "DebugCallbackEmitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "chain_id", type: "uint256" },
      { indexed: true, name: "_contract", type: "address" },
      { indexed: true, name: "gas_limit", type: "uint64" },
      { indexed: false, name: "payload", type: "bytes" },
    ],
    name: "Callback",
    type: "event",
  },
] as const;

async function checkDebugEvents() {
  console.log("🔍 Checking Debug Events from Transaction\n");
  console.log("=".repeat(60));
  console.log(`Transaction: ${TX_HASH}`);
  console.log(`Contract: ${REACTIVE_MIRROR_ADDRESS}\n`);

  try {
    // Try to get transaction receipt first
    let receipt;
    try {
      receipt = await publicClient.getTransactionReceipt({
        hash: TX_HASH,
      });
      console.log(`✅ Transaction found in block ${receipt.blockNumber}\n`);
    } catch {
      // If receipt not found, try getting logs from recent blocks
      console.log("⚠️  Transaction receipt not found, checking recent blocks...\n");
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock - 100n;
      
      const allLogs = await publicClient.getLogs({
        address: REACTIVE_MIRROR_ADDRESS,
        fromBlock,
        toBlock: currentBlock,
      });
      
      // Filter logs from this specific transaction
      const logs = allLogs.filter(
        (log) => log.transactionHash.toLowerCase() === TX_HASH.toLowerCase()
      );
      
      if (logs.length === 0) {
        console.log("❌ No events found for this transaction hash.");
        console.log("   This might be a ReactVM transaction that's not queryable via RPC.");
        console.log("   Check Reactive Scan directly for event logs.\n");
        return;
      }
      
      // Process logs (same as below)
      processLogs(logs);
      return;
    }

    // Get all logs from this transaction
    const logs = receipt.logs.filter(
      (log) => log.address.toLowerCase() === REACTIVE_MIRROR_ADDRESS.toLowerCase()
    );
    
    processLogs(logs);
  } catch (error: any) {
    console.error("\n❌ Error checking events:");
    console.error(error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
  }
  
  function processLogs(logs: any[]) {

    console.log(`📋 Found ${logs.length} event(s) from ReactiveMirror contract\n`);

    if (logs.length === 0) {
      console.log("❌ No events found from ReactiveMirror!");
      console.log("   This means react() might not have been called, or");
      console.log("   the function returned early before emitting any events.\n");
      return;
    }

    // Try to decode each log
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      console.log(`📋 Event #${i + 1}:`);
      console.log(`   Topics: ${log.topics.length}`);
      console.log(`   Data length: ${log.data.length} bytes`);

      // Try to decode as each debug event type
      let decoded = false;
      for (const eventABI of DebugEventsABI) {
        try {
          const decodedEvent = decodeEventLog({
            abi: [eventABI],
            data: log.data,
            topics: log.topics,
          });

          console.log(`   ✅ Decoded as: ${decodedEvent.eventName}`);
          
          if (decodedEvent.eventName === "DebugStep") {
            console.log(`      Step: ${decodedEvent.args.step}`);
            console.log(`      Value1: ${decodedEvent.args.value1}`);
            console.log(`      Value2: ${decodedEvent.args.value2}`);
          } else if (decodedEvent.eventName === "DebugData") {
            console.log(`      Data length: ${decodedEvent.args.length} bytes`);
            console.log(`      Data (first 32 bytes): ${decodedEvent.args.data.slice(0, 66)}...`);
          } else if (decodedEvent.eventName === "DebugDecodeSuccess") {
            console.log(`      Answer: ${decodedEvent.args.answer}`);
            console.log(`      RoundId: ${decodedEvent.args.roundId}`);
            console.log(`      UpdatedAt: ${decodedEvent.args.updatedAt}`);
          } else if (decodedEvent.eventName === "DebugDecodeFailed") {
            console.log(`      ❌ DECODE FAILED!`);
          } else if (decodedEvent.eventName === "DebugCallbackEmitted") {
            console.log(`      ChainId: ${decodedEvent.args.chainId}`);
            console.log(`      DestContract: ${decodedEvent.args.destContract}`);
            console.log(`      GasLimit: ${decodedEvent.args.gasLimit}`);
          } else if (decodedEvent.eventName === "Callback") {
            console.log(`      ✅ CALLBACK EVENT EMITTED!`);
            console.log(`      ChainId: ${decodedEvent.args.chain_id}`);
            console.log(`      DestContract: ${decodedEvent.args._contract}`);
            console.log(`      GasLimit: ${decodedEvent.args.gas_limit}`);
            console.log(`      Payload length: ${decodedEvent.args.payload.length} bytes`);
          }
          
          decoded = true;
          break;
        } catch (e) {
          // Try next event type
          continue;
        }
      }

      if (!decoded) {
        console.log(`   ⚠️  Could not decode event`);
        console.log(`      Topic 0: ${log.topics[0]}`);
      }

      console.log("");
    }

    // Summary
    const eventNames = logs
      .map((log) => {
        for (const eventABI of DebugEventsABI) {
          try {
            const decoded = decodeEventLog({
              abi: [eventABI],
              data: log.data,
              topics: log.topics,
            });
            return decoded.eventName;
          } catch {
            continue;
          }
        }
        return "Unknown";
      })
      .filter((name) => name !== "Unknown");

    console.log("📊 Summary:");
    console.log(`   Events found: ${eventNames.join(", ")}`);

    if (eventNames.includes("DebugDecodeFailed")) {
      console.log("\n❌ ROOT CAUSE: Decode failed!");
      console.log("   The event data from MockFeed doesn't match expected format.");
    } else if (eventNames.includes("DebugDecodeSuccess") && !eventNames.includes("Callback")) {
      console.log("\n⚠️  Decode succeeded but Callback not emitted!");
      console.log("   Check if payload encoding or Callback emission failed.");
    } else if (eventNames.includes("Callback")) {
      console.log("\n✅ Callback event WAS emitted!");
      console.log("   But Reactive Network shows 'No Callbacks'.");
      console.log("   This means Reactive Network detected but didn't process it.");
      console.log("   Possible reasons: payment issue, invalid destination, or network issue.");
    }
  }
}

checkDebugEvents().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

