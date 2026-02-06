"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, MapPin, AlertTriangle, ArrowRight } from "lucide-react";
import { MatrixRain } from "./MatrixRain";

export const Hero = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#02040f]">
      {/* ─── Full-bleed Video Background ─── */}
      <div className="absolute inset-0 z-0">
        {/* Video takes 100% width & height of viewport */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ minWidth: "100%", minHeight: "100%" }}
        >
          <source src="/hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

                {/* The Matrix Rain Layer */}
        <MatrixRain />


        {/* Stronger, more cinematic overlays */}
        <div className="absolute inset-0 bg-linear-to-b from-[#02040f]/70 via-[#02040f]/40 to-[#02040f]/85" />
        <div className="absolute inset-0 bg-linear-to-r from-[#02040f]/75 via-transparent to-[#02040f]/75" />
        {/* Optional subtle vignette for focus */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/40" />
      </div>

      {/* ─── Content Layer ─── */}
      <div className="relative z-10 container mx-auto px-5 sm:px-8 lg:px-12 max-w-7xl py-20">
        <div className="max-w-4xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-cyan-500/25 bg-cyan-950/30 px-5 py-2 text-sm font-semibold text-cyan-300 backdrop-blur-sm"
          >
            <ShieldCheck size={18} className="text-cyan-400" />
            Nigeria’s Leading Personal Security Network
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 45 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl lg:text-8xl font-black leading-[1.05] tracking-tight text-white"
          >
            Who’s <span className="text-cyan-400">really</span> on the other side?
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="mt-7 text-lg sm:text-xl lg:text-2xl text-gray-300/90 font-light leading-relaxed max-w-3xl"
          >
            Instant background checks • Live risk alerts • Scam & kidnap prevention • 
            Real people. Real protection. Real time.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-5"
          >
            <button
              className="
                group relative flex items-center justify-center gap-3 
                rounded-xl bg-linear-to-r from-cyan-600 to-cyan-500 
                px-9 py-5 text-base font-bold text-white shadow-xl shadow-cyan-500/25 
                hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all duration-300
              "
            >
              Start Protecting Yourself
              <ArrowRight className="transition-transform group-hover:translate-x-1" size={20} />
            </button>

            <button
              className="
                rounded-xl border border-cyan-500/30 px-9 py-5 text-base font-semibold 
                text-cyan-300 hover:bg-cyan-950/30 hover:border-cyan-400/40 
                transition-all duration-300
              "
            >
              See How TraceAm Works →
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 1 }}
            className="mt-16 flex flex-wrap gap-x-12 gap-y-8 text-gray-400"
          >
            {[
              { icon: MapPin, color: "cyan-400", value: "14,200+", label: "Locations Monitored" },
              { icon: AlertTriangle, color: "rose-400", value: "7,800+", label: "Scams & Threats Reported" },
              { icon: ShieldCheck, color: "emerald-400", value: "28,000+", label: "Nigerians Protected" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.15 }}
                className="flex items-center gap-4"
              >
                <stat.icon size={28} className={`text-${stat.color}`} />
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm sm:text-base text-gray-400/90">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};