"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits } from "viem";
import { MOCK_FEED_ADDRESS, FEED_PROXY_ADDRESS, MOCK_FEED_ABI, FEED_PROXY_ABI } from "@/abis";
import { polygonAmoy, sepolia } from "wagmi/chains";
import { useEffect, useRef, useState } from "react";
import { ConnectWallet } from "@/components/ConnectWallet";
import { Loader2, CheckCircle2 } from "lucide-react";

function formatPrice(value: bigint): string {
  const formatted = formatUnits(value, 8);
  return parseFloat(formatted).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Home() {
  const [logs, setLogs] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const prevOriginPrice = useRef<bigint | null>(null);
  const prevDestPrice = useRef<bigint | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Read Origin Price (Polygon Amoy)
  const {
    data: originData,
    refetch: refetchOrigin,
  } = useReadContract({
    address: MOCK_FEED_ADDRESS,
    abi: MOCK_FEED_ABI,
    functionName: "latestRoundData",
    chainId: polygonAmoy.id,
  });

  // Read Destination Price (Ethereum Sepolia) - Poll every 2 seconds
  const {
    data: destData,
  } = useReadContract({
    address: FEED_PROXY_ADDRESS,
    abi: FEED_PROXY_ABI,
    functionName: "latestRoundData",
    chainId: sepolia.id,
    query: {
      refetchInterval: 2000,
    },
  });

  // Write contract for updating price
  const { writeContract, data: hash, isPending: isPendingWallet } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isMining, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash,
    chainId: polygonAmoy.id,
  });

  // Extract data
  const originRoundId = originData?.[0] ?? 0n;
  const originPrice = originData?.[1] ?? 0n;
  const originUpdatedAt = originData?.[3] ?? 0n;

  const destRoundId = destData?.[0] ?? 0n;
  const destPrice = destData?.[1] ?? 0n;
  const destUpdatedAt = destData?.[3] ?? 0n;

  // Sync status
  const isSynced = originRoundId === destRoundId && originRoundId > 0n;
  const isBridging = originRoundId > destRoundId;

  // Log price changes to terminal
  useEffect(() => {
    if (originPrice !== 0n && originPrice !== prevOriginPrice.current && prevOriginPrice.current !== null) {
      const timestamp = new Date().toLocaleTimeString();
      setLogs((prev) => [
        ...prev,
        `[${timestamp}] [ORIGIN] Price updated on Amoy: $${formatPrice(originPrice)}`,
      ]);
    }
    if (originPrice !== 0n) {
      prevOriginPrice.current = originPrice;
    }
  }, [originPrice]);

  useEffect(() => {
    if (destPrice !== 0n && destPrice !== prevDestPrice.current && prevDestPrice.current !== null) {
      const timestamp = new Date().toLocaleTimeString();
      setLogs((prev) => [
        ...prev,
        `[${timestamp}] [DESTINATION] synced via Reactive: $${formatPrice(destPrice)}`,
      ]);
    }
    if (destPrice !== 0n) {
      prevDestPrice.current = destPrice;
    }
  }, [destPrice]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Handle transaction success
  useEffect(() => {
    if (isTxSuccess) {
      setShowSuccess(true);
      refetchOrigin();
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [isTxSuccess, refetchOrigin]);

  // Handle price update
  const handleUpdatePrice = async () => {
    if (!originData) return;

    const [roundId, currentPrice] = originData;
    // Add 100 (with 8 decimals) to current price: 100 * 10^8 = 10000000000
    const newPrice = currentPrice + 10000000000n;

    writeContract({
      address: MOCK_FEED_ADDRESS,
      abi: MOCK_FEED_ABI,
      functionName: "updatePrice",
      args: [newPrice],
      chainId: polygonAmoy.id,
    });
  };

  // Button state logic
  const getButtonState = () => {
    if (showSuccess) {
      return {
        text: "Update Successful!",
        icon: <CheckCircle2 className="w-4 h-4" />,
        className: "bg-emerald-600 hover:bg-emerald-700",
        disabled: true,
      };
    }
    if (isPendingWallet) {
      return {
        text: "Check Wallet...",
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        className: "bg-amber-600 hover:bg-amber-700",
        disabled: true,
      };
    }
    if (isMining) {
      return {
        text: "Updating Chain...",
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        className: "bg-amber-600 hover:bg-amber-700",
        disabled: true,
      };
    }
    return {
      text: "Force Price Update (+100)",
      icon: null,
      className: "bg-blue-600 hover:bg-blue-700",
      disabled: !originData,
    };
  };

  const buttonState = getButtonState();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">ReactiveLink</h1>
            <p className="text-slate-400">Command Center - Cross-Chain Oracle Monitor</p>
          </div>
          <ConnectWallet />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Origin Card - Blue Border */}
          <div className="bg-slate-900/50 border-2 border-blue-500/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-blue-400">📡 Origin Chain</h2>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                Polygon Amoy ({polygonAmoy.id})
              </span>
            </div>

            <div className="space-y-4">
              {/* Price Display */}
              <div>
                <p className="text-sm text-slate-400 mb-1">Current Price</p>
                <p className="text-4xl font-mono text-emerald-400">
                  ${formatPrice(originPrice)}
                </p>
              </div>

              {/* Round ID */}
              <div>
                <p className="text-sm text-slate-400 mb-1">Round ID</p>
                <p className="text-2xl font-mono text-slate-300">{originRoundId.toString()}</p>
              </div>

              {/* Update Button */}
              <button
                onClick={handleUpdatePrice}
                disabled={buttonState.disabled}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 ${buttonState.className} disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors`}
              >
                {buttonState.icon}
                {buttonState.text}
              </button>
            </div>
          </div>

          {/* Destination Card - Purple Border */}
          <div className="bg-slate-900/50 border-2 border-purple-500/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-purple-400">🎯 Destination Chain</h2>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                Ethereum Sepolia ({sepolia.id})
              </span>
            </div>

            <div className="space-y-4">
              {/* Price Display */}
              <div>
                <p className="text-sm text-slate-400 mb-1">Current Price</p>
                <p className="text-4xl font-mono text-emerald-400">
                  ${formatPrice(destPrice)}
                </p>
              </div>

              {/* Round ID */}
              <div>
                <p className="text-sm text-slate-400 mb-1">Round ID</p>
                <p className="text-2xl font-mono text-slate-300">{destRoundId.toString()}</p>
              </div>

              {/* Sync Status Badge */}
              <div className="pt-2">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                    isSynced
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                      : isBridging
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {isSynced ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Synced ✅</span>
                    </>
                  ) : isBridging ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Bridging... ⏳</span>
                    </>
                  ) : (
                    <span>Initializing...</span>
                  )}
                </div>
              </div>

              {/* Auto-refresh indicator */}
              <div className="pt-2">
                <p className="text-xs text-slate-500 text-center">
                  🔄 Auto-refreshing every 2s
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Terminal */}
        <div className="bg-black border border-slate-800 rounded-xl p-4 overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="ml-2 text-xs text-slate-500 font-mono">Live Terminal</span>
          </div>
          <div
            ref={terminalRef}
            className="h-48 overflow-y-auto font-mono text-sm text-emerald-400 space-y-1"
            style={{ scrollbarWidth: "thin" }}
          >
            {logs.length === 0 ? (
              <p className="text-slate-600">Waiting for price updates...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>
            Updates from Polygon Amoy are automatically mirrored to Ethereum Sepolia via Reactive
            Network
          </p>
        </div>
      </div>
    </div>
  );
}
