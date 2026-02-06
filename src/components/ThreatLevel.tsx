"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Activity, Zap, BarChart3, WifiOff } from "lucide-react";
import { MatrixRain } from "./MatrixRain";

export const ThreatLevel = () => {
  const [stats, setStats] = useState({ total: 0, threatIndex: 0 });
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (!res.ok) throw new Error("Offline");
        const data = await res.json();
        setStats({ total: data.total ?? 0, threatIndex: data.threatIndex ?? 0 });
        setIsOffline(false);
      } catch (err) {
        setIsOffline(true);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="h-[380px] flex flex-col items-center justify-center border border-white/5 bg-black/40 rounded-[2rem] gap-4">
      <Activity className="text-cyan-500 animate-spin" size={32} />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-900">Syncing Grid...</span>
    </div>
  );

  return (
    <div className="relative group overflow-hidden rounded-[2rem] border border-white/10 bg-[#05070a] p-8 shadow-2xl transition-all hover:border-cyan-500/30">

                      {/* The Matrix Rain Layer */}
              <MatrixRain />
      {/* Matrix-style decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
        <BarChart3 size={140} />
      </div>

      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-cyan-500 fill-cyan-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">Global Threat Index</span>
            </div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Live Analytics</h3>
          </div>
          
          {isOffline ? (
            <div className="px-3 py-1 rounded-full border border-rose-500/20 bg-rose-500/5 flex items-center gap-2">
              <WifiOff size={12} className="text-rose-500" />
              <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Local Mode</span>
            </div>
          ) : (
            <div className="px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Uplink Active</span>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-baseline gap-3">
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-7xl font-black tracking-tighter ${stats.threatIndex > 70 ? 'text-rose-500' : 'text-white'}`}
            >
              {stats.threatIndex}%
            </motion.span>
            <span className="text-slate-600 font-bold uppercase text-[10px] tracking-widest leading-none">Risk<br/>Factor</span>
          </div>
          
          <div className="mt-6 h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${stats.threatIndex}%` }}
              transition={{ duration: 2, ease: "circOut" }}
              className={`h-full rounded-full ${
                stats.threatIndex > 70 
                  ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]" 
                  : "bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
          <div className="space-y-1">
            <p className="text-slate-700 text-[9px] font-black uppercase tracking-widest">Detections</p>
            <p className="text-2xl font-bold text-white tracking-tighter italic font-mono">
              {(stats.total ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-slate-700 text-[9px] font-black uppercase tracking-widest">Grid Health</p>
            <p className={`text-2xl font-bold tracking-tighter italic uppercase ${isOffline ? 'text-slate-500' : 'text-emerald-500'}`}>
              {isOffline ? 'Standby' : 'Optimal'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};