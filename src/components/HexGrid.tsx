"use client";
import { motion } from "framer-motion";
import { AlertCircle, Globe, Radio, Lock } from "lucide-react";

const features = [
  { label: 'REPORT', icon: AlertCircle },
  { label: 'MAP', icon: Globe },
  { icon: Radio, label: 'SOS', color: 'text-rose-500' },
  { icon: Lock, label: 'VAULT' }
];

export const HexGrid = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto z-20 relative">
      {features.map((item, idx) => (
        <motion.div key={idx} whileHover={{ scale: 1.05 }} className="group relative cursor-pointer">
          <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
          <div className="border border-cyan-500/20 p-8 flex flex-col items-center gap-4 bg-black/40 backdrop-blur-md clip-hexagon-lg transition-all group-hover:border-cyan-400">
            <item.icon className={item.color || "text-cyan-500"} size={32} />
            <span className="text-[10px] tracking-[0.3em] font-bold">{item.label}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};