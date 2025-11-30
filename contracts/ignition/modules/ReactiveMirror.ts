import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * ReactiveMirror Deployment Module
 * 
 * DEPLOYMENT ORDER: Step 3 (after MockFeed and FeedProxy)
 * 
 * This contract is deployed on Reactive Network and acts as the bridge between
 * Polygon Amoy (origin) and Ethereum Sepolia (destination).
 * 
 * IMPORTANT: Before deploying, update the addresses below:
 * 1. originFeed: MockFeed address from Step 1
 * 2. destContract: FeedProxy address from Step 2
 * 
 * The deployer address of this contract MUST match the reactiveVmId used in FeedProxy!
 * Expected deployer: 0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5
 */
const ReactiveMirrorModule = buildModule("ReactiveMirrorModule", (m) => {
  // --- CONFIGURATION ---
  // Step 1: Deploy MockFeed on Polygon Amoy, then update this address
  const originFeed = "0x70cF2C2703D2Dc02f5c0A1C3b9B430F1A1E9D359";
  
  // Step 2: Deploy FeedProxy on Ethereum Sepolia, then update this address
  const destContract = "0xae7bFF837C0E6Df30c337CDaA0f2E46f32309D57";

  // System: Reactive Network System Contract (Lasna) - DO NOT CHANGE
  const systemContract = "0x0000000000000000000000000000000000fffFfF";

  const reactiveMirror = m.contract("ReactiveMirror", [
    originFeed,
    destContract,
    systemContract,
  ]);

  return { reactiveMirror };
});

export default ReactiveMirrorModule;