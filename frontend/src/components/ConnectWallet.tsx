"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { polygonAmoy } from "wagmi/chains";
import { Wallet, LogOut, AlertTriangle } from "lucide-react";

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ConnectWallet() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isWrongChain = isConnected && chainId !== polygonAmoy.id;

  if (isConnected && !isWrongChain) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
          <Wallet className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-mono text-slate-300">
            {formatAddress(address!)}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4 text-slate-400 hover:text-red-400" />
        </button>
      </div>
    );
  }

  if (isConnected && isWrongChain) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-lg border border-red-500/50">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-400">Wrong Network</span>
        </div>
        <button
          onClick={() => switchChain({ chainId: polygonAmoy.id })}
          disabled={isSwitching}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {isSwitching ? "Switching..." : "Switch to Amoy"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      disabled={isConnecting}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
    >
      <Wallet className="w-4 h-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}

