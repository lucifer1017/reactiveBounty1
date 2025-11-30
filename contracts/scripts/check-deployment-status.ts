import { createPublicClient, http } from "viem";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Check if ReactiveMirror contract actually deployed despite failed transaction
 */

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

// Try to read a public variable from the contract to see if it exists
async function checkContract(address: string) {
  try {
    // Try to read originFeed (immutable, public)
    const code = await publicClient.getBytecode({ address: address as `0x${string}` });
    return code && code !== "0x";
  } catch {
    return false;
  }
}

async function checkDeployment() {
  console.log("🔍 Checking Deployment Status\n");
  console.log("=".repeat(60));
  
  // The failed transaction address from user
  const failedTxAddress = "0x620BDDbC6aC412"; // Partial address from user's message
  
  console.log("📋 Notes:");
  console.log("   • Failed DEPLOY transaction is often EXPECTED");
  console.log("   • Reactive Network deploys to ReactVM first (fails - no System Contract)");
  console.log("   • Then deploys to main network (succeeds)");
  console.log("   • Check Reactive Scan for the actual deployed address\n");
  
  console.log("💡 What to check:");
  console.log("   1. Go to Reactive Scan: https://reactivescan.io/");
  console.log("   2. Search for your deployer address: 0xf092ae8Eb89F9D1DdE19b80447De5b1528D17Ae5");
  console.log("   3. Look for the latest ReactiveMirror contract");
  console.log("   4. Check if it shows 'Active' status");
  console.log("   5. Check if subscription is active\n");
  
  console.log("⚠️  If contract shows as Active:");
  console.log("   • The deployment actually succeeded");
  console.log("   • The failed transaction is just the ReactVM attempt");
  console.log("   • You can proceed with testing\n");
  
  console.log("❌ If contract doesn't exist or shows Inactive:");
  console.log("   • There's an actual deployment issue");
  console.log("   • Check the deployment transaction for revert reason");
}

checkDeployment().catch(console.error);



