import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FeedProxyModule = buildModule("FeedProxyModule", (m) => {
  // The RVM ID is the deployer's wallet address (EOA).
  // m.getAccount(0) retrieves the address of the account executing the deployment.
  const reactiveVmId = m.getAccount(0);

  const feedProxy = m.contract("FeedProxy", [reactiveVmId]);

  return { feedProxy };
});

export default FeedProxyModule;