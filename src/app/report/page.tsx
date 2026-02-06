"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { MatrixRain } from "@/components/MatrixRain";
import { Navbar } from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, AlertCircle, CheckCircle2 } from "lucide-react";

// --- Types ---
interface ReportFormData {
  identifier: string;
  type: string;
  severity: string;
  description: string;
  locationName: string;
}

export default function ReportPage() {
  // --- State ---
  const [mounted, setMounted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [logIdentifier, setLogIdentifier] = useState<string>("INITIALIZING...");

  const [formData, setFormData] = useState<ReportFormData>({
    identifier: "",
    type: "FINANCIAL_FRAUD",
    severity: "LOW",
    description: "",
    locationName: ""
  });

  // --- Hydration Fix & Initialization ---
  useEffect(() => {
    setMounted(true);
    setLogIdentifier(Date.now().toString());
  }, []);

  // --- Handlers ---
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mounted) return;
    
    setLoading(true);

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        console.log("UPLINK_HASH_RECEIVED:", result.reportId);
      } else {
        alert(`PROTOCOL_ERROR: ${result.error}`);
      }
    } catch (err) {
      console.error("CONNECTION_TERMINATED:", err);
    } finally {
      setLoading(false);
    }
  };

  // Prevent flicker during initial load
  if (!mounted) return <div className="min-h-screen bg-[#01030a]" />;

  return (
    <div className="min-h-screen bg-[#01030a] text-cyan-400 font-mono relative overflow-hidden">
      <MatrixRain />
      <Navbar />

      <main className="relative z-20 pt-16 px-6 max-w-3xl mx-auto pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border border-cyan-500/30 bg-black/60 backdrop-blur-xl p-8 rounded-sm shadow-[0_0_50px_rgba(6,182,212,0.1)]"
        >
          {/* TERMINAL HEADER */}
          <div className="flex items-center gap-4 mb-8 border-b border-cyan-900 pb-6">
            <AlertCircle className="text-rose-500 animate-pulse" size={24} />
            <div>
              <h1 className="text-xl font-black tracking-[0.3em] text-white uppercase">Uplink_Incident</h1>
              <p className="text-[8px] text-cyan-700 tracking-[0.2em]">
                LOG_IDENTIFIER: <span className="text-cyan-400">{logIdentifier}</span>
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!success ? (
              <motion.form 
                key="report-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                {/* TARGET IDENTIFIER */}
                <div className="group">
                  <label className="block text-[10px] tracking-widest text-cyan-700 mb-2 uppercase font-bold group-focus-within:text-cyan-400">
                    Target_Entity_ID (Phone / Email / Account)
                  </label>
                  <input 
                    required
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    type="text" 
                    placeholder="ENTER_DATA_POINT..."
                    className="w-full bg-cyan-950/10 border border-cyan-500/20 p-4 outline-none focus:border-cyan-400 text-white placeholder:text-cyan-900 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CATEGORY */}
                  <div>
                    <label className="block text-[10px] tracking-widest text-cyan-700 mb-2 uppercase font-bold">Threat_Classification</label>
                    <select 
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full bg-cyan-950/20 border border-cyan-500/20 p-4 outline-none focus:border-cyan-400 text-cyan-300 appearance-none cursor-pointer"
                    >
                      <option value="FINANCIAL_FRAUD">FINANCIAL_FRAUD</option>
                      <option value="PHYSICAL_THREAT">PHYSICAL_THREAT</option>
                      <option value="ONE_CHANCE_ALERT">ONE_CHANCE_ALERT</option>
                    </select>
                  </div>
                  {/* SEVERITY */}
                  <div>
                    <label className="block text-[10px] tracking-widest text-cyan-700 mb-2 uppercase font-bold">Priority_Index</label>
                    <select 
                      name="severity"
                      value={formData.severity}
                      onChange={handleChange}
                      className="w-full bg-cyan-950/20 border border-cyan-500/20 p-4 outline-none focus:border-cyan-400 text-cyan-300 appearance-none cursor-pointer"
                    >
                      <option value="LOW">LOW_PRIORITY</option>
                      <option value="MEDIUM">ELEVATED</option>
                      <option value="CRITICAL">CRITICAL_THREAT</option>
                    </select>
                  </div>
                </div>

                {/* LOG DETAILS */}
                <div>
                  <label className="block text-[10px] tracking-widest text-cyan-700 mb-2 uppercase font-bold">Incident_Analysis_Log</label>
                  <textarea 
                    required
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Input detailed anomaly data..."
                    className="w-full bg-cyan-950/10 border border-cyan-500/20 p-4 outline-none focus:border-cyan-400 text-white placeholder:text-cyan-900 resize-none transition-all"
                  />
                </div>

                {/* SUBMIT */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="group relative w-full bg-cyan-500 text-black py-4 font-black tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-white transition-all disabled:opacity-30 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  {loading ? (
                    <span className="animate-pulse">TRANSMITTING_DATA...</span>
                  ) : (
                    <>
                      <UploadCloud size={20} />
                      EXECUTE_UPLINK
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="success-screen"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-16 text-center"
              >
                <div className="inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/50 mb-6">
                  <CheckCircle2 className="text-emerald-500 animate-bounce" size={48} />
                </div>
                <h2 className="text-2xl font-black text-white mb-2 tracking-[0.2em]">UPLINK_SUCCESSFUL</h2>
                <p className="text-cyan-900 text-[10px] mb-8 tracking-widest">ENCRYPTED_SIGNAL_BROADCAST_COMPLETE</p>
                
                <button 
                  onClick={() => setSuccess(false)}
                  className="border border-cyan-500/30 px-10 py-3 text-[10px] tracking-widest hover:bg-cyan-500/10 hover:text-white transition-all"
                >
                  NEW_UPLINK_PROTOCOL
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}