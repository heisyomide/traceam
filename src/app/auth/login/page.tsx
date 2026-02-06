"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, ArrowRight, Loader2, Fingerprint, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PinLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState(["", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "verifying" | "error">("idle");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

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

  const handleAuthorize = async () => {
    const finalPin = pin.join("");
    if (finalPin.length < 5 || !email) return;

    setStatus("verifying");
    
    try {
      const response = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email, 
          accessCode: finalPin 
        }),
      });

      const result = await response.json();

if (response.ok && result.success) {
  // 1. REMOVE the manual document.cookie for auth-token. 
  // The server already sent it in the response header!

  // 2. Set only non-sensitive data if absolutely necessary, 
  // but use 'Lax' to ensure iPhone compatibility.
  const kycStatus = result.user.kycStatus;
  document.cookie = `user-kyc-status=${kycStatus}; path=/; max-age=86400; SameSite=Lax; Secure`;

  // 3. THE IPHONE DELAY: Give the browser 100ms to process 
  // the Set-Cookie header from the server before moving.
  setTimeout(() => {
    if (kycStatus === "APPROVED") {
      router.push("/dashboard");
    } else if (kycStatus === "PENDING") {
      router.push("/review");
    } else {
      router.push("/kyc");
    }
  }, 100);

} else {
  throw new Error("INVALID_SEQUENCE");
}
    } catch (err) {
      setStatus("error");
      setPin(["", "", "", "", ""]);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#01030a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[size:4rem_4rem] bg-[linear-gradient(to_right,#083344_1px,transparent_1px),linear-gradient(to_bottom,#083344_1px,transparent_1px)]" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md z-20">
        <div className="bg-[#05070a]/80 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-3xl text-center">
          
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
              <Cpu className="text-cyan-500 animate-pulse" size={32} />
            </div>
          </div>

          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-2">
            Terminal <span className="text-cyan-500 text-glow">Access</span>
          </h2>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-8">Secure_Uplink_Protocol</p>

          {/* Email Input */}
          <div className="mb-6 relative group text-left">
            <label className="text-[9px] font-black text-slate-600 uppercase ml-2 mb-2 block tracking-widest">Personnel_Identity</label>
            <div className="relative">
              <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-cyan-500 transition-colors" size={16} />
              <input 
                type="email"
                placeholder="EMAIL_ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-xs font-mono text-cyan-100 placeholder:text-slate-800 focus:border-cyan-500/50 outline-none transition-all"
              />
            </div>
          </div>

          {/* PIN Input */}
          <div className="mb-8 text-left">
            <label className="text-[9px] font-black text-slate-600 uppercase ml-2 mb-4 block tracking-widest">Auth_Sequence</label>
            <div className="flex justify-between gap-2">
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className={`w-full aspect-[3/4] bg-black border ${
                    status === "error" ? "border-rose-500 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]" : "border-white/10 text-cyan-400 focus:border-cyan-500/50"
                  } rounded-xl text-center text-2xl font-black outline-none transition-all focus:bg-white/5`}
                />
              ))}
            </div>
          </div>

          <div className="h-6 mb-4">
            <AnimatePresence>
              {status === "error" && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2 text-rose-500">
                  <ShieldAlert size={12} />
                  <p className="text-[9px] font-black uppercase tracking-widest">Access_Denied: Invalid_Auth</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={handleAuthorize}
            disabled={pin.join("").length < 5 || !email || status === "verifying"}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-900 disabled:text-slate-600 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(6,182,212,0.2)] active:scale-95"
          >
            {status === "verifying" ? <Loader2 className="animate-spin" size={18} /> : <>Authorize_Uplink <ArrowRight size={16} /></>}
          </button>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
            <Link href="/auth/register" className="text-[9px] font-bold text-slate-500 hover:text-cyan-500 uppercase tracking-[0.2em] transition-colors">
              Request_New_Personnel_ID
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}