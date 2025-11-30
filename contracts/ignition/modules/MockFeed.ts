import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * MockFeed Deployment Module
 * 
 * DEPLOYMENT ORDER: Step 1 (deploy first, no dependencies)
 * 
 * This contract is deployed on Polygon Amoy and emits price update events
 * that ReactiveMirror subscribes to.
 * 
 * After deployment, copy the MockFeed address and update ReactiveMirror.ts
 */
const MockFeedModule = buildModule("MockFeedModule", (m) => {
  // Initial Price: $30,000 with 8 decimals -> 3000000000000
  const INITIAL_PRICE = 3000000000000n;

  const mockFeed = m.contract("MockFeed", [INITIAL_PRICE]);

  return { mockFeed };
});

export default MockFeedModule;