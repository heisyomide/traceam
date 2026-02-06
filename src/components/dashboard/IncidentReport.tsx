"use client";

import React, { useState } from "react";
import { ShieldAlert } from "lucide-react";

interface IncidentReportProps {
  addLog: (msg: string) => void;
  location: { lat: number; lng: number } | null;
}

export default function IncidentReport({ addLog, location }: IncidentReportProps) {
  const [isReporting, setIsReporting] = useState(false);
  const [report, setReport] = useState({ type: "", text: "", targetId: "" });

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!report.type || !report.text || isReporting) {
      addLog("MISSING_REPORT_FIELDS");
      return;
    }

    setIsReporting(true);
    addLog(`BROADCASTING_INCIDENT: ${report.type}`);

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          type: report.type,
          target: report.targetId || "NOT_SPECIFIED",
          description: report.text,
          // ✅ Passing the location from the parent tracker
          location: location ? `${location.lat.toFixed(6)},${location.lng.toFixed(6)}` : "UNKNOWN_LOC"
        }),
      });

      if (response.ok) {
        addLog("INCIDENT_LOGGED_SUCCESSFULLY");
        // Reset form after successful dispatch
        setReport({ type: "", text: "", targetId: "" });
      } else {
        addLog(`SERVER_REJECTED: ${response.status}`);
      }
    } catch (err) {
      addLog("REPORT_DISPATCH_FAILED");
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <section className="bg-black/40 border border-white/10 p-6 rounded-[2rem] shadow-2xl backdrop-blur-lg">
      <h3 className="text-[10px] font-bold tracking-[0.2em] mb-4 flex items-center gap-2 text-rose-500">
        <ShieldAlert size={16} /> INCIDENT_DISPATCH
      </h3>
      
      <form onSubmit={handleReport} className="space-y-3">
        <select
          value={report.type}
          onChange={(e) => setReport({ ...report, type: e.target.value })}
          className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-xs outline-none text-slate-300 focus:border-rose-500/50 transition-all cursor-pointer"
        >
          <option value="">SELECT_INCIDENT_TYPE</option>
          <option value="SCAM/FRAUD">SCAM / ONLINE_FRAUD</option>
          <option value="KIDNAPPING">KIDNAPPING</option>
          <option value="ROBBERY">ROBBERY</option>
          <option value="CYBERCRIME">CYBERCRIME_ATTACK</option>
          <option value="ASSAULT">PHYSICAL_ASSAULT</option>
          <option value="MEDICAL">MEDICAL_EMERGENCY</option>
          <option value="OTHER">OTHER_THREAT</option>
        </select>

        <input
          value={report.targetId}
          onChange={(e) => setReport({ ...report, targetId: e.target.value })}
          placeholder="TARGET_PHONE / ACCOUNT (OPTIONAL)"
          className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-rose-500/50 text-white"
        />

        <textarea
          value={report.text}
          onChange={(e) => setReport({ ...report, text: e.target.value })}
          placeholder="INCIDENT_DETAILS..."
          className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-xs h-24 outline-none resize-none focus:border-rose-500/50 text-white"
        />

        <button 
          disabled={isReporting} 
          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-3 rounded-xl text-[10px] tracking-[0.2em] transition-all disabled:opacity-50 uppercase shadow-lg shadow-rose-900/20"
        >
          {isReporting ? "DISPATCHING_ENCRYPTED_SIGNAL..." : "SUBMIT_REPORT"}
        </button>
      </form>
    </section>
  );
}