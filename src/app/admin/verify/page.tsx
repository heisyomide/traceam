"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Loader2 } from "lucide-react";

export default function AdminVerify() {
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      if (res.ok) {
        // Cookie is set by the server, just redirect
        router.push("/admin");
      } else {
        alert("ACCESS_DENIED: INVALID_PASSCODE");
        setPasscode("");
      }
    } catch (err) {
      alert("CONNECTION_FAILURE");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#02040a] flex items-center justify-center p-6">
      <div className="w-full max-w-sm p-8 border border-white/5 bg-white/[0.02] rounded-3xl text-center space-y-6">
        <Terminal className="mx-auto text-cyan-500" size={40} />
        <h2 className="text-white font-black tracking-widest uppercase text-xs italic">Clearance_Required</h2>
        <input 
          type="password" 
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          className="w-full bg-black border border-white/10 p-4 rounded-xl text-center text-cyan-500 outline-none focus:border-cyan-500/50 font-mono tracking-widest"
          placeholder="••••••"
        />
        <button 
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-xl font-bold text-[10px] tracking-[0.3em] transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : "AUTHENTICATE"}
        </button>
      </div>
    </div>
  );
}