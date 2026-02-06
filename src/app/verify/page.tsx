"use client";
import React, { useState } from "react";
import { MatrixRain } from "@/components/MatrixRain";
import { Navbar } from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShieldAlert, ShieldCheck, Activity } from "lucide-react";

interface IncidentReport {
  _id: string;
  type: string;
  severity: string;
  description: string;
  timestamp: string;
}

export default function VerifyPage() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<IncidentReport[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setHasSearched(false);

    try {
      const res = await fetch(`/api/verify/${query}`);
      const json = await res.json();
      setResults(json.data);
      setHasSearched(true);
    } catch (err) {
      console.error("SEARCH_INTERRUPTED");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#01030a] text-cyan-400 font-mono relative">
      <MatrixRain />
      <Navbar />

      <main className="relative z-20 pt-20 px-6 max-w-4xl mx-auto pb-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-[0.3em] text-white mb-4">ENTITY_VERIFICATION</h1>
          <p className="text-[10px] text-cyan-800 tracking-[0.4em] uppercase underline underline-offset-8">Cross-referencing database nodes...</p>
        </div>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="relative mb-16">
          <div className="absolute -inset-1 bg-cyan-500/20 blur opacity-25" />
          <div className="relative flex bg-black border border-cyan-500/30 p-1">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ENTER_PHONE_OR_ACCOUNT_NUMBER..."
              className="bg-transparent flex-1 p-5 outline-none text-white tracking-widest placeholder:text-cyan-950 text-sm"
            />
            <button className="bg-cyan-500 text-black px-10 font-black hover:bg-white transition-all flex items-center gap-2">
              <Search size={18} /> QUERY
            </button>
          </div>
        </form>

        {/* RESULTS AREA */}
        <div className="space-y-6">
          {loading && (
            <div className="text-center py-10">
              <Activity className="animate-spin mx-auto text-cyan-500 mb-4" />
              <p className="text-[10px] animate-pulse tracking-[0.3em]">SCANNING_GRID_FOR_MATCHES...</p>
            </div>
          )}

          <AnimatePresence>
            {hasSearched && results && (
              results.length === 0 ? (
                /* CLEAN RECORD */
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-emerald-500/30 bg-emerald-500/5 p-10 text-center rounded-sm">
                  <ShieldCheck className="mx-auto text-emerald-500 mb-4" size={48} />
                  <h2 className="text-white font-black tracking-widest mb-2 text-xl">STATUS: SECURE</h2>
                  <p className="text-emerald-700 text-xs">No active threat vectors found for this identifier.</p>
                </motion.div>
              ) : (
                /* THREATS FOUND */
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-rose-500 mb-6">
                    <ShieldAlert size={24} />
                    <span className="font-black tracking-[0.2em]">{results.length} MATCHING_THREATS_FOUND</span>
                  </div>
                  {results.map((report) => (
                    <motion.div 
                      key={report._id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="border-l-4 border-rose-600 bg-white/5 p-6 backdrop-blur-md"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-rose-600 text-white text-[9px] px-2 py-1 font-bold tracking-widest uppercase">
                          {report.type}
                        </span>
                        <span className="text-[9px] text-cyan-900">{new Date(report.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed italic">"{report.description}"</p>
                      <div className="mt-4 text-[9px] font-bold text-rose-400 tracking-widest">SEVERITY: {report.severity}</div>
                    </motion.div>
                  ))}
                </div>
              )
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}