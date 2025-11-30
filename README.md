# Cross-Chain Oracle - Reactive Network Bounty

A production-grade implementation of a cross-chain price feed oracle that mirrors Chainlink price data from Polygon Amoy to Ethereum Sepolia using Reactive Network's Reactive Contracts.

## Overview

This project implements a cross-chain oracle that:
- Monitors price updates from a MockFeed contract on Polygon Amoy (origin chain)
- Uses Reactive Network's Reactive Contracts to automatically detect and process price update events
- Mirrors price data to a FeedProxy contract on Ethereum Sepolia (destination chain)
- Provides a Chainlink-compatible `AggregatorV3Interface` on Sepolia where native Chainlink feeds may not be available

### Architecture

```
Polygon Amoy (Origin)
    └── MockFeed
            │ Emits AnswerUpdated events
            │
            ▼
Reactive Network
    └── ReactiveMirror (Reactive Contract)
            │ Subscribes to MockFeed events
            │ Processes via react()
            │ Emits Callback events
            │
            ▼
Ethereum Sepolia (Destination)
    └── FeedProxy
            │ Receives callbacks via Callback Proxy
            │ Updates price data
            │ Exposes AggregatorV3Interface
```

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MetaMask** or compatible Web3 wallet
- **Testnet Tokens:**
  - Polygon Amoy MATIC (for deploying MockFeed)
  - Reactive Network lReact (for deploying and funding ReactiveMirror)
  - Ethereum Sepolia ETH (for deploying and funding FeedProxy)

## Environment Variables

Create a `.env` file in the `contracts` directory with the following variables:

```env
# Private key of the account that will deploy all contracts
# IMPORTANT: This account must have funds on all three networks
PRIVATE_KEY=your_private_key_here

# RPC URLs for each network
ORIGIN_RPC_URL=https://rpc-amoy.polygon.technology
DEST_RPC_URL=https://rpc.sepolia.org
REACTIVE_RPC_URL=https://rpc.lasna.reactive.network

# Optional: Custom deposit amounts (defaults shown)
DEPOSIT_AMOUNT=0.5  # For ReactiveMirror (in lReact)
```

For the frontend, create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_ORIGIN_RPC_URL=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_DEST_RPC_URL=https://rpc.sepolia.org
```

## Installation

### 1. Install Contract Dependencies

```bash
cd contracts
npm install
```

### 2. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Deployment

**CRITICAL:** Contracts must be deployed in the following order due to dependencies:

### Step 1: Deploy MockFeed (Polygon Amoy)

Deploy the MockFeed contract on Polygon Amoy:

```bash
cd contracts
npx hardhat ignition deploy ignition/modules/MockFeed.ts --network polygonAmoy
```

**After deployment:**
1. Copy the deployed MockFeed address from the output
2. Update `ignition/modules/ReactiveMirror.ts` with the MockFeed address (line 21)

### Step 2: Deploy FeedProxy (Ethereum Sepolia)

Deploy the FeedProxy contract on Ethereum Sepolia:

```bash
npx hardhat ignition deploy ignition/modules/FeedProxy.ts --network sepolia
```

**After deployment:**
1. Copy the deployed FeedProxy address from the output
2. Update `ignition/modules/ReactiveMirror.ts` with the FeedProxy address (line 24)

**Important:** The `reactiveVmId` in `FeedProxy.ts` (line 22) must match the address that will deploy ReactiveMirror. This is the deployer's address on Reactive Network.

### Step 3: Deploy ReactiveMirror (Reactive Network)

Before deploying, ensure you have:
1. Updated the MockFeed address in `ReactiveMirror.ts` (from Step 1)
2. Updated the FeedProxy address in `ReactiveMirror.ts` (from Step 2)

Deploy the ReactiveMirror contract on Reactive Network:

```bash
npx hardhat ignition deploy ignition/modules/ReactiveMirror.ts --network reactiveVm
```

**Important Notes:**
- The deployer address of ReactiveMirror MUST match the `reactiveVmId` used in FeedProxy
- After deployment, the contract will automatically subscribe to MockFeed events
- Check [Reactive Scan](https://lasna.reactscan.net) to verify the contract is deployed and subscription is active

## Funding Contracts

Both ReactiveMirror and FeedProxy require funding to execute callbacks.

### Fund ReactiveMirror (Reactive Network)

Use the recommended method via System Contract:

```bash
cd contracts
npx tsx scripts/deposit-to-reactive-mirror.ts
```

This script:
- Funds ReactiveMirror via System Contract's `depositTo()` method
- Automatically settles any outstanding debt
- Default amount: 0.5 lReact (configurable via `DEPOSIT_AMOUNT` env var)

**Verify funding:**
- Check [Reactive Scan](https://lasna.reactscan.net) for the contract's status
- Contract should show as "Active" after funding

### Fund FeedProxy (Ethereum Sepolia)

Fund FeedProxy on Sepolia:

```bash
npx tsx scripts/fund-feedproxy.ts
```

This script:
- Funds FeedProxy via Callback Proxy's `depositTo()` method
- Default amount: 0.01 ETH (configurable via `DEPOSIT_AMOUNT` env var)

**Verify funding:**
- Check the contract balance on [Etherscan Sepolia](https://sepolia.etherscan.io)

## Running the Frontend

Start the Next.js development server:

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The frontend provides:
- Real-time price monitoring for both origin and destination chains
- Force price update functionality
- Transaction status tracking
- Auto-refreshing price displays

## Testing the Cross-Chain Flow

1. **Update Price on Origin Chain:**
   - Use the frontend "Force Price Update" button, or
   - Call `updatePrice()` directly on MockFeed contract on Polygon Amoy

2. **Monitor Reactive Network:**
   - Check [Reactive Scan](https://lasna.reactscan.net) for ReactiveMirror transactions
   - Verify `react()` function is being called
   - Check for `Callback` events being emitted

3. **Verify Destination Chain:**
   - Check FeedProxy contract on [Etherscan Sepolia](https://sepolia.etherscan.io)
   - Verify price has been updated via `latestRoundData()`
   - Check frontend for synchronized price display

## Contract Addresses

See [CONTRACT_ADDRESSES.md](./contracts/CONTRACT_ADDRESSES.md) for all deployed contract addresses and explorer links.

## Transaction Hashes

See [TRANSACTION_HASHES.md](./contracts/TRANSACTION_HASHES.md) for complete transaction history demonstrating successful cross-chain price updates.

## Project Structure

```
.
├── contracts/              # Smart contracts and deployment
│   ├── contracts/          # Solidity contracts
│   │   ├── MockFeed.sol
│   │   ├── ReactiveMirror.sol
│   │   ├── FeedProxy.sol
│   │   └── IReactive.sol
│   ├── ignition/           # Hardhat Ignition deployment modules
│   │   └── modules/
│   ├── scripts/            # Funding scripts
│   │   ├── deposit-to-reactive-mirror.ts
│   │   ├── fund-feedproxy.ts
│   │   └── fund-reactive-mirror.ts
│   ├── CONTRACT_ADDRESSES.md
│   └── TRANSACTION_HASHES.md
└── frontend/               # Next.js frontend application
    └── src/
        ├── app/
        ├── components/
        └── config.ts
```

## Troubleshooting

### Contract Status Shows "Inactive"

- **ReactiveMirror:** Ensure it has sufficient lReact tokens. Run `deposit-to-reactive-mirror.ts` to fund it.
- Check [Reactive Scan](https://lasna.reactscan.net) for contract status and balance.

### Callbacks Not Executing

1. **Check ReactiveMirror funding:** Contract must have lReact tokens for RVM transactions
2. **Check FeedProxy funding:** Contract must have ETH for callback execution
3. **Verify subscription:** Check Reactive Scan to ensure ReactiveMirror is subscribed to MockFeed events
4. **Check ReactiveVmId:** Ensure FeedProxy's `reactiveVmId` matches ReactiveMirror's deployer address

### "Internal JSON-RPC error"

- This is typically an RPC endpoint issue, not a contract problem
- Try using a different RPC endpoint
- Check network connectivity

### Price Not Updating on Destination

1. Verify MockFeed emitted `AnswerUpdated` event on Polygon Amoy
2. Check Reactive Scan for ReactiveMirror `react()` execution
3. Verify `Callback` event was emitted
4. Check FeedProxy on Sepolia for the callback transaction
5. Ensure both contracts are properly funded

## Key Features

- ✅ **Automatic Event Detection:** ReactiveMirror automatically detects price updates without polling
- ✅ **Cross-Chain Execution:** Seamless price mirroring from Polygon Amoy to Ethereum Sepolia
- ✅ **Chainlink-Compatible:** FeedProxy implements `AggregatorV3Interface` for easy integration
- ✅ **Production-Ready:** Includes proper error handling, authorization, and funding mechanisms
- ✅ **Real-Time Monitoring:** Frontend provides live price updates and transaction tracking

## Documentation

- [Contract Addresses](./contracts/CONTRACT_ADDRESSES.md) - All deployed contract addresses
- [Transaction Hashes](./contracts/TRANSACTION_HASHES.md) - Complete transaction history
- [Reactive Network Docs](https://dev.reactive.network) - Official Reactive Network documentation

## License

MIT

