"use client";

import React, { useState } from "react";
import { Fingerprint } from "lucide-react";

interface VerificationCardProps {
  addLog: (msg: string) => void;
}

export default function VerificationCard({ addLog }: VerificationCardProps) {
  const [scanInput, setScanInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput || isScanning) return;

    setIsScanning(true);
    addLog(`INIT_SCAN: ${scanInput}`);
    
    try {
      // 🛰️ Uplink to your scanning API
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: scanInput }),
      });
      
      addLog("QUERYING_GLOBAL_DATABASE...");
      
      if (!res.ok) throw new Error("NODE_NOT_FOUND");
      
      const data = await res.json();
      
      // Simulate decryption delay for aesthetic
      await new Promise(r => setTimeout(r, 1200));
      
      if (data.found) {
        addLog(`MATCH_FOUND: ${data.name || 'ANONYMOUS_ENTITY'}`);
      } else {
        addLog("NO_MATCHING_RECORDS_IN_GRID");
      }
      
    } catch (err) {
      addLog("SCAN_UPLINK_FAILURE");
    } finally {
      setIsScanning(false);
      setScanInput("");
    }
  };

  return (
    <section className="bg-black/40 border border-white/10 p-6 rounded-[2rem] shadow-2xl backdrop-blur-lg">
      <h3 className="text-[10px] font-bold tracking-[0.2em] mb-4 flex items-center gap-2 text-cyan-500">
        <Fingerprint size={16} /> DATA_VERIFICATION
      </h3>
      
      <form onSubmit={handleScan} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            placeholder="USER_UID / PHONE_NUMBER"
            className="w-full bg-black/50 border border-white/10 p-3.5 rounded-xl text-xs font-mono outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700 text-white"
          />
          {isScanning && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        
        <button 
          type="submit"
          disabled={isScanning || !scanInput} 
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-3 rounded-xl text-[10px] tracking-[0.2em] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isScanning ? "PROCESSING_DECRYPTION..." : "EXECUTE_SCAN"}
        </button>
      </form>
    </section>
  );
}