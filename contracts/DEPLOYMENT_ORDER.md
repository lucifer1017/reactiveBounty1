# 📋 DEPLOYMENT ORDER GUIDE

## 🔗 **DEPENDENCY ANALYSIS**

### **Contract Dependencies:**

1. **MockFeed** (Polygon Amoy)
   - ✅ **No dependencies** - Deploy first
   - Needed by: ReactiveMirror (for `originFeed` parameter)

2. **FeedProxy** (Ethereum Sepolia)
   - ✅ **Depends on:** ReactVM ID (known in advance: `0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5`)
   - Deploy second (before ReactiveMirror)
   - Needed by: ReactiveMirror (for `destContract` parameter)

3. **ReactiveMirror** (Reactive Network)
   - ⚠️ **Depends on:**
     - MockFeed address (from Step 1)
     - FeedProxy address (from Step 2)
   - Deploy last (after both MockFeed and FeedProxy)

### **Circular Dependency - SOLVED! ✅**

**The Problem:**
- ReactiveMirror needs FeedProxy address
- FeedProxy needs ReactVM ID (ReactiveMirror deployer address)

**The Solution:**
The ReactVM ID is simply the **deployer's EOA address**, which we know in advance: `0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5`

This allows us to:
1. Deploy FeedProxy with the known ReactVM ID
2. Deploy ReactiveMirror with the FeedProxy address
3. No circular dependency! ✅

---

## 🚀 **DEPLOYMENT ORDER (SIMPLIFIED)**

Since we know the ReactVM ID in advance (`0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5`), the deployment is straightforward:

### **Step 1: Deploy MockFeed** (Polygon Amoy)
```bash
npx hardhat ignition deploy ./ignition/modules/MockFeed.ts --network polygonAmoy
```

**Output:** MockFeed address (e.g., `0x73FA80d19edFDb4E28c870940dca83d990808391`)

**Action:** 
- Copy the MockFeed address
- Update `contracts/ignition/modules/ReactiveMirror.ts` with this address:
  ```typescript
  const originFeed = "<MOCK_FEED_ADDRESS_FROM_STEP_1>";
  ```

---

### **Step 2: Deploy FeedProxy** (Ethereum Sepolia)
```bash
npx hardhat ignition deploy ./ignition/modules/FeedProxy.ts --network sepolia
```

**Output:** FeedProxy address (e.g., `0x63194c2C46EE67f5702f9D877e125B992b90f41e`)

**Note:** FeedProxy is already configured with ReactVM ID: `0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5` ✅

**Action:**
- Copy the FeedProxy address
- Update `contracts/ignition/modules/ReactiveMirror.ts` with this address:
  ```typescript
  const destContract = "<FEED_PROXY_ADDRESS_FROM_STEP_2>";
  ```

---

### **Step 3: Deploy ReactiveMirror** (Reactive Network)
```bash
npx hardhat ignition deploy ./ignition/modules/ReactiveMirror.ts --network reactiveVm
```

**Output:** ReactiveMirror address

**VERIFICATION:**
- ✅ The deployer address MUST match: `0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5`
- ✅ This is the ReactVM ID used in FeedProxy
- ✅ If deployer doesn't match, FeedProxy will reject callbacks!

**Action:**
- Verify deployer address matches ReactVM ID
- Check subscription on Reactive Network (Reactive Scan)

---

## 🔄 **IMPORTANT: ReactVM ID Verification**

**CRITICAL:** The account that deploys ReactiveMirror MUST be:
```
0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5
```

**If you use a different account:**
1. Update `contracts/ignition/modules/FeedProxy.ts` with the new ReactVM ID
2. Redeploy FeedProxy on Sepolia
3. Update `contracts/ignition/modules/ReactiveMirror.ts` with the new FeedProxy address
4. Deploy ReactiveMirror with the correct account

---

## 📝 **DEPLOYMENT CHECKLIST**

### **Before Deployment:**
- [ ] Verify ReactVM ID in `FeedProxy.ts` is: `0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5`
- [ ] Ensure you'll use the same account (`0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5`) to deploy ReactiveMirror
- [ ] Have sufficient funds on all three networks (Amoy, Sepolia, Reactive Network)

### **During Deployment:**
- [ ] **Step 1:** Deploy MockFeed on Polygon Amoy → Copy address
- [ ] Update `ReactiveMirror.ts` with MockFeed address
- [ ] **Step 2:** Deploy FeedProxy on Ethereum Sepolia → Copy address
- [ ] Update `ReactiveMirror.ts` with FeedProxy address
- [ ] **Step 3:** Deploy ReactiveMirror on Reactive Network → Verify deployer address

### **After Deployment:**
- [ ] Verify MockFeed address in ReactiveMirror matches deployed address
- [ ] Verify FeedProxy address in ReactiveMirror matches deployed address
- [ ] **CRITICAL:** Verify ReactiveMirror deployer = `0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5`
- [ ] Verify ReactVM ID in FeedProxy = ReactiveMirror deployer
- [ ] Check subscription on Reactive Network (Reactive Scan)
- [ ] Update frontend `abis.ts` with all three addresses
- [ ] Test end-to-end: Update price on Amoy → Verify sync to Sepolia

---

## 🎯 **QUICK REFERENCE**

```
DEPLOYMENT ORDER:
1. MockFeed (Amoy)           → No dependencies
2. FeedProxy (Sepolia)       → Uses ReactVM ID: 0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5
3. ReactiveMirror (Reactive) → Needs MockFeed + FeedProxy addresses
```

**Key Points:**
- ✅ ReactVM ID is known: `0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5`
- ✅ FeedProxy can be deployed before ReactiveMirror (no circular dependency!)
- ✅ ReactiveMirror deployer MUST be `0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5`

---

## ⚠️ **IMPORTANT NOTES**

1. **ReactVM ID is the deployer address**, not the contract address
2. **ReactiveMirror's `destContract` is immutable** - must be set correctly at deployment
3. **FeedProxy's `reactiveVmId` is immutable** - must match ReactiveMirror deployer
4. **All addresses must be updated** in the frontend after deployment

---

## 🔧 **CURRENT CONFIGURATION**

Based on existing deployments:

- **MockFeed:** `0x73FA80d19edFDb4E28c870940dca83d990808391` (Amoy)
- **FeedProxy:** `0x63194c2C46EE67f5702f9D877e125B992b90f41e` (Sepolia)
- **ReactiveMirror:** `0x70cF2C2703D2Dc02f5c0A1C3b9B430F1A1E9D359` (Reactive Network)
- **ReactVM ID:** `0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5` (ReactiveMirror deployer)

**Status:** All addresses are already configured in the modules. If redeploying, follow the order above.

