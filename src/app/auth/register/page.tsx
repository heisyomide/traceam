"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldPlus, Fingerprint, ArrowRight, Loader2, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [pin, setPin] = useState(["", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    if (value && index < 4) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const accessCode = pin.join("");
    if (accessCode.length < 5 || !email) return;

    setStatus("submitting");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, accessCode }),
      });

      const data = await res.json();

if (res.ok) {
  setStatus("success");
  
  // 🛰️ KEY FIX: Store the email so the KYC page can "pick it up"
  localStorage.setItem("user_email", email); 

  document.cookie = `auth-token=${data.token}; path=/; max-age=86400; sameSite=strict`;
  document.cookie = `user-kyc-status=NONE; path=/; max-age=86400; sameSite=strict`;

  setTimeout(() => {
    router.push("/kyc");
  }, 2000);
} else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (err) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#01030a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Visual background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,#10b981_0,transparent_70%)]" />
      
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md z-20">
        <div className="bg-[#05070a]/80 border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          
          <div className="text-center mb-10">
            <motion.div 
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 360 }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
              className="inline-flex p-4 rounded-2xl bg-emerald-500/10 mb-6 border border-emerald-500/20"
            >
              <ShieldPlus className="text-emerald-500" size={32} />
            </motion.div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              Initialize <span className="text-emerald-500">Node</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-2 italic">Personnel Enrollment Protocol</p>
          </div>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="text-center py-10"
              >
                <div className="relative inline-block mb-6">
                  <CheckCircle2 className="text-emerald-500 relative z-10" size={64} />
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1.5, opacity: 0 }} 
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 bg-emerald-500 rounded-full"
                  />
                </div>
                <h3 className="text-white font-black uppercase tracking-widest text-xl italic">Identity Created</h3>
                <p className="text-emerald-500/60 text-[9px] mt-4 uppercase font-mono tracking-[0.3em] animate-pulse">
                  Establishing secure link to KYC terminal...
                </p>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister} 
                className="space-y-8"
              >
                {/* Email Input */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">Personnel_Uplink</label>
                    {status === "error" && <span className="text-rose-500 text-[9px] font-bold uppercase">Uplink Failed</span>}
                  </div>
                  <div className="relative group">
                    <Fingerprint className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ENTER_SECURE_EMAIL"
                      required
                      className="w-full bg-black/60 border border-white/5 rounded-2xl py-5 pl-14 pr-4 text-white placeholder:text-slate-800 outline-none focus:border-emerald-500/50 transition-all font-mono text-xs tracking-wider"
                    />
                  </div>
                </div>

                {/* PIN Selection */}
                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic text-center block">Define_Access_Sequence</label>
                  <div className="flex justify-center gap-3">
                    {pin.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { if (inputRefs.current) inputRefs.current[idx] = el; }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(e.target.value, idx)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        className="w-12 h-16 bg-black border border-white/10 rounded-xl text-center text-2xl font-black text-emerald-400 focus:border-emerald-500 focus:bg-emerald-500/5 outline-none transition-all shadow-inner"
                      />
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={status === "submitting" || pin.join("").length < 5 || !email}
                  className="w-full group bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-900/50 disabled:text-slate-700 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(16,185,129,0.2)] active:scale-95"
                >
                  {status === "submitting" ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>Initialize_Profile <Zap size={14} className="group-hover:text-white text-emerald-300" /></>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <Link href="/auth/login" className="text-[9px] font-bold text-slate-600 hover:text-emerald-400 transition-colors uppercase tracking-[0.2em]">
              Return_to_Login_Terminal
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}