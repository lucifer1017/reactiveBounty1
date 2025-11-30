# 🔍 DEBUGGING BRIDGE ISSUES

## Current Status
- ✅ Origin (MockFeed) updates correctly
- ✅ UI shows origin price update in terminal
- ❌ Destination (FeedProxy) stuck on "Bridging... ⏳"

## 🔍 **POTENTIAL ISSUES TO CHECK**

### **1. ReactiveMirror Subscription Status** ⚠️ **MOST LIKELY**

**Problem:** ReactiveMirror might not be subscribed to MockFeed events.

**Check:**
- Visit Reactive Scan: https://reactivescan.io/
- Search for your ReactiveMirror address: `0x70cF2C2703D2Dc02f5c0A1C3b9B430F1A1E9D359`
- Verify subscription is active
- Check if events are being received

**Fix if needed:**
- If subscription is missing, ReactiveMirror won't receive events
- May need to manually subscribe or redeploy ReactiveMirror

---

### **2. Event Address Mismatch** ⚠️ **CHECK THIS**

**Problem:** ReactiveMirror might be subscribed to wrong MockFeed address.

**Verify:**
1. Check ReactiveMirror's `originFeed` value (on-chain)
2. Compare with actual MockFeed address: `0x70cF2C2703D2Dc02f5c0A1C3b9B430F1A1E9D359`
3. They must match exactly!

**How to check:**
```bash
# On Reactive Network, call ReactiveMirror.originFeed()
# Should return: 0x70cF2C2703D2Dc02f5c0A1C3b9B430F1A1E9D359
```

---

### **3. Event Decoding Failure** ⚠️ **POSSIBLE**

**Problem:** Event data might not be decoding correctly.

**Check:**
- ReactiveMirror's `react()` function might be returning early
- Event data length might be wrong
- ABI decoding might be failing

**Symptoms:**
- Events received but callback not emitted
- No errors visible (silent failure)

**Fix:**
- Check if ReactiveMirror contract has the latest code with event decoding fix
- Verify event structure matches

---

### **4. FeedProxy Authorization Failure** ⚠️ **CHECK THIS**

**Problem:** FeedProxy might be rejecting callbacks.

**Verify:**
1. Check FeedProxy's `reactiveVmId` value (on-chain)
2. Should be: `0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5`
3. This must match ReactiveMirror deployer!

**How to check:**
```bash
# On Sepolia, call FeedProxy.reactiveVmId()
# Should return: 0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5
```

**If mismatch:**
- FeedProxy will reject all callbacks with "FeedProxy: unauthorized sender"
- Need to redeploy FeedProxy with correct ReactVM ID

---

### **5. Stale Price Check** ⚠️ **POSSIBLE**

**Problem:** FeedProxy might reject updates if `updatedAt` is not greater.

**Check:**
- FeedProxy has: `require(_updatedAt > latestRound.updatedAt, "FeedProxy: stale price")`
- If ReactiveMirror sends same or older timestamp, it will fail

**Fix:**
- Ensure MockFeed's `updatedAt` is always increasing
- Check if ReactiveMirror is correctly passing `updatedAt`

---

### **6. Reactive Network Processing Delay** ⚠️ **NORMAL**

**Problem:** Reactive Network might take 10-60 seconds to process.

**Check:**
- Wait at least 60 seconds after origin update
- Check Reactive Network status
- Check if there are any network delays

---

### **7. FeedProxy Balance/Funding** ⚠️ **CHECK THIS**

**Problem:** FeedProxy might not have funds for callback fees.

**Check:**
- FeedProxy needs ETH on Sepolia to pay callback fees
- Check balance: `cast balance <FEED_PROXY_ADDRESS> --rpc-url <SEPOLIA_RPC>`

**Fix:**
- Send ETH to FeedProxy address
- Or use callback proxy's `depositTo()` method

---

## 🛠️ **DEBUGGING STEPS**

### **Step 1: Verify On-Chain Values**

Check ReactiveMirror configuration:
```bash
# On Reactive Network
cast call <REACTIVE_MIRROR_ADDRESS> "originFeed()" --rpc-url <REACTIVE_RPC>
cast call <REACTIVE_MIRROR_ADDRESS> "destContract()" --rpc-url <REACTIVE_RPC>
```

Check FeedProxy configuration:
```bash
# On Sepolia
cast call <FEED_PROXY_ADDRESS> "reactiveVmId()" --rpc-url <SEPOLIA_RPC>
cast call <FEED_PROXY_ADDRESS> "latestRound()" --rpc-url <SEPOLIA_RPC>
```

### **Step 2: Check Reactive Scan**

1. Go to https://reactivescan.io/
2. Search for ReactiveMirror address
3. Check:
   - Is subscription active?
   - Are events being received?
   - Are callbacks being emitted?

### **Step 3: Check Event Logs**

On Polygon Amoy, check if AnswerUpdated events are being emitted:
```bash
cast logs --from-block <RECENT_BLOCK> \
  --address <MOCK_FEED_ADDRESS> \
  --topic 0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f \
  --rpc-url <AMOY_RPC>
```

### **Step 4: Check Callback Logs**

On Reactive Network, check if Callback events are being emitted:
```bash
cast logs --from-block <RECENT_BLOCK> \
  --address <REACTIVE_MIRROR_ADDRESS> \
  --topic <CALLBACK_TOPIC> \
  --rpc-url <REACTIVE_RPC>
```

---

## 🎯 **MOST LIKELY CAUSES (In Order)**

1. **ReactiveMirror subscription not active** (Check Reactive Scan)
2. **FeedProxy reactiveVmId mismatch** (Verify on-chain)
3. **FeedProxy insufficient balance** (Check balance)
4. **Event decoding failure** (Check ReactiveMirror code)
5. **Network processing delay** (Wait longer)

---

## ✅ **QUICK FIXES**

### **If Subscription Missing:**
- Redeploy ReactiveMirror (subscription happens in constructor)
- Or manually subscribe via system contract

### **If reactiveVmId Mismatch:**
- Redeploy FeedProxy with correct ReactVM ID
- Update frontend with new address

### **If Insufficient Balance:**
- Send ETH to FeedProxy address
- Or use callback proxy deposit

---

## 📝 **VERIFICATION CHECKLIST**

- [ ] ReactiveMirror.originFeed() == MockFeed address
- [ ] ReactiveMirror.destContract() == FeedProxy address
- [ ] FeedProxy.reactiveVmId() == ReactiveMirror deployer (0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5)
- [ ] FeedProxy has ETH balance on Sepolia
- [ ] Subscription active on Reactive Scan
- [ ] Events visible on Polygon Amoy
- [ ] Callbacks visible on Reactive Network
- [ ] Wait at least 60 seconds after origin update







