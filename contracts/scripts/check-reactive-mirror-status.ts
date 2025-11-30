import { createPublicClient, http, formatEther } from "viem";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Comprehensive status check for ReactiveMirror contract
 * Checks balance, debt, and reserves via System Contract
 */

const REACTIVE_MIRROR_ADDRESS = "0x8dc634d4D6e290c9C04E9b64F9D68e5e5DCA6742" as `0x${string}`;
const SYSTEM_CONTRACT = "0x0000000000000000000000000000000000fffFfF" as `0x${string}`;
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

const SystemContractABI = [
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

async function checkStatus() {
  console.log("🔍 Comprehensive ReactiveMirror Status Check\n");
  console.log("=".repeat(60));
  console.log(`Contract: ${REACTIVE_MIRROR_ADDRESS}`);
  console.log(`System Contract: ${SYSTEM_CONTRACT}`);
  console.log(`Network: Reactive Network (Chain ID: 5318007)\n`);

  try {
    // 1. Check contract balance
    console.log("📊 Contract Balance:");
    const balance = await publicClient.getBalance({
      address: REACTIVE_MIRROR_ADDRESS,
    });
    console.log(`   Balance: ${formatEther(balance)} lReact`);
    console.log(`   (Raw: ${balance.toString()} wei)\n`);

    // 2. Check debt (amount owed to system contract)
    console.log("💳 Contract Debt:");
    const debt = await publicClient.readContract({
      address: SYSTEM_CONTRACT,
      abi: SystemContractABI,
      functionName: "debts",
      args: [REACTIVE_MIRROR_ADDRESS],
    });
    console.log(`   Debt: ${formatEther(debt)} lReact`);
    console.log(`   (Raw: ${debt.toString()} wei)\n`);

    // 3. Check reserves (amount held by system contract for this contract)
    console.log("💰 Contract Reserves:");
    const reserves = await publicClient.readContract({
      address: SYSTEM_CONTRACT,
      abi: SystemContractABI,
      functionName: "reserves",
      args: [REACTIVE_MIRROR_ADDRESS],
    });
    console.log(`   Reserves: ${formatEther(reserves)} lReact`);
    console.log(`   (Raw: ${reserves.toString()} wei)\n`);

    // 4. Summary
    console.log("📋 Summary:");
    const netBalance = balance + reserves - debt;
    console.log(`   Net Available: ${formatEther(netBalance)} lReact`);
    console.log(`   (Balance + Reserves - Debt)`);

    if (debt > 0n) {
      console.log(`\n⚠️  Contract has outstanding debt of ${formatEther(debt)} lReact`);
      console.log(`   This needs to be settled before callbacks can execute.`);
    } else if (reserves > 0n) {
      console.log(`\n✅ Contract has ${formatEther(reserves)} lReact in reserves`);
      console.log(`   This should be available for callback execution.`);
    } else if (balance > 0n) {
      console.log(`\n✅ Contract has ${formatEther(balance)} lReact balance`);
      console.log(`   This should be available for callback execution.`);
    } else {
      console.log(`\n⚠️  Contract has no available funds (balance, reserves, or debt settlement)`);
      console.log(`   Callbacks may not execute without funding.`);
    }

  } catch (error: any) {
    console.error("\n❌ Error checking status:");
    console.error(error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
    process.exit(1);
  }
}

checkStatus().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

