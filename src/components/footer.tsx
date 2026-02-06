"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const Footer = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    setMounted(true);
    const updateTime = () => setTimestamp(new Date().toISOString());
    updateTime();
    
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="relative z-20 border-t border-cyan-900/50 p-10 mt-20 bg-black/80">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
        
        {/* LOG DATA (SECRET ADMIN GATEWAY) */}
        <div className="font-mono text-[9px] text-cyan-900 leading-relaxed uppercase tracking-widest">
          {/* ✅ Hidden Trigger: Clicking "// SYSTEM_LOGS" initiates the admin handshake */}
          <p 
            onClick={() => router.push("/admin/verify")}
            className="text-cyan-700 font-bold mb-1 cursor-pointer hover:text-cyan-400 hover:glow-sm transition-all duration-300"
            title="Access Restricted"
          >
            // SYSTEM_LOGS
          </p>
          <p>UPLINK_STATUS: ACTIVE</p>
          <p>LOCAL_TIME: {mounted ? timestamp : "INITIALIZING..."}</p>
          <p>LOCATION: 6.5244° N, 3.3792° E [LAGOS_HUB]</p>
        </div>

        {/* COPYRIGHT / BRAND */}
        <div className="text-center">
          <div className="text-[10px] text-white font-black tracking-[0.6em] uppercase mb-2">
            TraceAm Security Network
          </div>
          <p className="text-[8px] text-cyan-900 tracking-widest">NO_UNAUTHORIZED_ACCESS_ALLOWED</p>
        </div>

        {/* LEGAL_PROTOCOLS */}
        <div className="flex flex-wrap justify-end gap-6 text-[9px] font-bold tracking-[0.3em] uppercase">
          <a href="#" className="text-cyan-700 hover:text-cyan-400 transition-colors underline decoration-cyan-900 underline-offset-4">Privacy_Vault</a>
          <a href="#" className="text-cyan-700 hover:text-cyan-400 transition-colors underline decoration-cyan-900 underline-offset-4">Legal_Intel</a>
          <a href="#" className="text-cyan-700 hover:text-cyan-400 transition-colors underline decoration-cyan-900 underline-offset-4">Node_Registry</a>
        </div>
      </div>

      <div className="mt-10 h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-900 to-transparent" />
    </footer>
  );
};