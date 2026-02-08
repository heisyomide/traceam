"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Radar, MapPin } from "lucide-react";

interface TacticalRadarProps {
  userData: any;
  addLog: (msg: string) => void;
  location: { lat: number; lng: number } | null;
  setLocation: (loc: { lat: number; lng: number } | null) => void;
  sos: { active: boolean; countdown: number | null };
  setSos: React.Dispatch<React.SetStateAction<{ active: boolean; countdown: number | null }>>;
}

export default function TacticalRadar({ 
  userData, 
  addLog, 
  location, 
  setLocation, 
  sos, 
  setSos 
}: TacticalRadarProps) {
  
  const watchId = useRef<number | null>(null);
  const incidentId = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  // --- SOS Persistence Logic (The Refresh Fix) ---
  useEffect(() => {
    if (userData?.sosActive && !sos.active && isInitialMount.current) {
      addLog("RESTORING_ACTIVE_UPLINK...");
      setSos({ active: true, countdown: null });
      startTracking();
      isInitialMount.current = false;
    }
  }, [userData]);

  // --- SOS Gatekeeper ---
  const handleSOSRequest = () => {
    if (!userData) {
      addLog("ERROR: USER_DATA_NOT_SYNCED");
      return;
    }

    const isVerified = userData.kycStatus === "APPROVED";

    if (!isVerified) {
      addLog("CRITICAL: KYC_NOT_VERIFIED");
      alert(`SIGNAL_BLOCKED: Personnel status is ${userData.kycStatus || 'UNVERIFIED'}. Admin approval required.`);
      return;
    }

    if (sos.countdown || sos.active) return;
    setSos(p => ({ ...p, countdown: 5 }));
  };

  // --- Countdown Timer ---
  useEffect(() => {
    if (sos.countdown === null) return;
    if (sos.countdown === 0) {
      setSos({ active: true, countdown: null });
      addLog("!!! EMERGENCY_BROADCAST_ACTIVE !!!");
      startTracking();
      return;
    }
    const timer = setTimeout(() => {
      setSos(prev => ({ ...prev, countdown: prev.countdown! - 1 }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [sos.countdown]);

  // --- Tracking & Telemetry Engine ---
// TacticalRadar.tsx - Updated startTracking Function

const startTracking = () => {
  if (!navigator.geolocation) return addLog("GPS_NOT_SUPPORTED");
  if (watchId.current !== null) return; 

  addLog("SEARCHING_SATELLITES...");

  // 🛰️ RECOVER INCIDENT ON REFRESH
  if (userData?.activeIncidentId && !incidentId.current) {
    incidentId.current = userData.activeIncidentId;
    addLog("RE-ESTABLISHING_INCIDENT_UPLINK...");
  }

  watchId.current = window.navigator.geolocation.watchPosition(
    async (pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setLocation(coords);
      
      try {
        const isNewIncident = !incidentId.current;
        const endpoint = isNewIncident ? "/api/sos/start" : "/api/sos/update";
        
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            incidentId: incidentId.current,
            coordinates: coords,
          })
        });
        
        const data = await res.json();
        
        if (data.success && isNewIncident) {
          // 🏆 THIS UPDATES THE LOG IN THE IMAGE
          incidentId.current = data.incidentId;
          addLog("INCIDENT_LOGGED_IN_GRID");
          addLog(`CONTACTS_NOTIFIED: ${data.contactsNotified}`); 
        }
      } catch (err) {
        addLog("TELEMETRY_SYNC_FAILED");
      }
    },
    () => addLog("GPS_SIGNAL_LOST"),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
};

  const stopSOS = async () => {
    // Clear local watcher
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    
    try {
      const res = await fetch("/api/sos/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId: incidentId.current }),
      });
      
      if (res.ok) {
        addLog("EMERGENCY_CLOSED: STATUS_RESOLVED");
        setSos({ active: false, countdown: null });
        incidentId.current = null;
        setLocation(null);
      }
    } catch { 
      addLog("STOP_PROTOCOL_FAILURE"); 
    }
  };

  return (
    <section className="bg-black/20 border border-white/5 rounded-4xl h-full min-h-[600px] overflow-hidden relative flex items-center justify-center">
      {/* Radar Sweep Animation */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute pointer-events-none opacity-20"
      >
        <Radar size={750} strokeWidth={0.5} className="text-cyan-500" />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Active Signal HUD */}
        <AnimatePresence>
          {sos.active && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="absolute -top-32 bg-rose-600/10 border border-rose-500/50 px-6 py-2 rounded-2xl flex flex-col items-center gap-1 shadow-[0_0_30px_rgba(244,63,94,0.1)]"
            >
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] animate-pulse">Live_Uplink_Active</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    animate={{ height: [4, 12, 4] }} 
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }} 
                    className="w-0.5 bg-rose-500" 
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Node Visualization */}
        <motion.div 
          animate={sos.active ? { scale: [1, 1.1, 1], filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] } : {}} 
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="relative"
        >
          <Globe size={220} className={`${sos.active ? "text-rose-500 drop-shadow-[0_0_35px_rgba(244,63,94,0.4)]" : "text-cyan-500/40"}`} />
          {location && (
            <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <MapPin className={`${sos.active ? "text-rose-500" : "text-cyan-400"}`} size={40} />
              <motion.div 
                animate={{ scale: [1, 2.5], opacity: [0.5, 0] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={`absolute inset-0 rounded-full border-2 ${sos.active ? "border-rose-500" : "border-cyan-400"}`}
              />
            </motion.div>
          )}
        </motion.div>

        {/* Telemetry Display */}
        {location && (
          <div className="mt-12 bg-black/60 backdrop-blur-xl border border-white/5 px-8 py-4 rounded-3xl flex items-center gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
            <div className="text-left font-mono">
              <p className="text-[8px] text-slate-500 uppercase tracking-[0.3em]">GPS_Telemetry_Stream</p>
              <p className="text-xs font-bold text-white tracking-widest tabular-nums">
                {location.lat.toFixed(6)}°N <span className="text-slate-600 px-1">|</span> {location.lng.toFixed(6)}°E
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SOS Control Unit */}
      <div className="absolute bottom-12 w-full flex justify-center">
        <AnimatePresence mode="wait">
          {sos.countdown !== null ? (
            <motion.button
              key="abort"
              initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
              onClick={() => { setSos({ active: false, countdown: null }); addLog("SOS_ABORTED"); }}
              className="bg-rose-600 w-24 h-24 rounded-full text-white font-black text-3xl border-[6px] border-white/10 shadow-[0_0_40px_rgba(225,29,72,0.4)] relative"
            >
              <span className="relative z-10">{sos.countdown}</span>
              <motion.div 
                initial={{ height: "100%" }} animate={{ height: "0%" }} transition={{ duration: 5, ease: "linear" }}
                className="absolute bottom-0 left-0 right-0 bg-black/20 rounded-full"
              />
            </motion.button>
          ) : (
            <button
              onClick={sos.active ? stopSOS : handleSOSRequest}
              className={`px-16 py-6 rounded-2xl font-black text-[11px] tracking-[0.5em] uppercase transition-all duration-500 border group ${
                sos.active 
                ? "bg-slate-900 text-slate-500 border-white/5 shadow-inner" 
                : "bg-rose-600/10 border-rose-500/40 text-rose-500 hover:bg-rose-600 hover:text-white hover:shadow-[0_0_30px_rgba(225,29,72,0.3)]"
              }`}
            >
              {sos.active ? "End_Emergency_Protocol" : "Trigger_Distress_Signal"}
            </button>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}