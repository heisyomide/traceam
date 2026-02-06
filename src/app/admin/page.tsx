"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, ShieldAlert, Eye, Check, X, 
  Database, Search, RefreshCcw, UserCheck 
} from "lucide-react";

// --- Types ---
interface UserRecord {
  _id: string;
  name: string;
  email: string;
  kycStatus: "PENDING" | "APPROVED" | "REJECTED" | "NONE";
  kyc?: {
    idType: string;
    idImageUrl: string;
    address: string;
    submittedAt: string;
  };
  emergencyContacts?: {
    family?: { name: string; phone: string; relation: string };
    friends?: { name: string; phone: string }[];
    partner?: { name: string; phone: string };
  };
}

export default function AdminTerminal() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- Data Fetching ---
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("TERMINAL_UPLINK_ERROR:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchUsers(); 
  }, [fetchUsers]);

  // --- Status Management ---
  const handleUpdateStatus = async (email: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newStatus }),
      });
      
      if (res.ok) {
        await fetchUsers(); // Refresh grid
        setSelectedUser(null);
      }
    } catch (err) {
      console.error("CLEARANCE_UPDATE_FAILURE");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Filtering ---
  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#01030a] text-slate-300 p-4 md:p-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* --- Header HUD --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 bg-white/[0.02] p-8 rounded-4xl border border-white/5">
          <div>
            <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter flex items-center gap-4">
              <UserCheck className="text-cyan-500" size={32} />
              Admin <span className="text-cyan-500 underline decoration-cyan-500/30">Terminal</span>
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">
                Grid_Control_Center // Active_Nodes: {users.length}
              </p>
              <button 
                onClick={fetchUsers} 
                className="text-cyan-500 hover:rotate-180 transition-transform duration-700"
                disabled={loading}
              >
                <RefreshCcw size={12} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
            <input 
              type="text" 
              placeholder="FILTER_BY_PERSONNEL_SIGNAL..." 
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-mono outline-none focus:border-cyan-500/50 transition-all text-white placeholder:text-slate-700"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        {/* --- User Grid --- */}
        <div className="bg-[#05070a] border border-white/10 rounded-4xl overflow-hidden shadow-2xl overflow-x-auto backdrop-blur-md">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Personnel_Node</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Uplink_Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Safety_Circle</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Clearance</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-b border-white/5 hover:bg-cyan-500/[0.03] transition-colors group">
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-sm uppercase italic group-hover:text-cyan-400 transition-colors tracking-tight">
                        {user.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-600 group-hover:text-slate-400 transition-colors">
                        {user.email}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${
                      user.kycStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                      user.kycStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' : 
                      'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                      {user.kycStatus}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-3">
                       <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${user.emergencyContacts?.family?.name ? 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]' : 'bg-white/5'}`} title="Family_Linked" />
                       <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${user.emergencyContacts?.partner?.name ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-white/5'}`} title="Partner_Linked" />
                       <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${(user.emergencyContacts?.friends?.length ?? 0) > 0 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-white/5'}`} title="Circle_Active" />
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-400 hover:bg-cyan-600 hover:text-white rounded-xl transition-all border border-white/5 group-hover:border-cyan-500/50"
                    >
                      <Eye size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && !loading && (
            <div className="p-32 text-center flex flex-col items-center gap-6">
                <Database className="text-slate-900 animate-pulse" size={64} />
                <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-700">No_Active_Signals_Detected_In_Sector</p>
            </div>
          )}
        </div>
      </div>

      {/* --- INSPECTION OVERLAY --- */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-[#01030a]/90 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-5xl bg-[#0a0c14] border border-white/10 rounded-4xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col md:flex-row max-h-[85vh]"
            >
              {/* Visual Evidence Stream */}
              <div className="flex-1 bg-black p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/10 relative">
                {selectedUser.kyc?.idImageUrl ? (
                  <>
                    <img 
                      src={selectedUser.kyc.idImageUrl} 
                      alt="ID_UPLINK" 
                      className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-2xl"
                    />
                    <div className="absolute top-6 left-6 px-4 py-1.5 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 text-[9px] font-mono text-cyan-500 tracking-[0.2em] flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping" />
                      SECURE_IMAGE_BUFFER_ACTIVE
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-6">
                    <ShieldAlert size={64} className="text-rose-900 mx-auto" />
                    <p className="text-[10px] font-mono text-slate-700 uppercase tracking-widest">Signal_Corrupted: No_Visual_Uplink</p>
                  </div>
                )}
              </div>

              {/* Control Panel */}
              <div className="w-full md:w-[380px] p-10 flex flex-col">
                <div className="flex-1 space-y-8">
                  <header>
                    <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">
                      {selectedUser.name}
                    </h3>
                    <p className="text-[11px] font-mono text-cyan-500/60 mt-2 uppercase tracking-widest">Node_Identifier: {selectedUser._id.slice(-8)}</p>
                  </header>

                  <div className="space-y-4 bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                    <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-3">
                      <span className="text-slate-500 tracking-widest">CLEARANCE_TYPE</span>
                      <span className="text-white font-bold">{selectedUser.kyc?.idType || 'DATA_NOT_FOUND'}</span>
                    </div>
                    <div className="flex flex-col gap-2 text-[10px] font-mono">
                      <span className="text-slate-500 tracking-widest uppercase">Registered_Address</span>
                      <span className="text-slate-300 leading-relaxed text-[11px]">{selectedUser.kyc?.address || 'UNSPECIFIED_COORDINATES'}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.3em] mb-4">Command_Protocol</p>
                    
                    <button 
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(selectedUser.email, 'APPROVED')}
                      className="group w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                    >
                      <Check size={16} className="group-hover:scale-125 transition-transform" />
                      Grant_Personnel_Clearance
                    </button>
                    
                    <button 
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(selectedUser.email, 'REJECTED')}
                      className="group w-full bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white border border-white/10 py-5 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em] disabled:opacity-50"
                    >
                      <X size={16} className="group-hover:rotate-90 transition-transform" />
                      Terminate_Uplink
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedUser(null)}
                  className="mt-10 text-[10px] font-mono text-slate-700 hover:text-cyan-500 transition-colors uppercase tracking-[0.3em] text-center border-t border-white/5 pt-6"
                >
                  Return_To_Terminal_Grid
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}