# Cross-Chain Oracle: Problem, Solution, and Workflow

## Table of Contents
1. [The Problem](#the-problem)
2. [Why Traditional Solutions Fail](#why-traditional-solutions-fail)
3. [The Reactive Network Solution](#the-reactive-network-solution)
4. [Why Reactive Contracts Are Essential](#why-reactive-contracts-are-essential)
5. [Complete Workflow After Deployment](#complete-workflow-after-deployment)
6. [Technical Deep Dive](#technical-deep-dive)

---

## The Problem

### The Challenge: Cross-Chain Price Feed Mirroring

In the multi-chain ecosystem, applications often need access to price data from one blockchain on another blockchain where that data doesn't natively exist. Consider this scenario:

- **Origin Chain (Polygon Amoy):** A reliable Chainlink price feed exists with real-time BTC/USD prices
- **Destination Chain (Ethereum Sepolia):** No native Chainlink feed available, but applications need this price data

**The Goal:** Automatically mirror price updates from Polygon Amoy to Ethereum Sepolia in real-time, providing a Chainlink-compatible interface on the destination chain.

### Key Requirements

1. **Real-Time Updates:** Price changes must propagate immediately (not on a schedule)
2. **Autonomous Operation:** No manual intervention or off-chain services required
3. **Reliability:** System must work even if off-chain infrastructure fails
4. **Security:** Only authorized sources can update prices
5. **Cost Efficiency:** Minimal gas costs and infrastructure overhead
6. **Chainlink Compatibility:** Destination must implement `AggregatorV3Interface` for seamless integration

---

## Why Traditional Solutions Fail

### ❌ Solution 1: Off-Chain Relayers

**Approach:** Run a server that monitors Polygon Amoy, detects price updates, and calls a function on Sepolia.

**Problems:**
- **Single Point of Failure:** If the server goes down, price updates stop
- **Centralization:** Defeats the purpose of decentralized systems
- **Maintenance Overhead:** Requires 24/7 monitoring, infrastructure costs, and DevOps
- **Trust Requirement:** Users must trust the relayer operator
- **Not Truly Autonomous:** Requires external infrastructure and human intervention

### ❌ Solution 2: Cross-Chain Bridges

**Approach:** Use existing cross-chain bridges to send price data.

**Problems:**
- **Not Event-Driven:** Bridges typically require explicit transactions, not automatic event responses
- **High Latency:** Bridge confirmations add significant delay (minutes to hours)
- **Cost:** Bridge fees for every price update
- **Complexity:** Requires managing bridge contracts and liquidity
- **Limited Functionality:** Bridges are designed for asset transfers, not arbitrary data

### ❌ Solution 3: Polling Contracts

**Approach:** Deploy a contract on Sepolia that periodically calls a function on Polygon Amoy to check for updates.

**Problems:**
- **Impossible:** Contracts on one chain cannot directly call contracts on another chain
- **Even with Oracles:** Would require expensive oracle calls for every check
- **Inefficient:** Most checks would find no updates, wasting gas
- **Delayed Updates:** Updates only detected during polling intervals

### ❌ Solution 4: Layer 2 Solutions

**Approach:** Use Layer 2 networks that support cross-chain communication.

**Problems:**
- **Limited Support:** Not all Layer 2s support arbitrary cross-chain calls
- **Complexity:** Requires understanding multiple network architectures
- **Vendor Lock-in:** Tied to specific Layer 2 solutions
- **Still Requires Infrastructure:** Often still needs off-chain components

### ❌ Solution 5: Multi-Sig + Manual Updates

**Approach:** Use a multi-signature wallet to manually update prices.

**Problems:**
- **Not Autonomous:** Requires human intervention for every update
- **Slow:** Updates only happen when signers are available
- **Expensive:** Multi-sig transactions cost more gas
- **Not Real-Time:** Significant delays between price changes and updates

---

## The Reactive Network Solution

### ✅ How Reactive Contracts Solve This

Reactive Network provides a **specialized execution layer** designed specifically for event-driven, cross-chain automation. Here's how it works:

1. **Event Monitoring:** Reactive Network continuously monitors event logs across all supported chains
2. **Automatic Execution:** When subscribed events are detected, Reactive Contracts automatically execute
3. **Cross-Chain Callbacks:** Reactive Contracts can emit `Callback` events that trigger transactions on destination chains
4. **Fully Autonomous:** No off-chain infrastructure, servers, or manual intervention required
5. **Decentralized:** Operates as part of the Reactive Network blockchain

### Key Advantages

| Feature | Traditional Solutions | Reactive Network |
|---------|----------------------|------------------|
| **Autonomy** | ❌ Requires off-chain services | ✅ Fully on-chain |
| **Real-Time** | ❌ Delayed by polling/bridges | ✅ Immediate event response |
| **Reliability** | ❌ Single point of failure | ✅ Decentralized network |
| **Cost** | ❌ High infrastructure costs | ✅ Pay-per-execution model |
| **Trust** | ❌ Requires trusted operators | ✅ Trustless, verifiable |
| **Maintenance** | ❌ Ongoing DevOps required | ✅ Set and forget |

---

## Why Reactive Contracts Are Essential

### The Fundamental Limitation

**Standard smart contracts cannot autonomously respond to events on other blockchains.**

This is a fundamental architectural limitation:
- Contracts on Chain A cannot "listen" to events on Chain B
- Contracts cannot initiate cross-chain transactions without external triggers
- There's no native mechanism for event-driven cross-chain automation

### Why This Problem Is Hard (or Impossible) Without Reactive Contracts

#### 1. **No Native Cross-Chain Event Listening**

Traditional blockchains are isolated. A contract on Ethereum cannot natively monitor events on Polygon. You would need:
- Off-chain infrastructure to monitor events
- A way to trigger on-chain functions from off-chain
- Trust in the off-chain component

**Reactive Contracts solve this** by providing native event monitoring across chains as part of the network infrastructure.

#### 2. **No Autonomous Cross-Chain Execution**

Even if you detect an event, how do you trigger a transaction on another chain? You need:
- A cross-chain messaging protocol
- A relayer to deliver the message
- Gas on the destination chain
- Authorization mechanisms

**Reactive Contracts solve this** by providing built-in callback mechanisms that automatically execute on destination chains.

#### 3. **The Trust Problem**

Any solution requiring off-chain components introduces trust:
- Who operates the relayer?
- What if they go offline?
- What if they're compromised?
- How do you verify they're working correctly?

**Reactive Contracts solve this** by operating entirely on-chain, with verifiable execution and no trusted intermediaries.

#### 4. **The Cost Problem**

Running infrastructure is expensive:
- Server costs
- Monitoring systems
- DevOps time
- Maintenance overhead

**Reactive Contracts solve this** by eliminating infrastructure needs entirely. You only pay for actual executions.

### The Unique Value Proposition

**Reactive Contracts are the ONLY solution that provides:**
- ✅ Fully autonomous, on-chain event monitoring
- ✅ Automatic cross-chain execution
- ✅ No off-chain infrastructure required
- ✅ Decentralized and trustless
- ✅ Cost-effective pay-per-execution model
- ✅ Real-time responsiveness

**Without Reactive Contracts, you MUST have:**
- ❌ Off-chain infrastructure
- ❌ Trusted operators
- ❌ Ongoing maintenance
- ❌ Higher costs
- ❌ Single points of failure

---

## Complete Workflow After Deployment

This section describes the **step-by-step workflow** of how the cross-chain oracle operates after all contracts are deployed and funded.

### Prerequisites

Before the workflow begins, ensure:
1. ✅ MockFeed is deployed on Polygon Amoy
2. ✅ FeedProxy is deployed on Ethereum Sepolia
3. ✅ ReactiveMirror is deployed on Reactive Network
4. ✅ ReactiveMirror is funded with lReact tokens
5. ✅ FeedProxy is funded with ETH
6. ✅ ReactiveMirror subscription is active (verified on Reactive Scan)

### Workflow: Complete Price Update Cycle

#### Step 1: Price Update on Origin Chain (Polygon Amoy)

**Trigger:** A user or automated system calls `updatePrice(newPrice)` on the MockFeed contract.

**What Happens:**
```
Transaction: updatePrice(3110000000000) // $31,100.00
├── MockFeed contract updates internal state
├── Increments roundId
├── Updates answer, startedAt, updatedAt
└── Emits AnswerUpdated event:
    ├── Event Signature: AnswerUpdated(int256,uint256,uint256)
    ├── Topic 0: 0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f
    ├── Data: Encoded (answer, roundId, updatedAt)
    └── Block: [current block on Polygon Amoy]
```

**Transaction Details:**
- **Network:** Polygon Amoy (Chain ID: 80002)
- **Contract:** MockFeed (`0x70cF2C2703D2Dc02f5c0A1C3b9B430F1A1E9D359`)
- **Function:** `updatePrice(int256)`
- **Event Emitted:** `AnswerUpdated(int256 current, uint256 roundId, uint256 updatedAt)`

**Example Transaction:**
- **Hash:** `0x442c861a360d3435e0cea5ee8e57144a456d8a6910d89204375048a905ed2f81`
- **Explorer:** [View on PolygonScan](https://amoy.polygonscan.com/tx/0x442c861a360d3435e0cea5ee8e57144a456d8a6910d89204375048a905ed2f81)

---

#### Step 2: Reactive Network Event Detection

**What Happens:**
Reactive Network's infrastructure continuously monitors Polygon Amoy for events matching ReactiveMirror's subscription criteria.

**Subscription Criteria:**
- **Chain ID:** 80002 (Polygon Amoy)
- **Contract Address:** `0x70cF2C2703D2Dc02f5c0A1C3b9B430F1A1E9D359` (MockFeed)
- **Topic 0:** `0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f` (AnswerUpdated signature)

**Detection Process:**
```
Reactive Network Infrastructure
├── Monitors Polygon Amoy blocks
├── Filters events by subscription criteria
├── Matches AnswerUpdated event from MockFeed
└── Triggers ReactiveMirror.react() in ReactVM
```

**Key Point:** This happens **automatically** without any off-chain infrastructure. Reactive Network's validators perform this monitoring as part of the network's core functionality.

---

#### Step 3: ReactiveMirror.react() Execution

**What Happens:**
When Reactive Network detects the matching event, it automatically calls `react()` on the ReactiveMirror contract within its isolated ReactVM.

**Execution Flow:**
```solidity
function react(LogRecord calldata log) external override {
    // 1. VM Check - Ensure running in ReactVM
    require(vm, "ReactiveMirror: VM only");
    
    // 2. Validate Event Source
    require(log.chain_id == ORIGIN_CHAIN_ID, "ReactiveMirror: wrong chain");
    require(log._contract == originFeed, "ReactiveMirror: wrong feed");
    require(log.topic_0 == TOPIC_0, "ReactiveMirror: wrong event");
    
    // 3. Decode Event Data
    // Handle both indexed and non-indexed event formats
    int256 answer;
    uint256 roundId;
    uint256 updatedAt;
    
    if (log.topic_1 != 0 && log.topic_2 != 0) {
        // Indexed parameters in topics (if event uses indexed)
        answer = int256(log.topic_1);
        roundId = log.topic_2;
        require(log.data.length >= 32, "ReactiveMirror: insufficient data");
        updatedAt = abi.decode(log.data, (uint256));
    } else {
        // All non-indexed - decode all from data (MockFeed uses this format)
        require(log.data.length >= 96, "ReactiveMirror: insufficient data");
        (answer, roundId, updatedAt) = abi.decode(log.data, (int256, uint256, uint256));
    }
    
    // 4. Encode Callback Payload
    bytes memory payload = abi.encodeWithSignature(
        "updatePrice(address,bytes32,uint80,int256,uint256,uint256,uint80)",
        address(0),              // Will be replaced with RVM ID
        DOMAIN_SEPARATOR,        // Authorization domain
        uint80(roundId),         // Round ID from origin
        answer,                  // Price from origin
        updatedAt,               // startedAt
        updatedAt,               // updatedAt
        uint80(roundId)          // answeredInRound
    );
    
    // 5. Emit Callback Event
    emit Callback(
        DEST_CHAIN_ID,           // 11155111 (Sepolia)
        destContract,            // FeedProxy address
        CALLBACK_GAS_LIMIT,      // 500,000 gas
        payload                  // Encoded function call
    );
}
```

**Transaction Details:**
- **Network:** Reactive Network (Chain ID: 5318007)
- **Contract:** ReactiveMirror (`0x28Bdde455E85Db1e10D4f53499d27FFAf95ac19A`)
- **Function:** `react(LogRecord)`
- **Event Emitted:** `Callback(uint256 chain_id, address _contract, uint64 gas_limit, bytes payload)`
- **RVM ID:** `0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5`

**Key Security Features:**
1. **VM-Only Execution:** `react()` only runs in ReactVM, preventing unauthorized calls
2. **Source Validation:** Verifies chain ID, contract address, and event signature
3. **Authorization:** Payload includes domain separator for FeedProxy validation
4. **RVM ID Replacement:** Reactive Network automatically replaces `address(0)` with the actual RVM ID

**Payment:**
- ReactiveMirror pays for RVM transaction execution using its lReact reserves
- Payment is automatically deducted by the System Contract
- If insufficient funds, contract becomes inactive until funded

---

#### Step 4: Reactive Network Callback Processing

**What Happens:**
Reactive Network detects the `Callback` event emitted by ReactiveMirror and processes it for cross-chain execution.

**Processing Steps:**
```
Reactive Network Callback Processor
├── Detects Callback event from ReactiveMirror
├── Extracts destination chain ID (11155111 = Sepolia)
├── Extracts destination contract (FeedProxy address)
├── Extracts gas limit (500,000)
├── Extracts payload (encoded updatePrice function call)
├── Replaces address(0) in payload with RVM ID
├── Validates callback authorization
└── Submits transaction to Sepolia
```

**Authorization Mechanism:**
- Reactive Network replaces the first `address(0)` parameter in the payload with the RVM ID (`0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5`)
- This RVM ID is the deployer address of ReactiveMirror
- FeedProxy validates this RVM ID matches its stored `reactiveVmId`

**Transaction Creation:**
Reactive Network creates a transaction on Sepolia that:
- Calls FeedProxy's `updatePrice()` function
- Uses the Callback Proxy as the transaction sender
- Pays for gas using FeedProxy's reserves (funded via Callback Proxy)

---

#### Step 5: FeedProxy.updatePrice() Execution (Ethereum Sepolia)

**What Happens:**
The Callback Proxy on Sepolia executes the transaction, calling `updatePrice()` on FeedProxy.

**Execution Flow:**
```solidity
function updatePrice(
    address sender,              // RVM ID (replaced by Reactive Network)
    bytes32 _domainSeparator,    // Authorization domain
    uint80 _roundId,            // Round ID from origin
    int256 _answer,             // Price from origin
    uint256 _startedAt,          // Timestamp from origin
    uint256 _updatedAt,         // Timestamp from origin
    uint80 _answeredInRound     // Round ID from origin
) external onlyReactive {
    // 1. Authorization Checks
    require(msg.sender == CALLBACK_PROXY, "FeedProxy: not Reactive proxy");
    require(sender == reactiveVmId, "FeedProxy: unauthorized sender");
    require(_domainSeparator == DOMAIN_SEPARATOR, "FeedProxy: invalid domain");
    require(_updatedAt > latestRound.updatedAt, "FeedProxy: stale price");
    
    // 2. Update State
    latestRound = RoundData({
        roundId: _roundId,
        answer: _answer,
        startedAt: _startedAt,
        updatedAt: _updatedAt,
        answeredInRound: _answeredInRound
    });
    
    // 3. Emit Event
    emit PriceUpdated(_roundId, _answer, _startedAt, _updatedAt, _answeredInRound);
}
```

**Transaction Details:**
- **Network:** Ethereum Sepolia (Chain ID: 11155111)
- **Contract:** FeedProxy (`0xae7bFF837C0E6Df30c337CDaA0f2E46f32309D57`)
- **Function:** `updatePrice(...)`
- **Caller:** Callback Proxy (`0xc9f36411C9897e7F959D99ffca2a0Ba7ee0D7bDA`)
- **Event Emitted:** `PriceUpdated(uint80, int256, uint256, uint256, uint80)`

**Example Transaction:**
- **Hash:** `0x4a55d7d7589fe167d490d8770c2e5ba6e1b49e5b3b9ac7419e44121bdca332c3`
- **Explorer:** [View on Etherscan](https://sepolia.etherscan.io/tx/0x4a55d7d7589fe167d490d8770c2e5ba6e1b49e5b3b9ac7419e44121bdca332c3)

**Security Validations:**
1. **Caller Check:** Only Callback Proxy can call this function
2. **RVM ID Check:** Sender must match the authorized ReactiveVmId
3. **Domain Check:** Domain separator must match for authorization
4. **Staleness Check:** New price must be newer than current price

**Payment:**
- Gas is paid from FeedProxy's reserves (funded via Callback Proxy's `depositTo()`)
- If insufficient funds, callback fails and FeedProxy must be refunded

---

#### Step 6: Price Available on Destination Chain

**What Happens:**
After successful execution, the price is now available on Sepolia through FeedProxy's `AggregatorV3Interface` implementation.

**Accessing the Price:**
```solidity
// Any contract on Sepolia can now read the price
AggregatorV3Interface feed = AggregatorV3Interface(0xae7bFF...);

(
    uint80 roundId,
    int256 answer,
    uint256 startedAt,
    uint256 updatedAt,
    uint80 answeredInRound
) = feed.latestRoundData();

// answer = 3110000000000 (represents $31,100.00 with 8 decimals)
```

**Complete Flow Summary:**
```
Polygon Amoy:     Price Update → AnswerUpdated Event
       ↓
Reactive Network: Event Detection → react() Execution → Callback Event
       ↓
Ethereum Sepolia: Callback Processing → updatePrice() → Price Available
```

**Time to Completion:**
- **Origin Transaction:** ~2 seconds (Polygon Amoy block time)
- **Reactive Processing:** ~1-2 seconds (Reactive Network processing)
- **Destination Transaction:** ~12 seconds (Sepolia block time)
- **Total:** ~15-20 seconds from origin update to destination availability

---

## Technical Deep Dive

### Event Subscription Mechanism

ReactiveMirror subscribes to events during deployment:

```solidity
ISystemContract(systemContract).subscribe(
    ORIGIN_CHAIN_ID,        // 80002 (Polygon Amoy)
    originFeed,             // MockFeed address
    TOPIC_0,                // AnswerUpdated event signature
    REACTIVE_IGNORE,        // topic_1: any value
    REACTIVE_IGNORE,        // topic_2: any value
    REACTIVE_IGNORE         // topic_3: any value
);
```

This subscription tells Reactive Network: "Call `react()` whenever `AnswerUpdated` is emitted by MockFeed on Polygon Amoy."

### Payload Encoding and Authorization

The payload encodes a function call that will be executed on the destination chain:

```solidity
bytes memory payload = abi.encodeWithSignature(
    "updatePrice(address,bytes32,uint80,int256,uint256,uint256,uint80)",
    address(0),              // Placeholder for RVM ID
    DOMAIN_SEPARATOR,        // Authorization domain
    uint80(roundId),         // Data from origin event
    answer,
    updatedAt,
    updatedAt,
    uint80(roundId)
);
```

**Critical Security Feature:** Reactive Network automatically replaces `address(0)` with the actual RVM ID before execution. This ensures FeedProxy can verify the callback came from the authorized ReactiveMirror.

### Funding and Payment Model

**ReactiveMirror (Reactive Network):**
- Funded via System Contract's `depositTo()` method
- Funds go into reserves managed by System Contract
- RVM transactions deduct from reserves
- If reserves are depleted, contract becomes inactive

**FeedProxy (Ethereum Sepolia):**
- Funded via Callback Proxy's `depositTo()` method
- Funds go into reserves managed by Callback Proxy
- Callback execution deducts from reserves
- If reserves are depleted, callbacks fail

### Error Handling and Edge Cases

**Stale Price Protection:**
```solidity
require(_updatedAt > latestRound.updatedAt, "FeedProxy: stale price");
```
Prevents older price updates from overwriting newer ones.

**Authorization Failures:**
- Invalid RVM ID → Transaction reverts
- Invalid domain separator → Transaction reverts
- Unauthorized caller → Transaction reverts

**Insufficient Funds:**
- ReactiveMirror: Contract becomes inactive, no more `react()` calls
- FeedProxy: Callback fails, must refund to continue

### Monitoring and Verification

**Reactive Network:**
- Check [Reactive Scan](https://lasna.reactscan.net) for:
  - Contract status (Active/Inactive)
  - Transaction history
  - Subscription status
  - Reserve balance

**Destination Chain:**
- Check [Etherscan Sepolia](https://sepolia.etherscan.io) for:
  - FeedProxy transactions
  - Latest price data
  - Contract state

---

## Conclusion

This cross-chain oracle implementation demonstrates the **unique capabilities of Reactive Contracts**:

1. **Autonomous Operation:** No off-chain infrastructure required
2. **Real-Time Response:** Immediate event detection and processing
3. **Trustless:** Fully on-chain, verifiable execution
4. **Cost-Effective:** Pay-per-execution model
5. **Production-Ready:** Includes proper security, error handling, and monitoring

**Without Reactive Contracts, this use case would be:**
- ❌ Impossible to implement fully on-chain
- ❌ Require trusted off-chain infrastructure
- ❌ Have single points of failure
- ❌ Require ongoing maintenance and costs
- ❌ Introduce trust assumptions

**With Reactive Contracts, we achieve:**
- ✅ Fully autonomous, on-chain solution
- ✅ Decentralized and trustless
- ✅ Real-time, event-driven updates
- ✅ Production-grade security and reliability
- ✅ Cost-effective and maintainable

This is why Reactive Contracts are **essential** for this use case and represent a fundamental advancement in cross-chain automation capabilities.

