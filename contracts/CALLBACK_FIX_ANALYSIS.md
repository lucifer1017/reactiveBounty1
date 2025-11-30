# Callback Bridge Issue - Root Cause Analysis & Fix

## 🔍 Problem Summary

**Symptom:** When updating price on Polygon Amoy (Origin), the transaction succeeds, ReactiveMirror receives the event (transaction count increases), but FeedProxy on Sepolia (Destination) never receives the update - stuck on "Bridging... ⏳".

## 🎯 Root Causes Identified

### 1. **Insufficient Gas Limit** ❌ → ✅ FIXED
- **Issue:** `CALLBACK_GAS_LIMIT = 500000` was too low for reliable callback execution
- **Impact:** Callbacks might fail silently or run out of gas
- **Fix:** Increased to `1000000` (1M gas) for reliable execution

### 2. **Incorrect `startedAt` Logic** ❌ → ✅ FIXED
- **Issue:** Using `updatedAt` for both `startedAt` and `updatedAt` in the payload
- **Impact:** Semantically incorrect, though FeedProxy doesn't validate `startedAt` directly
- **Fix:** Track `lastUpdatedAt` in state and use it for `startedAt` (matches MockFeed behavior)

### 3. **ReactiveMirror Balance is 0** ⚠️ → **ACTION REQUIRED**
- **Issue:** Contract balance shows `0,0000 lReact`
- **Impact:** **CRITICAL** - Reactive Network requires contracts to have funds to execute callbacks
- **Solution:** Fund the contract using `deposit-to-reactive-mirror.ts` script

## 🔧 Changes Made

### `ReactiveMirror.sol`
1. ✅ Increased `CALLBACK_GAS_LIMIT` from `500000` to `1000000`
2. ✅ Added `lastUpdatedAt` state variable to track previous timestamp
3. ✅ Fixed `startedAt` calculation: `startedAt = lastUpdatedAt == 0 ? updatedAt : lastUpdatedAt`

## 📋 Next Steps (Required Actions)

### Step 1: Redeploy ReactiveMirror Contract
Since we changed the contract code, you need to redeploy:

```bash
cd contracts
npx hardhat ignition deploy .\ignition\modules\ReactiveMirror.ts --network reactiveVm
```

**Important:** After deployment, update:
- `FeedProxy.ts` - Update `reactiveVmId` if deployer address changed
- `ReactiveMirror.ts` - Update `originFeed` and `destContract` addresses
- Frontend `abis.ts` - Update `FEED_PROXY_ADDRESS` if FeedProxy was redeployed

### Step 2: Fund ReactiveMirror Contract
The contract **MUST** have lReact tokens to execute callbacks:

```bash
# Fund with 0.5 lReact (recommended minimum)
DEPOSIT_AMOUNT=0.5 npx tsx scripts/deposit-to-reactive-mirror.ts
```

**Why?** Reactive Network charges the contract for callback execution. Without funds, callbacks will fail silently.

### Step 3: Verify Contract Status
1. Check Reactive Scan: https://reactivescan.io/
2. Verify:
   - Contract Status: **Active** ✅
   - Reactive balance: **> 0 lReact** ✅
   - Transaction count increases when origin updates ✅

### Step 4: Test the Bridge
1. Update price on Polygon Amoy (Origin)
2. Wait 1-2 minutes for callback execution
3. Check if Sepolia (Destination) receives the update

## 🔬 How Callbacks Work

1. **Origin Update:** MockFeed emits `AnswerUpdated` event on Polygon Amoy
2. **Event Detection:** Reactive Network detects the event
3. **ReactiveMirror.react():** Called automatically by Reactive Network
4. **Callback Emission:** ReactiveMirror emits `Callback` event with payload
5. **Cross-Chain Execution:** Reactive Network executes callback on Sepolia
6. **FeedProxy.updatePrice():** Called by Reactive Network's Callback Proxy
7. **Price Updated:** FeedProxy state updated, `PriceUpdated` event emitted

## ⚠️ Common Issues & Solutions

### Callback Not Executing
- **Check:** ReactiveMirror balance > 0
- **Check:** Gas limit sufficient (now 1M)
- **Check:** Contract status is "Active" on Reactive Scan
- **Wait:** Callbacks can take 1-5 minutes

### Callback Reverting
- **Check:** `reactiveVmId` matches ReactiveMirror deployer address
- **Check:** `DOMAIN_SEPARATOR` matches in both contracts
- **Check:** `updatedAt` is strictly greater than previous (FeedProxy validation)

### Transaction Count Increases But No Update
- **Likely:** Insufficient balance or gas limit too low (both fixed)
- **Action:** Fund contract and wait for callback execution

## 📊 Expected Behavior After Fix

1. ✅ Update price on Origin → Transaction succeeds
2. ✅ ReactiveMirror transaction count increases
3. ✅ Wait 1-2 minutes
4. ✅ Destination price updates automatically
5. ✅ Frontend shows "Synced ✅" status

## 🎉 Success Criteria

- [ ] ReactiveMirror contract redeployed with fixes
- [ ] Contract funded with > 0.1 lReact
- [ ] Contract status shows "Active" on Reactive Scan
- [ ] Price update on Origin triggers update on Destination within 2 minutes
- [ ] Frontend dashboard shows "Synced ✅" when roundIds match

