# 🛠️ METHOD 2: Fund ReactiveMirror via System Contract

## ✅ **RECOMMENDED METHOD**

This method uses the System Contract's `depositTo()` function, which:
- ✅ Automatically settles any outstanding debt
- ✅ No need to call `coverDebt()` separately  
- ✅ Handles all payment logic automatically
- ✅ Most reliable method

---

## 🚀 **OPTION A: Using TypeScript Script (Easiest)**

I've created a ready-to-use script for you:

### **Step 1: Run the Script**

```bash
cd contracts
npx tsx scripts/deposit-to-reactive-mirror.ts
```

**What it does:**
- Checks your REACT balance
- Checks ReactiveMirror's current balance
- Calls System Contract `depositTo()` with 0.1 REACT
- Automatically settles any debt
- Shows transaction hash and confirmation

**Requirements:**
- `REACTIVE_RPC_URL` in `.env`
- `PRIVATE_KEY` in `.env`
- At least 0.1 REACT in your account

---

## 🚀 **OPTION B: Using Hardhat Console**

### **Step 1: Open Hardhat Console**

```bash
cd contracts
npx hardhat console --network reactiveVm
```

### **Step 2: In the Console, Run:**

```javascript
const { viem } = await hre.network.provider.request({ method: "hardhat_getViemClient" });
const [account] = await viem.getWalletClients();

const SYSTEM_CONTRACT = "0x0000000000000000000000000000000000fffFfF";
const REACTIVE_MIRROR = "0x63194c2C46EE67f5702f9D877e125B992b90f41e";

// Encode depositTo(address)
const { encodeFunctionData } = await import("viem");
const data = encodeFunctionData({
  abi: [{
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "depositTo",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  }],
  functionName: "depositTo",
  args: [REACTIVE_MIRROR],
});

// Send transaction
const hash = await account.sendTransaction({
  to: SYSTEM_CONTRACT,
  value: 100000000000000000n, // 0.1 REACT
  data: data,
});

console.log("Transaction hash:", hash);
```

---

## 🚀 **OPTION C: Using Cast (Foundry)**

If you have Foundry installed:

### **Step 1: Set Environment Variables**

```powershell
$env:REACTIVE_RPC = "your-reactive-rpc-url"
$env:PRIVATE_KEY = "your-private-key"
```

### **Step 2: Run Cast Command**

```powershell
cast send 0x0000000000000000000000000000000000fffFfF `
  "depositTo(address)" `
  0x63194c2C46EE67f5702f9D877e125B992b90f41e `
  --rpc-url $env:REACTIVE_RPC `
  --private-key $env:PRIVATE_KEY `
  --value 0.1ether
```

---

## 🚀 **OPTION D: Using MetaMask/Web3 Wallet**

If you prefer using a wallet:

### **Step 1: Connect to Reactive Network**

Add Reactive Network to MetaMask:
- **Network Name:** Reactive Network
- **RPC URL:** Your `REACTIVE_RPC_URL`
- **Chain ID:** 5318007
- **Currency Symbol:** REACT

### **Step 2: Interact with System Contract**

1. Go to a block explorer or use a tool like Remix
2. Connect your wallet
3. Interact with contract: `0x0000000000000000000000000000000000fffFfF`
4. Call function: `depositTo(address)`
5. Parameter: `0x63194c2C46EE67f5702f9D877e125B992b90f41e`
6. Send value: `0.1 REACT` (or `100000000000000000` wei)

---

## 📋 **STEP-BY-STEP (Recommended: Option A)**

### **Prerequisites:**

1. **Check your `.env` file has:**
   ```
   REACTIVE_RPC_URL=your-reactive-network-rpc-url
   PRIVATE_KEY=your-private-key-without-0x-prefix
   ```

2. **Verify you have REACT tokens:**
   - Check your account balance on Reactive Network
   - You need at least 0.1 REACT (plus gas fees)

### **Execute:**

```bash
cd contracts
npx tsx scripts/deposit-to-reactive-mirror.ts
```

### **Expected Output:**

```
💰 Funding ReactiveMirror via System Contract (Method 2)
============================================================

📊 Checking current status...
Current ReactiveMirror balance: 0.0000 REACT

💵 Amount to deposit: 0.1 REACT
Your account balance: X.XXXX REACT

📤 Calling System Contract depositTo()...
   System Contract: 0x0000000000000000000000000000000000fffFfF
   Target Contract: 0x63194c2C46EE67f5702f9D877e125B992b90f41e
   Amount: 0.1 REACT

🔄 Sending transaction...
✅ Transaction sent!
   Hash: 0x...

⏳ Waiting for confirmation...
✅ Transaction confirmed!
   New ReactiveMirror balance: 0.1 REACT

🎉 ReactiveMirror should now be ACTIVE!

📋 Next steps:
   1. Wait 1-2 minutes for status to update on Reactive Scan
   2. Check Reactive Scan: https://reactivescan.io/
   3. Verify contract status shows "Active"
   4. Try updating price on Origin again
```

---

## ✅ **VERIFICATION**

After running the script:

1. **Wait 1-2 minutes** for Reactive Network to update status
2. **Check Reactive Scan:**
   - Go to: https://reactivescan.io/
   - Search for: `0x63194c2C46EE67f5702f9D877e125B992b90f41e`
   - Status should show: **"Active"** ✅
   - Balance should show: **> 0 REACT** ✅

3. **Test the Bridge:**
   - Go to your dashboard
   - Click "Force Price Update (+100)"
   - Wait 30-60 seconds
   - Destination should update automatically! ✅

---

## ⚠️ **TROUBLESHOOTING**

### **Error: "Insufficient balance"**
- You don't have enough REACT tokens
- Get REACT from Reactive Network faucet or exchange

### **Error: "Transaction failed"**
- Check your `REACTIVE_RPC_URL` is correct
- Check your `PRIVATE_KEY` is correct
- Ensure you have enough REACT for gas fees

### **Contract still shows "Inactive"**
- Wait 2-3 minutes (status updates can be delayed)
- Check if transaction was confirmed
- Verify balance increased on Reactive Scan

---

## 🎯 **QUICK REFERENCE**

**System Contract:** `0x0000000000000000000000000000000000fffFfF`  
**ReactiveMirror:** `0x63194c2C46EE67f5702f9D877e125B992b90f41e`  
**Amount:** `0.1 REACT` (100000000000000000 wei)

**Quick Command:**
```bash
npx tsx scripts/deposit-to-reactive-mirror.ts
```

---

## 💡 **WHY METHOD 2 IS RECOMMENDED**

1. **Automatic Debt Settlement** - No need to manually call `coverDebt()`
2. **Reliable** - Uses official System Contract method
3. **Simple** - One transaction does everything
4. **Safe** - Handles edge cases automatically

This is the method recommended by Reactive Network documentation!







