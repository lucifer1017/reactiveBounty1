import { createPublicClient, http, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";

dotenv.config();

async function checkBalance() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("PRIVATE_KEY not found in environment variables");
    process.exit(1);
  }

  const account = privateKeyToAccount(`0x${privateKey}` as `0x${string}`);
  const rpcUrl = process.env.ORIGIN_RPC_URL;
  
  if (!rpcUrl) {
    console.error("ORIGIN_RPC_URL not found in environment variables");
    process.exit(1);
  }

  const publicClient = createPublicClient({
    chain: {
      id: 80002,
      name: "Polygon Amoy",
      network: "polygon-amoy",
      nativeCurrency: {
        decimals: 18,
        name: "POL",
        symbol: "POL",
      },
      rpcUrls: {
        default: {
          http: [rpcUrl],
        },
      },
    },
    transport: http(rpcUrl),
  });

  const balance = await publicClient.getBalance({
    address: account.address,
  });

  // Get current gas price
  const gasPrice = await publicClient.getGasPrice();
  
  console.log(`Account: ${account.address}`);
  console.log(`Balance: ${formatEther(balance)} POL`);
  console.log(`Balance (wei): ${balance.toString()}`);
  console.log(`Current Gas Price: ${formatEther(gasPrice)} POL per gas (${gasPrice.toString()} wei)`);
  
  // Estimate gas needed for a typical contract deployment (200k - 2M gas)
  const minGasNeeded = 200000n;
  const maxGasNeeded = 2000000n;
  const minCost = minGasNeeded * gasPrice;
  const maxCost = maxGasNeeded * gasPrice;
  
  console.log(`\nEstimated deployment costs:`);
  console.log(`  Minimum (200k gas): ${formatEther(minCost)} POL`);
  console.log(`  Maximum (2M gas): ${formatEther(maxCost)} POL`);
  
  if (balance === 0n) {
    console.error("\n❌ Account has zero balance! You need POL to deploy contracts.");
    console.log("Get testnet POL from: https://faucet.polygon.technology/");
  } else if (balance < minCost) {
    console.error(`\n❌ Insufficient balance! Need at least ${formatEther(minCost)} POL for deployment.`);
    console.log(`Current balance: ${formatEther(balance)} POL`);
    console.log(`Shortfall: ${formatEther(minCost - balance)} POL`);
    console.log("Get testnet POL from: https://faucet.polygon.technology/");
  } else if (balance < maxCost) {
    console.warn(`\n⚠️  Balance might be sufficient, but close to the limit.`);
    console.log(`Current: ${formatEther(balance)} POL, Recommended: ${formatEther(maxCost)} POL`);
  } else {
    console.log("\n✅ Account has sufficient balance for deployment.");
  }
}

checkBalance().catch((error) => {
  console.error("Error checking balance:", error);
  process.exit(1);
});

