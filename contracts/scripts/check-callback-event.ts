import { createPublicClient, http, decodeEventLog } from "viem";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Check if Callback event is being emitted correctly in RVM transactions
 */

const REACTIVE_MIRROR_ADDRESS = "0x63194c2C46EE67f5702f9D877e125B992b90f41e" as `0x${string}`;
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

async function checkCallbackEvents() {
  console.log("🔍 Checking Callback Events in Recent Transactions\n");
  console.log("=".repeat(60));
  console.log(`Contract: ${REACTIVE_MIRROR_ADDRESS}\n`);

  try {
    // Get recent blocks
    const currentBlock = await publicClient.getBlockNumber();
    const fromBlock = currentBlock - 100n; // Last 100 blocks

    console.log(`📊 Scanning blocks ${fromBlock} to ${currentBlock}...\n`);

    // Get logs for Callback events
    const logs = await publicClient.getLogs({
      address: REACTIVE_MIRROR_ADDRESS,
      event: CallbackEventABI,
      fromBlock,
      toBlock: currentBlock,
    });

    console.log(`✅ Found ${logs.length} Callback event(s)\n`);

    if (logs.length === 0) {
      console.log("⚠️  No Callback events found in recent transactions!");
      console.log("   This means the Callback event is NOT being emitted.");
      console.log("   Check the react() function logic.\n");
      return;
    }

    // Decode and display each callback
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      console.log(`📋 Callback Event #${i + 1}:`);
      console.log(`   Block: ${log.blockNumber}`);
      console.log(`   Transaction: ${log.transactionHash}`);
      console.log(`   Chain ID: ${log.args.chain_id}`);
      console.log(`   Destination Contract: ${log.args._contract}`);
      console.log(`   Gas Limit: ${log.args.gas_limit}`);
      console.log(`   Payload Length: ${log.args.payload.length} bytes`);
      
      // Try to decode the payload
      try {
        // The payload should be: updatePrice(address,bytes32,uint80,int256,uint256,uint256,uint80)
        // First 4 bytes are function selector
        const selector = log.args.payload.slice(0, 4);
        console.log(`   Function Selector: ${selector}`);
        
        if (selector === "0x" + "updatePrice(address,bytes32,uint80,int256,uint256,uint256,uint80)".slice(2, 10).padStart(8, "0")) {
          console.log(`   ✅ Function selector matches updatePrice`);
        } else {
          console.log(`   ⚠️  Function selector doesn't match expected updatePrice`);
        }
      } catch (e) {
        console.log(`   ⚠️  Could not decode payload`);
      }
      
      console.log("");
    }

    // Check if callbacks are being processed
    if (logs.length > 0) {
      console.log("💡 Analysis:");
      console.log("   ✅ Callback events ARE being emitted");
      console.log("   ⚠️  But Reactive Network shows 'N/A' for callbacks");
      console.log("   This suggests Reactive Network is detecting the events");
      console.log("   but NOT processing them for some reason.\n");
      console.log("   Possible causes:");
      console.log("   1. Invalid destination chain ID");
      console.log("   2. Invalid destination contract address");
      console.log("   3. Payload encoding issue");
      console.log("   4. Reactive Network internal validation failure");
    }

  } catch (error: any) {
    console.error("\n❌ Error checking callback events:");
    console.error(error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
  }
}

checkCallbackEvents().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});



