# Contract Addresses

This document contains all deployed contract addresses for the Cross-Chain Oracle implementation.

## Deployed Contracts

### Origin Chain (Polygon Amoy - Chain ID: 80002)

**MockFeed**
- **Address:** `0x70cF2C2703D2Dc02f5c0A1C3b9B430F1A1E9D359`
- **Explorer:** [PolygonScan Amoy](https://amoy.polygonscan.com/address/0x70cF2C2703D2Dc02f5c0A1C3b9B430F1A1E9D359)
- **Description:** Mock Chainlink price feed that emits `AnswerUpdated` events on Polygon Amoy. This serves as the origin feed that triggers cross-chain price updates.

---

### Reactive Network (Chain ID: 5318007)

**ReactiveMirror**
- **Address:** `0x28Bdde455E85Db1e10D4f53499d27FFAf95ac19A`
- **Explorer:** [Reactive Scan](https://lasna.reactscan.net/rvm/0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5)
- **Description:** Reactive Contract that subscribes to `AnswerUpdated` events from MockFeed on Polygon Amoy. When events are detected, it processes them via `react()` and emits `Callback` events to trigger price updates on the destination chain.

**ReactiveVmId (Deployer Address)**
- **Address:** `0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5`

- **Description:** The deployer address that serves as the ReactiveVmId. This address is used by FeedProxy to authorize callbacks from ReactiveMirror.

**System Contract**
- **Address:** `0x0000000000000000000000000000000000fffFfF`
- **Description:** Reactive Network's system contract used for subscriptions and managing contract reserves/debt. Used by ReactiveMirror for event subscriptions and funding.

---

### Destination Chain (Ethereum Sepolia - Chain ID: 11155111)

**FeedProxy**
- **Address:** `0xae7bFF837C0E6Df30c337CDaA0f2E46f32309D57`
- **Explorer:** [Etherscan Sepolia](https://sepolia.etherscan.io/address/0xae7bFF837C0E6Df30c337CDaA0f2E46f32309D57)
- **Description:** Destination contract that receives callbacks from ReactiveMirror. Implements `AggregatorV3Interface` to provide Chainlink-compatible price feed data on Sepolia where native Chainlink feeds may not be available.

**Callback Proxy**
- **Address:** `0xc9f36411C9897e7F959D99ffca2a0Ba7ee0D7bDA`
- **Explorer:** [Etherscan Sepolia](https://sepolia.etherscan.io/address/0xc9f36411C9897e7F959D99ffca2a0Ba7ee0D7bDA)
- **Description:** Reactive Network's callback proxy on Sepolia. Authorizes and processes incoming callbacks from Reactive Network to FeedProxy. Used for funding FeedProxy's reserves.

---

## Network Configuration

| Network | Chain ID | RPC Endpoint |
|---------|----------|--------------|
| Polygon Amoy | 80002 | Polygon Amoy RPC |
| Reactive Network | 5318007 | Reactive Network RPC |
| Ethereum Sepolia | 11155111 | Sepolia RPC |

---

## Contract Relationships

```
Polygon Amoy (Origin)
    └── MockFeed (0x70cF2C...)
            │
            │ Emits AnswerUpdated events
            │
            ▼
Reactive Network
    └── ReactiveMirror (0x28Bdde...)
            │ Subscribes to MockFeed events
            │ Processes via react()
            │ Emits Callback events
            │
            ▼
Ethereum Sepolia (Destination)
    └── FeedProxy (0xae7bFF...)
            │ Receives callbacks via Callback Proxy
            │ Updates price data
            │ Exposes AggregatorV3Interface
```

---

## Important Notes

1. **ReactiveVmId:** The ReactiveVmId (`0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5`) must be set in FeedProxy's constructor during deployment. This ensures only callbacks from the authorized ReactiveMirror are accepted.

2. **Funding Requirements:**
   - ReactiveMirror must be funded on Reactive Network (via System Contract `depositTo()`)
   - FeedProxy must be funded on Sepolia (via Callback Proxy `depositTo()`)

3. **System Addresses:**
   - System Contract on Reactive Network: `0x0000000000000000000000000000000000fffFfF`
   - Callback Proxy on Sepolia: `0xc9f36411C9897e7F959D99ffca2a0Ba7ee0D7bDA`

