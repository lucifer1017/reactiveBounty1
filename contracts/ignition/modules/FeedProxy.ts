import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * FeedProxy Deployment Module
 * 
 * DEPLOYMENT ORDER: Step 2 (after MockFeed, before ReactiveMirror)
 * 
 * This contract is deployed on Ethereum Sepolia and receives price updates
 * from ReactiveMirror via Reactive Network callbacks.
 * 
 * CRITICAL: The reactiveVmId MUST be the deployer address of ReactiveMirror
 * on Reactive Network. This is known in advance, allowing FeedProxy to be
 * deployed before ReactiveMirror, solving the circular dependency.
 * 
 * ReactVM ID: 0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5
 * (This is the address that will deploy ReactiveMirror on Reactive Network)
 */
const FeedProxyModule = buildModule("FeedProxyModule", (m) => {
  // ReactVM ID: The deployer address of ReactiveMirror on Reactive Network
  // This is NOT the deployer of FeedProxy on Sepolia!
  // According to Reactive Network docs: "The ReactVM ID is equivalent to the contract deployer's address"
  const reactiveVmId = "0xf092ae8eb89f9d1dde19b80447de5b1528d17ae5";

  const feedProxy = m.contract("FeedProxy", [reactiveVmId]);

  return { feedProxy };
});

export default FeedProxyModule;