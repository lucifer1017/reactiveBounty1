"use client";

import { useReadContract } from "wagmi";
import { FEED_PROXY_ADDRESS, FEED_PROXY_ABI } from "@/abis";
import { sepolia } from "wagmi/chains";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export function Diagnostics() {
  // Read FeedProxy's reactiveVmId (it's immutable, so we need to check the deployment)
  // Since we can't read immutable directly, we'll check if updates are working
  
  const { data: destData, error: destError } = useReadContract({
    address: FEED_PROXY_ADDRESS,
    abi: FEED_PROXY_ABI,
    functionName: "latestRoundData",
    chainId: sepolia.id,
  });

  const expectedReactiveVmId = "0x70cF2C2703D2Dc02f5c0A1C3b9B430F1A1E9D359"; // ReactiveMirror address
  const feedProxyAddress = FEED_PROXY_ADDRESS;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mt-4">
      <h3 className="text-lg font-semibold mb-3 text-amber-400">🔍 Diagnostics</h3>
      <div className="space-y-2 text-sm font-mono">
        <div className="flex items-center gap-2">
          {destError ? (
            <XCircle className="w-4 h-4 text-red-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span className="text-slate-300">
            FeedProxy Read: {destError ? "❌ Error" : "✅ Connected"}
          </span>
        </div>
        {destError && (
          <div className="ml-6 text-xs text-red-400">
            {destError.message}
          </div>
        )}
        <div className="pt-2 border-t border-slate-800">
          <p className="text-slate-400 mb-1">Expected RVM ID:</p>
          <p className="text-emerald-400 break-all">{expectedReactiveVmId}</p>
        </div>
        <div className="pt-2 border-t border-slate-800">
          <p className="text-slate-400 mb-1">FeedProxy Address:</p>
          <p className="text-blue-400 break-all">{feedProxyAddress}</p>
        </div>
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
            <div>
              <p className="text-amber-400 font-semibold">Potential Issue:</p>
              <p className="text-slate-400 text-xs mt-1">
                FeedProxy was deployed with <code className="text-red-400">reactiveVmId = deployer EOA</code>.
                It should be <code className="text-emerald-400">ReactiveMirror address</code> ({expectedReactiveVmId}).
                This mismatch causes callbacks to be rejected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}







