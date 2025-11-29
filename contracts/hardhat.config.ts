import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";
import "dotenv/config";


export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.20",
      },
      production: {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("DEST_RPC_URL"),
      accounts: [configVariable("PRIVATE_KEY")],
    },
    polygonAmoy: {
      type: "http",
      chainId: 80002,
      url: configVariable("ORIGIN_RPC_URL"),
      accounts: [configVariable("PRIVATE_KEY")],
      // Polygon Amoy testnet typically uses very low gas prices
      // Let Hardhat auto-estimate, but set a reasonable max
      gasPrice: 6000000000, // 1 gwei (very low for testnet)
    },
    reactiveVm: {
      type: "http",
      chainId: 5318007,
      url: configVariable("REACTIVE_RPC_URL"),
      accounts: [configVariable("PRIVATE_KEY")],
    },
  },
});
