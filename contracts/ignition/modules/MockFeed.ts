import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Initial Price: $30,000 with 8 decimals -> 3000000000000
const INITIAL_PRICE = 3000000000000n;

const MockFeedModule = buildModule("MockFeedModule", (m) => {
  const mockFeed = m.contract("MockFeed", [INITIAL_PRICE]);

  return { mockFeed };
});

export default MockFeedModule;