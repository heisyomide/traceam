"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X, Terminal } from "lucide-react";

export const LiveAlertSystem = () => {
  const [activeAlert, setActiveAlert] = useState<any>(null);

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const res = await fetch("/api/alerts/recent");
        const data = await res.json();
        if (data.alert) {
          setActiveAlert(data.alert);
          // Play a subtle "beep" sound if you want
        }
      } catch (err) {
        console.error("ALERT_LINK_ERROR");
      }
    };

    // Poll every 30 seconds
    const interval = setInterval(checkAlerts, 30000);
    checkAlerts(); // Initial check

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {activeAlert && (
        <motion.div 
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="fixed bottom-10 right-10 z-[100] w-80 bg-black border-2 border-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.4)] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-rose-600 p-2 flex justify-between items-center">
            <div className="flex items-center gap-2 text-white">
              <ShieldAlert size={16} className="animate-pulse" />
              <span className="text-[10px] font-black tracking-widest">EMERGENCY_BROADCAST</span>
            </div>
            <button onClick={() => setActiveAlert(null)} className="text-white hover:rotate-90 transition-transform">
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Terminal size={12} className="text-rose-500" />
              <p className="text-[9px] text-rose-500 font-bold uppercase tracking-tighter">
                Critical Threat Detected in {activeAlert.locationName || "Unknwon Sector"}
              </p>
            </div>
            
            <p className="text-[11px] text-gray-300 italic border-l-2 border-rose-900 pl-2">
              "{activeAlert.description.substring(0, 80)}..."
            </p>

            <div className="flex justify-between items-end pt-2">
              <div className="text-[8px] text-rose-800">
                ID: {activeAlert.identifier.substring(0, 5)}***
              </div>
              <button 
                onClick={() => window.location.href = `/verify?q=${activeAlert.identifier}`}
                className="text-[9px] bg-rose-950 text-rose-400 px-3 py-1 border border-rose-800 hover:bg-rose-600 hover:text-white transition-colors uppercase font-black"
              >
                Analyze_Node
              </button>
            </div>
          </div>

          {/* Moving scanline effect */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-rose-500/5 to-transparent h-20 w-full animate-scan" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};