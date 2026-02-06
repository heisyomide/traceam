"use client";

import { motion } from "framer-motion";
import { Clock, ShieldAlert, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReviewPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 border-t-2 border-b-2 border-cyan-500/30 rounded-full flex items-center justify-center"
        >
          <Clock className="text-cyan-500/50" size={40} />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-cyan-500/10 blur-xl rounded-full" />
        </div>
      </div>

      <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Review_In_Progress</h2>
      <p className="text-slate-500 text-xs font-mono max-w-xs mt-4 leading-relaxed tracking-widest uppercase">
        Your credentials are currently being encrypted and verified by the security board. access will be granted shortly.
      </p>

      <div className="mt-10 flex flex-col gap-4 w-full max-w-xs">
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
          <ShieldAlert className="text-amber-500" size={20} />
          <div className="text-left">
            <p className="text-[10px] font-black text-white uppercase">Current_Status</p>
            <p className="text-[9px] text-amber-500 font-mono">LEVEL_1_PENDING</p>
          </div>
        </div>
        
        <button 
          onClick={() => router.push("/auth/login")}
          className="flex items-center justify-center gap-2 text-slate-600 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mt-4"
        >
          <LogOut size={14} /> Return_to_Login
        </button>
      </div>
    </div>
  );
}