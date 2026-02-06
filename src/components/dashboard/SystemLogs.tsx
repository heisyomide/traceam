"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

interface SystemLogsProps {
  logs: string[];
}

export default function SystemLogs({ logs }: SystemLogsProps) {
  return (
    <div className="absolute top-10 left-10 z-20 pointer-events-none">
      <div className="flex items-center gap-2 mb-4 text-cyan-500/80">
        <Activity size={14} className="animate-pulse" />
        <span className="text-[10px] font-black tracking-[0.3em]">LIVE_HUD_FEED</span>
      </div>
      
      <div className="space-y-1">
        {logs.map((log, i) => (
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.8, x: 0 }}
            key={`${log}-${i}`} 
            className={`text-[9px] font-mono tracking-tighter ${
              log.includes("!!!") || log.includes("CRITICAL") 
                ? "text-rose-500 font-bold" 
                : "text-cyan-400"
            }`}
          >
            <span className="opacity-40 mr-2">
              [{new Date().toLocaleTimeString([], { hour12: false })}]
            </span>
            {log}
          </motion.p>
        ))}
      </div>
    </div>
  );
}