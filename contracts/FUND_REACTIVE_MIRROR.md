# 💰 FUNDING REACTIVE MIRROR CONTRACT

## 🚨 **ROOT CAUSE IDENTIFIED**

Your ReactiveMirror contract is **INACTIVE** with **0 REACT balance**.

**Why this matters:**
- Inactive contracts cannot execute transactions
- Inactive contracts cannot process events
- Inactive contracts cannot emit callbacks
- **This is why your bridge isn't working!**

---

## ✅ **SOLUTION: Fund the Contract**

According to Reactive Network documentation, you need to:

1. **Send REACT tokens** to the ReactiveMirror contract
2. **Settle any outstanding debt** using `coverDebt()`

---

## 🛠️ **METHOD 1: Direct Transfer (Easiest)**

### **Using Cast (Foundry):**

```bash
# Send 0.1 REACT to ReactiveMirror
cast send 0x63194c2C46EE67f5702f9D877e125B992b90f41e \
  --rpc-url $REACTIVE_RPC \
  --private-key $PRIVATE_KEY \
  --value 0.1ether
```

### **Using Hardhat Console:**

```bash
npx hardhat console --network reactiveVm
```

Then in console:
```javascript
const [signer] = await ethers.getSigners();
await signer.sendTransaction({
  to: "0x63194c2C46EE67f5702f9D877e125B992b90f41e",
  value: ethers.utils.parseEther("0.1")
});
```

---

## 🛠️ **METHOD 2: Using System Contract (Recommended)**

According to Reactive Network docs, you can use `depositTo()` which automatically settles debt:

```bash 
cast send 0x0000000000000000000000000000000000fffFfF \
  "depositTo(address)" \
  0x63194c2C46EE67f5702f9D877e125B992b90f41e \
  --rpc-url $REACTIVE_RPC \
  --private-key $PRIVATE_KEY \
  --value 0.1ether
```

**Benefits:**
- Automatically settles any outstanding debt
- No need to call `coverDebt()` separately

---

## 🛠️ **METHOD 3: Using TypeScript Script**

I've created a script for you:

```bash
npx tsx scripts/fund-reactive-mirror.ts
```

**Note:** You may need to adjust the script based on your exact setup.

---

## 📋 **STEP-BY-STEP INSTRUCTIONS**

### **Step 1: Get REACT Tokens**

If you don't have REACT tokens:
- Check Reactive Network faucet (if available)
- Or get from DEX/exchange
- Or ask in Reactive Network community

### **Step 2: Fund the Contract**

Choose one method above and send at least **0.1 REACT** to:
```
0x63194c2C46EE67f5702f9D877e125B992b90f41e
```

### **Step 3: Settle Debt (if needed)**

If the contract has outstanding debt:

```bash
cast send 0x63194c2C46EE67f5702f9D877e125B992b90f41e \
  "coverDebt()" \
  --rpc-url $REACTIVE_RPC \
  --private-key $PRIVATE_KEY
```

**Note:** Check Reactive Network docs for exact `coverDebt()` signature.

### **Step 4: Verify Activation**

1. Go to Reactive Scan: https://reactivescan.io/
2. Search for: `0x63194c2C46EE67f5702f9D877e125B992b90f41e`
3. Check status - should show **"Active"**
4. Check balance - should show REACT balance > 0

---

## 🔍 **CHECKING CONTRACT STATUS**

### **Check Balance:**
```bash
cast balance 0x63194c2C46EE67f5702f9D877e125B992b90f41e \
  --rpc-url $REACTIVE_RPC
```

### **Check Debt:**
```bash
cast call 0x0000000000000000000000000000000000fffFfF \
  "debts(address)" \
  0x63194c2C46EE67f5702f9D877e125B992b90f41e \
  --rpc-url $REACTIVE_RPC | cast to-dec
```

### **Check Reserves:**
```bash
cast call 0x0000000000000000000000000000000000fffFfF \
  "reserves(address)" \
  0x63194c2C46EE67f5702f9D877e125B992b90f41e \
  --rpc-url $REACTIVE_RPC | cast to-dec
```

---

## ⚠️ **IMPORTANT NOTES**

1. **Contract needs REACT, not ETH** - Reactive Network uses REACT tokens
2. **Minimum amount:** Send at least 0.1 REACT (more is better for multiple transactions)
3. **Debt settlement:** If contract has debt, it must be settled before activation
4. **Status update:** Status may take a few minutes to update on Reactive Scan

---

## ✅ **AFTER FUNDING**

Once the contract is active:

1. ✅ Contract status should show "Active" on Reactive Scan
2. ✅ Try updating price on Origin again
3. ✅ Wait 30-60 seconds for Reactive Network to process
4. ✅ Check if Destination updates automatically

---

## 🎯 **EXPECTED RESULT**

After funding:
- Contract status: **Active** ✅
- Balance: **> 0 REACT** ✅
- Bridge should work: **Price updates sync to Sepolia** ✅

---

## 📝 **QUICK REFERENCE**

**Contract Address:** `0x63194c2C46EE67f5702f9D877e125B992b90f41e`  
**System Contract:** `0x0000000000000000000000000000000000fffFfF`  
**Recommended Amount:** `0.1 REACT` (or more)

**Quick Command:**
```bash
cast send 0x0000000000000000000000000000000000fffFfF \
  "depositTo(address)" \
  0x63194c2C46EE67f5702f9D877e125B992b90f41e \
  --rpc-url $REACTIVE_RPC \
  --private-key $PRIVATE_KEY \
  --value 0.1ether
```







