"use client";

import React from "react";
import { ShieldCheck, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderHUDProps {
  userData: any;
}

export default function HeaderHUD({ userData }: HeaderHUDProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Clear all session data
    localStorage.clear();
    // Delete cookies by setting expiry to past
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = "user-kyc-status=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/");
  };

  return (
    <header className="flex justify-between items-center mb-6 bg-black/40 border border-white/5 p-5 rounded-3xl backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
          <ShieldCheck className="text-cyan-500" size={24} />
        </div>
        <div>
          <h1 className="font-black text-white text-xl tracking-tighter">
            TRACE<span className="text-cyan-500">AM</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold tracking-[0.3em] uppercase">
            {userData?.name || "AUTHENTICATING_NODE..."}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:block text-right mr-4">
          <p className="text-[8px] text-slate-500 tracking-widest font-mono uppercase">Node_Status</p>
          <p className="text-[10px] text-emerald-500 font-bold font-mono">ENCRYPTED_LINK_ACTIVE</p>
        </div>
        <button 
          onClick={handleLogout}
          className="p-3 bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 rounded-2xl transition-all border border-white/5"
          title="Terminate Session"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}