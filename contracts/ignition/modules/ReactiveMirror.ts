import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ReactiveMirrorModule = buildModule("ReactiveMirrorModule", (m) => {
  // --- CONFIGURATION ---
  // Origin: MockFeed on Polygon Amoy
  const originFeed = "0x73FA80d19edFDb4E28c870940dca83d990808391";
  
  // Destination: FeedProxy on Ethereum Sepolia
  const destContract = "0x63194c2C46EE67f5702f9D877e125B992b90f41e";

  // System: Reactive Network System Contract (Lasna)
  const systemContract = "0x0000000000000000000000000000000000fffFfF";

  const reactiveMirror = m.contract("ReactiveMirror", [
    originFeed,
    destContract,
    systemContract,
  ]);

  return { reactiveMirror };
});

export default ReactiveMirrorModule;