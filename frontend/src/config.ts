import { createConfig, http } from "wagmi";
import { polygonAmoy, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [polygonAmoy, sepolia],
  connectors: [injected()],
  transports: {
    [polygonAmoy.id]: http(process.env.NEXT_PUBLIC_ORIGIN_RPC_URL),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_DEST_RPC_URL),
  },
  ssr: true,
});

