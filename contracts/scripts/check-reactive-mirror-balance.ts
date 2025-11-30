import { createPublicClient, http, formatEther } from "viem";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Quick script to check ReactiveMirror contract balance
 * 
 * Usage:
 * npx tsx scripts/check-reactive-mirror-balance.ts
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

async function checkBalance() {
  console.log("🔍 Checking ReactiveMirror Balance\n");
  console.log("=".repeat(60));
  console.log(`Contract: ${REACTIVE_MIRROR_ADDRESS}`);
  console.log(`Network: Reactive Network (Chain ID: 5318007)\n`);

  try {
    const balance = await publicClient.getBalance({
      address: REACTIVE_MIRROR_ADDRESS,
    });

    console.log(`💰 Balance: ${formatEther(balance)} lReact`);
    console.log(`   (Raw: ${balance.toString()} wei)`);

    if (balance === 0n) {
      console.log("\n⚠️  Balance is 0 - this is OK if:");
      console.log("   • The deposit was used to settle debt (contract is still Active)");
      console.log("   • Reactive Scan hasn't updated yet (can take a few minutes)");
      console.log("\n✅ If contract status is 'Active', it can execute callbacks!");
    } else {
      console.log("\n✅ Contract has balance and is ready to execute callbacks!");
    }
  } catch (error: any) {
    console.error("\n❌ Error checking balance:");
    console.error(error.message);
    process.exit(1);
  }
}

checkBalance().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});







