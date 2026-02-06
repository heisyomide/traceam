"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Shield, Globe, ChevronRight, UserCheck, LogOut, LayoutDashboard } from "lucide-react";

export const Navbar = () => {
  const router = useRouter(); 
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Helper to read cookies on the client side
  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  // 1. Clock Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-GB", { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Auth Logic: Check for the auth-token cookie specifically
  useEffect(() => {
    const session = getCookie("auth-token");
    // If the cookie exists, the user is considered authorized in the UI
    setIsAuthorized(!!session);
  }, [pathname]);

  const handleLogout = () => {
    // Clear all related cookies by setting expiration to the past
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user-kyc-status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "admin-access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    // Also clear localStorage just in case of old data
    localStorage.removeItem("terminal_access");
    
    setIsAuthorized(false);
    router.push("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-[#01030a]/80 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        
        {/* LEFT: LOGO */}
        <Link href="/" className="flex items-center gap-6 group cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <Shield className="text-cyan-500 z-10" size={24} />
              <div className="absolute inset-0 bg-cyan-500/20 blur-md rounded-full animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-[0.2em] text-white italic leading-none">
                TRACEAM
              </span>
              <span className="text-[8px] font-bold text-cyan-600 tracking-[0.3em] uppercase">
                Nigeria_Node
              </span>
            </div>
          </div>
        </Link>

        {/* CENTER: NAVIGATION */}
        <div className="hidden lg:flex items-center gap-1">
          {['Intelligence', 'Registry', 'Protocol'].map((link) => (
            <Link 
              key={link} 
              href={`/${link.toLowerCase()}`} 
              className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              {link}
            </Link>
          ))}
        </div>

        {/* RIGHT: SYSTEM ACCESS / AUTH STATUS */}
        <div className="flex items-center gap-8">
          <div className="hidden sm:flex flex-col items-end">
            <div className="flex items-center gap-2">
              <Globe size={10} className="text-slate-600" />
              <span className="text-[9px] font-bold text-white tracking-tighter italic uppercase">Lagos_HQ</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-500/80">{time || "00:00:00"}</span>
          </div>

          {isAuthorized ? (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all group"
              >
                <LayoutDashboard size={14} className="group-hover:rotate-12 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest italic">Intel_Hub</span>
              </Link>

              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <UserCheck size={20} />
              </div>

              <button 
                onClick={handleLogout}
                className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => router.push("/auth/login")}
              className="relative group flex items-center gap-2 bg-cyan-600 px-5 py-2 rounded-full overflow-hidden transition-all hover:pr-8 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
            >
              <span className="relative z-10 text-[10px] font-black uppercase tracking-widest text-white italic">
                Access_Terminal
              </span>
              <ChevronRight className="absolute right-2 opacity-0 group-hover:opacity-100 transition-all text-white" size={14} />
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          )}
        </div>
      </div>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
    </nav>
  );
};