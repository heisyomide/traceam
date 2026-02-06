"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, AlertTriangle, CheckCircle2, Activity, Cpu, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MatrixRain } from "./MatrixRain";

export const SearchTerminal = () => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setStatus("loading");
    setReports([]);
    setLogs([
      "› INITIALIZING SECURE UPLINK...",
      `› TARGET_ID: ${query.toUpperCase()}`,
      "› QUERYING MONGODB_GRID..."
    ]);

    try {
      // Ensure the backticks are used correctly for the template literal
      const response = await fetch(`/api/verify/${encodeURIComponent(query)}`);
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Target endpoint returned HTML (404). Check API folder structure.");
      }

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "UNKNOWN_ERROR");

      // Small delay to make the "scanning" logs feel real
      setTimeout(() => {
        setReports(result.data);
        setStatus("success");
        setLogs(prev => [...prev, `› SCAN_COMPLETE: ${result.count} RECORDS FOUND.`]);
      }, 800);

    } catch (err: any) {
      setStatus("error");
      setLogs(prev => [...prev, `› CRITICAL_FAILURE: ${err.message}`]);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#02040f] py-16 px-6 relative overflow-hidden">

                      {/* The Matrix Rain Layer */}
              <MatrixRain />
      {/* Dynamic Background Grid - Fixed bg-size syntax */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)',
          backgroundSize: '40px 40px' 
        }} 
      />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* CENTERED HEADER */}
        <div className="text-center mb-16 space-y-4">
          <div className="flex justify-center items-center gap-3">
            <Cpu size={16} className="text-cyan-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.5em] text-cyan-500 uppercase">Neural Monitor LAG-92X</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic text-white leading-none">
            Deep <span className="text-cyan-500 text-glow">Verify</span>
          </h1>
        </div>

        {/* CENTERED CONTROL UNIT */}
        <div className="max-w-3xl mx-auto space-y-6 mb-20">
          <div className="bg-[#03070c] border border-white/10 p-2 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.1)]">
            <form onSubmit={handleSearch} className="relative">
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                placeholder="Search Phone, Email, or Alias..."
                className="w-full bg-[#080b12] text-white border border-white/5 rounded-xl py-6 pl-14 pr-4 placeholder:text-slate-700 outline-none focus:border-cyan-500/30 transition-all font-bold text-lg appearance-none"
                style={{ 
                  WebkitBoxShadow: "0 0 0px 1000px #080b12 inset", 
                  WebkitTextFillColor: "white",
                  backgroundColor: "#080b12" 
                }}
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" size={24} />
              <button 
                type="submit"
                disabled={status === "loading"}
                className="absolute right-3 top-3 bottom-3 bg-cyan-600 hover:bg-cyan-500 text-white px-8 rounded-lg transition-all font-black tracking-tighter italic disabled:opacity-50"
              >
                {status === "loading" ? <Loader2 className="animate-spin" /> : "EXECUTE"}
              </button>
            </form>
          </div>

          {/* Integrated Console */}
          <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4 opacity-40">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">System Status Feed</span>
              <Activity size={12} className="text-cyan-500" />
            </div>
            <div className="h-32 overflow-y-auto font-mono text-[11px] text-cyan-500/60 space-y-1.5 scrollbar-hide">
              {logs.length === 0 && <p className="italic text-slate-800">› Standby for uplink initiation...</p>}
              {logs.map((log, i) => <p key={i} className="animate-in fade-in slide-in-from-left-1">{log}</p>)}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>

        {/* INTELLIGENCE GRID */}
        <AnimatePresence mode="wait">
          {status === "success" && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {reports.length > 0 ? (
                reports.map((report, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-[#05070a] border border-white/10 p-6 rounded-3xl hover:border-cyan-500/40 transition-all relative group overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 px-4 py-1.5 text-[9px] font-black uppercase rounded-bl-xl ${
                      report.severity === 'HIGH' ? 'bg-rose-600 text-white' : 'bg-cyan-600 text-white'
                    }`}>
                      {report.severity || 'LOW'} RISK
                    </div>

                    <div className="mb-4 inline-flex p-3 bg-white/5 rounded-xl group-hover:text-cyan-500 transition-colors">
                      <AlertTriangle size={24} />
                    </div>

                    <h4 className="text-xl font-bold text-white mb-2 uppercase italic leading-tight">{report.type}</h4>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3">{report.description}</p>
                    
                    <div className="flex items-center gap-3 pt-4 border-t border-white/5 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                      <MapPin size={10} className="text-cyan-500" />
                      {report.locationName || "Global Node"}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 border border-emerald-500/20 bg-emerald-500/5 rounded-[3rem] text-center">
                   <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
                   <h3 className="text-4xl font-black text-white italic uppercase">Registry Clear</h3>
                   <p className="text-slate-500 mt-2">No active threat markers found for this identifier.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};