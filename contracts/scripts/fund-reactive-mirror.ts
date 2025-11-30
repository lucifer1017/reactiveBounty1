import { createWalletClient, http, formatEther, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Script to fund ReactiveMirror contract on Reactive Network
 * 
 * This script:
 * 1. Sends REACT tokens directly to ReactiveMirror
 * 2. Settles any outstanding debt using coverDebt()
 * 
 * Usage:
 * npx tsx scripts/fund-reactive-mirror.ts
 */

const REACTIVE_MIRROR_ADDRESS = "0x63194c2C46EE67f5702f9D877e125B992b90f41e" as `0x${string}`;
// Note: Update this address if you deployed a new ReactiveMirror
const SYSTEM_CONTRACT = "0x0000000000000000000000000000000000fffFfF" as `0x${string}`;
const REACTIVE_RPC = process.env.REACTIVE_RPC_URL;

if (!REACTIVE_RPC) {
  console.error("REACTIVE_RPC_URL not found in .env");
  process.exit(1);
}

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error("PRIVATE_KEY not found in .env");
  process.exit(1);
}

const account = privateKeyToAccount(`0x${privateKey}` as `0x${string}`);

const walletClient = createWalletClient({
  account,
  chain: {
    id: 5318007,
    name: "Reactive Network",
    network: "reactive",
    nativeCurrency: {
      decimals: 18,
      name: "REACT",
      symbol: "REACT",
    },
    rpcUrls: {
      default: {
        http: [REACTIVE_RPC],
      },
    },
  },
  transport: http(REACTIVE_RPC),
});

async function fundReactiveMirror() {
  console.log("🔧 Funding ReactiveMirror Contract...\n");

  // Check current balance
  const balance = await walletClient.getBalance({
    address: REACTIVE_MIRROR_ADDRESS,
  });

  console.log(`Current ReactiveMirror balance: ${formatEther(balance)} REACT`);

  // Amount to send (0.1 REACT should be enough for multiple transactions)
  const amountToSend = parseEther("0.1");

  console.log(`\n📤 Sending ${formatEther(amountToSend)} REACT to ReactiveMirror...`);

  // Send REACT directly to contract
  const hash = await walletClient.sendTransaction({
    to: REACTIVE_MIRROR_ADDRESS,
    value: amountToSend,
  });

  console.log(`Transaction hash: ${hash}`);
  console.log("Waiting for confirmation...");

  // Wait for transaction
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Check new balance
  const newBalance = await walletClient.getBalance({
    address: REACTIVE_MIRROR_ADDRESS,
  });

  console.log(`\n✅ New ReactiveMirror balance: ${formatEther(newBalance)} REACT`);

  // Note: Using depositTo() on system contract automatically settles debt
  // If you sent directly to contract, you may need to call coverDebt() separately
  // Check Reactive Scan to see if contract is now active

  console.log("\n✅ ReactiveMirror should now be active!");
  console.log("Check Reactive Scan to verify contract status.");
}

fundReactiveMirror().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

