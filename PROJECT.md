# Cross-Chain Oracle - Project Overview

## Vision

Enable autonomous, trustless cross-chain price feed mirroring using Reactive Contracts, providing real-time Chainlink-compatible oracles on any EVM chain without off-chain infrastructure.

## What We Built

A production-grade cross-chain oracle system that automatically mirrors price data from Polygon Amoy to Ethereum Sepolia using Reactive Network's Reactive Contracts. The system operates fully autonomously on-chain, requiring no off-chain infrastructure, trusted operators, or manual intervention.

## Key Features

- ✅ **Fully Autonomous:** No off-chain infrastructure, servers, or manual intervention required
- ✅ **Real-Time Updates:** Price changes propagate in ~15-20 seconds across chains
- ✅ **Trustless:** Fully on-chain, verifiable execution with no trusted intermediaries
- ✅ **Chainlink-Compatible:** Destination contract implements `AggregatorV3Interface` for seamless integration
- ✅ **Production-Ready:** Includes proper security, error handling, authorization, and monitoring
- ✅ **Cost-Effective:** Pay-per-execution model eliminates infrastructure overhead

## Architecture

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

## How It Works

1. **Event Detection:** Reactive Network continuously monitors Polygon Amoy for `AnswerUpdated` events from MockFeed
2. **Automatic Processing:** When an event is detected, ReactiveMirror's `react()` function automatically executes
3. **Cross-Chain Callback:** ReactiveMirror emits a `Callback` event that triggers a transaction on Sepolia
4. **Price Update:** FeedProxy receives the callback and updates its stored price data
5. **Chainlink Interface:** Applications on Sepolia can read prices using standard `AggregatorV3Interface` methods

## Why Reactive Contracts Are Essential

This use case demonstrates why Reactive Contracts are **essential** for cross-chain automation:

- **Impossible Without Reactive Contracts:** Standard smart contracts cannot autonomously monitor events on other blockchains or trigger cross-chain transactions
- **No Off-Chain Infrastructure:** Eliminates the need for trusted relayers, servers, or monitoring systems
- **Fully Decentralized:** Operates entirely on-chain with verifiable execution
- **Real-Time Response:** Immediate event detection and processing without polling delays
- **Cost-Effective:** Only pay for actual executions, no infrastructure maintenance costs

## Technology Stack

- **Smart Contracts:** Solidity 0.8.20
- **Deployment:** Hardhat Ignition
- **Frontend:** Next.js 16, React, Wagmi, Viem
- **Networks:** Polygon Amoy, Reactive Network (Lasna), Ethereum Sepolia

## Contracts

- **MockFeed** (Polygon Amoy): Mock Chainlink price feed that emits price update events
- **ReactiveMirror** (Reactive Network): Reactive Contract that processes events and triggers callbacks
- **FeedProxy** (Ethereum Sepolia): Destination contract providing Chainlink-compatible price data

## Security Features

- **Authorization:** Multi-layer validation (RVM ID, domain separator, caller verification)
- **Stale Price Protection:** Prevents older updates from overwriting newer ones
- **VM-Only Execution:** `react()` only executes in ReactVM, preventing unauthorized calls
- **Source Validation:** Verifies chain ID, contract address, and event signature

## Deployment Status

All contracts are deployed and operational on testnets:

- ✅ MockFeed: Polygon Amoy (`0x70cF2C2703D2Dc02f5c0A1C3b9B430F1A1E9D359`)
- ✅ ReactiveMirror: Reactive Network (`0x28Bdde455E85Db1e10D4f53499d27FFAf95ac19A`)
- ✅ FeedProxy: Ethereum Sepolia (`0xae7bFF837C0E6Df30c337CDaA0f2E46f32309D57`)

See [CONTRACT_ADDRESSES.md](./contracts/CONTRACT_ADDRESSES.md) for complete address list.

## Verification

The system has been tested with multiple successful cross-chain price updates. See [TRANSACTION_HASHES.md](./contracts/TRANSACTION_HASHES.md) for complete transaction history.

## Documentation

- [README.md](./README.md) - Setup, deployment, and usage instructions
- [SOLUTION_AND_WORKFLOW.md](./SOLUTION_AND_WORKFLOW.md) - Detailed problem explanation and technical workflow
- [CONTRACT_ADDRESSES.md](./contracts/CONTRACT_ADDRESSES.md) - All deployed contract addresses
- [TRANSACTION_HASHES.md](./contracts/TRANSACTION_HASHES.md) - Transaction history and verification

## Impact

This implementation demonstrates the unique capabilities of Reactive Contracts for cross-chain automation, showing how complex multi-chain use cases can be solved entirely on-chain without compromising decentralization, security, or cost-effectiveness.

