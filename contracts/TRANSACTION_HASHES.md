# Cross-Chain Oracle Transaction Hashes

This document contains the transaction hashes for successful cross-chain price feed updates from Polygon Amoy (Origin) → Reactive Network → Ethereum Sepolia (Destination).

## Transaction Sets

### Transaction Set 1

**Origin Chain (Polygon Amoy)**
- **Transaction Hash:** `0x442c861a360d3435e0cea5ee8e57144a456d8a6910d89204375048a905ed2f81`
- **Explorer:** [PolygonScan Amoy](https://amoy.polygonscan.com/tx/0x442c861a360d3435e0cea5ee8e57144a456d8a6910d89204375048a905ed2f81)
- **Description:** MockFeed price update transaction on Polygon Amoy

**Reactive Network**
- **Transaction Hash:** `0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5`
- **Explorer:** [Reactive Scan](https://lasna.reactscan.net/rvm/0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5)
- **Description:** ReactiveMirror contract react() execution

**Destination Chain (Ethereum Sepolia)**
- **Transaction Hash:** `0x4a55d7d7589fe167d490d8770c2e5ba6e1b49e5b3b9ac7419e44121bdca332c3`
- **Explorer:** [Etherscan Sepolia](https://sepolia.etherscan.io/tx/0x4a55d7d7589fe167d490d8770c2e5ba6e1b49e5b3b9ac7419e44121bdca332c3)
- **Description:** FeedProxy callback execution and price update on Sepolia

---

### Transaction Set 2

**Origin Chain (Polygon Amoy)**
- **Transaction Hash:** `0x19bfe21484c581a98b82ba9eb86b13e9713c1cd498a8ae09bd1460686fc30a47`
- **Explorer:** [PolygonScan Amoy](https://amoy.polygonscan.com/tx/0x19bfe21484c581a98b82ba9eb86b13e9713c1cd498a8ae09bd1460686fc30a47)
- **Description:** MockFeed price update transaction on Polygon Amoy

**Reactive Network**
- **Transaction Hash:** `0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5`
- **Explorer:** [Reactive Scan](https://lasna.reactscan.net/rvm/0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5)
- **Description:** ReactiveMirror contract react() execution

**Destination Chain (Ethereum Sepolia)**
- **Transaction Hash:** `0xb38d2b682cd308ca951a83cc068f6fefd9f6ac02b8146f6aa734b2060f0e96c1`
- **Explorer:** [Etherscan Sepolia](https://sepolia.etherscan.io/tx/0xb38d2b682cd308ca951a83cc068f6fefd9f6ac02b8146f6aa734b2060f0e96c1)
- **Description:** FeedProxy callback execution and price update on Sepolia

---

### Transaction Set 3

**Origin Chain (Polygon Amoy)**
- **Transaction Hash:** `0x007b718c117afb6a23b7680f552ffd37dd18191bae410a12db7854d74d41a7d3`
- **Explorer:** [PolygonScan Amoy](https://amoy.polygonscan.com/tx/0x007b718c117afb6a23b7680f552ffd37dd18191bae410a12db7854d74d41a7d3)
- **Description:** MockFeed price update transaction on Polygon Amoy

**Reactive Network**
- **Transaction Hash:** `0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5`
- **Explorer:** [Reactive Scan](https://lasna.reactscan.net/rvm/0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5)
- **Description:** ReactiveMirror contract react() execution

**Destination Chain (Ethereum Sepolia)**
- **Transaction Hash:** `0x749172b6123a3b4a04bda95e3441e608da48cf7c83f25b26f3b8e1eed9b1ee6d`
- **Explorer:** [Etherscan Sepolia](https://sepolia.etherscan.io/tx/0x749172b6123a3b4a04bda95e3441e608da48cf7c83f25b26f3b8e1eed9b1ee6d)
- **Description:** FeedProxy callback execution and price update on Sepolia

---

### Transaction Set 4

**Origin Chain (Polygon Amoy)**
- **Transaction Hash:** `0xf27cd83205833d10fe2c36cce8dd3774439fb7d90cda9a1c8b4be86367f9ace7`
- **Explorer:** [PolygonScan Amoy](https://amoy.polygonscan.com/tx/0xf27cd83205833d10fe2c36cce8dd3774439fb7d90cda9a1c8b4be86367f9ace7)
- **Description:** MockFeed price update transaction on Polygon Amoy

**Reactive Network**
- **Transaction Hash:** `0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5`
- **Explorer:** [Reactive Scan](https://lasna.reactscan.net/rvm/0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5)
- **Description:** ReactiveMirror contract react() execution

**Destination Chain (Ethereum Sepolia)**
- **Transaction Hash:** `0x01a116d4b7e01169032704b504547f3c63c1c169179f0edc22aa1f466622ae6f`
- **Explorer:** [Etherscan Sepolia](https://sepolia.etherscan.io/tx/0x01a116d4b7e01169032704b504547f3c63c1c169179f0edc22aa1f466622ae6f)
- **Description:** FeedProxy callback execution and price update on Sepolia

---

## Workflow Summary

Each transaction set demonstrates a complete cross-chain price feed update:

1. **Origin (Polygon Amoy):** MockFeed emits `PriceUpdated` event with new price data
2. **Reactive Network:** ReactiveMirror contract detects the event, processes it via `react()`, and emits a `Callback` event
3. **Destination (Ethereum Sepolia):** FeedProxy receives the callback and updates its stored price data

All four transaction sets confirm successful end-to-end price synchronization across chains.

