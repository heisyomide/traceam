"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";

// --- Custom Components ---
import HeaderHUD from "@/components/dashboard/HeaderHUD";
import VerificationCard from "@/components/dashboard/VerificationCard";
import IncidentReport from "@/components/dashboard/IncidentReport";
import TacticalRadar from "@/components/dashboard/TacticalRadar";
import SystemLogs from "@/components/dashboard/SystemLogs";
import { motion } from "framer-motion";

/**
 * ProfessionalDashboard: The Central Command Hub.
 * Manages shared state for GPS tracking and SOS signaling.
 */
export default function ProfessionalDashboard() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>(["SYSTEM_INITIALIZED", "GRID_STABLE"]);

  // 🛰️ SHARED (LIFTED) STATE
  // These states live here so TacticalRadar can update them 
  // and IncidentReport can read them simultaneously.
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sos, setSos] = useState<{ active: boolean; countdown: number | null }>({
    active: false,
    countdown: null,
  });

  // --- Logger Function ---
  const addLog = useCallback((msg: string) => {
    setLogs((prev) => {
      const newLogs = [...prev, msg.toUpperCase()];
      // Keep only the last 12 entries for performance/visuals
      return newLogs.slice(-12);
    });
  }, []);

  // --- Initial Auth Check ---
useEffect(() => {
    const fetchUser = async () => {
      try {
        // Attempt to reach the new endpoint we just created
        const res = await fetch("/api/user/me");
        
        if (!res.ok) {
          const errorData = await res.json();
          addLog(`AUTH_ERR: ${errorData.error || "SESSION_EXPIRED"}`);
          // If the token is dead, we should probably send them back to login
          // setTimeout(() => window.location.href = "/auth/login", 2000);
          return;
        }

        const data = await res.json();
        setUserData(data);

        // --- Intelligence Logs ---
        addLog(`NODE_CONNECTED: ${data.name || "SECURE_NODE"}`);
        
        if (data.kycStatus === "APPROVED") {
          addLog("SECURITY_CLEARANCE: LEVEL_1_APPROVED");
        } else {
          addLog(`STATUS_NOTICE: KYC_${data.kycStatus || "NONE"}`);
        }

      } catch (e) {
        addLog("SYSTEM_OFFLINE: UPLINK_TIMEOUT");
        console.error("DASHBOARD_FETCH_ERROR:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [addLog]);

  // --- Loading Screen ---
  if (loading) return (
    <div className="min-h-screen bg-[#01030a] flex flex-col items-center justify-center font-mono">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <Loader2 className="text-cyan-500 mb-6" size={48} />
      </motion.div>
      <p className="text-cyan-500 tracking-[0.5em] text-[10px] animate-pulse">
        ESTABLISHING_SECURE_UPLINK...
      </p>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#01030a] text-slate-300 p-4 lg:p-8 font-sans selection:bg-cyan-500/30">
      
      {/* 1. Global Header HUD */}
      <HeaderHUD userData={userData} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full items-stretch">
        
        {/* 2. Left Intelligence Panel (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <VerificationCard addLog={addLog} />
          
          {/* ✅ DATA_FLOW: Receives 'location' from parent state */}
          <IncidentReport addLog={addLog} location={location} />
          
          <div className="mt-auto p-4 border border-white/5 rounded-3xl bg-white/[0.02]">
             <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">System_Integrity</p>
             <div className="flex gap-1 mt-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-1 w-full bg-emerald-500/20 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* 3. Main Tactical HUD (col-span-8) */}
        <div className="lg:col-span-8 relative min-h-[650px]">
          
          {/* Real-time System Log Overlay */}
          <SystemLogs logs={logs} />
          
          {/* ✅ DATA_FLOW: Controls 'location' and 'sos' states for the whole dashboard */}
          <TacticalRadar 
            userData={userData} 
            addLog={addLog} 
            location={location}
            setLocation={setLocation}
            sos={sos}
            setSos={setSos}
          />
          
        </div>
      </div>
    </main>
  );
}