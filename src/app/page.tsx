"use client";

import { MatrixRain } from "@/components/MatrixRain";
import { Navbar } from "@/components/Navbar";
import { SearchTerminal } from "@/components/SearchTerminal";
import { ThreatLevel } from "@/components/ThreatLevel";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";
import { Cpu, LayoutDashboard } from "lucide-react";

export default function AlienHome() {
  return (
    <div className="min-h-screen bg-[#01030a] text-slate-200 font-sans relative flex flex-col overflow-x-hidden">
      {/* Persistent Background Layer */}
      <div className="fixed inset-0 z-0">
        <MatrixRain />
        <div className="absolute inset-0 bg-gradient-to-b from-[#01030a]/50 via-transparent to-[#01030a]" />
      </div>

      <Navbar />

      <main className="relative z-10 grow">
        {/* Stage 1: Brand Impact */}
        <Hero />

        {/* Stage 2: Intelligence Dashboard Section */}
        <section className="relative py-24 border-t border-white/5 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6">
            
            {/* Dashboard Sub-Header */}
            <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-cyan-500">
                  <LayoutDashboard size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Operational Interface</span>
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                  Security <span className="text-cyan-500">Grid</span>
                </h2>
              </div>
              
              <div className="hidden md:flex gap-6 text-[10px] font-mono text-slate-500 uppercase">
                <div className="flex flex-col items-end">
                  <span className="text-slate-700">Access Level</span>
                  <span className="text-cyan-500/80 font-bold">Encrypted_Guest</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-slate-700">Protocol</span>
                  <span className="text-white font-bold">v7.0.4-Lagos</span>
                </div>
              </div>
            </div>

            {/* Main Intelligence Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LARGE PANEL: Search & Discovery */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-8 order-2 lg:order-1"
              >
                <div className="relative group">
                  {/* Outer Glow Effect */}
                  <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/20 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition duration-1000" />
                  <div className="relative">
                    <SearchTerminal />
                  </div>
                </div>
              </motion.div>

              {/* SIDEBAR: Metrics & Intelligence */}
              <motion.aside 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-4 space-y-6 order-1 lg:order-2"
              >
                <ThreatLevel />
                
                {/* Secondary Widget: System Notice */}
                <div className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:rotate-12 transition-transform">
                    <Cpu size={40} />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">System Notice</h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                    "All queries are cross-referenced against global threat databases. 
                    Identity verification is performed via decentralized nodes."
                  </p>
                </div>
              </motion.aside>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}