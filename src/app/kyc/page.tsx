"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, Upload, Users, User, Camera, 
  ChevronRight, Loader2, CheckCircle2, ArrowRight,
  Fingerprint, Globe, Heart, UserPlus, Home,
  CreditCard, Landmark, RefreshCcw, ScanLine
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfessionalKYC() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    email: "", // ✅ Property added to satisfy TypeScript and API needs
    fullName: "",
    address: "",
    idType: "" as "NIN" | "VOTERS_CARD" | "PASSPORT" | "DRIVERS_LICENSE" | "",
    idImage: null as File | null,
    contacts: {
      family: { name: "", phone: "", relation: "" },
      friends: [{ name: "", phone: "" }, { name: "", phone: "" }],
      partner: { name: "", phone: "" }
    }
  });

// ✅ 1. Updated Auto-load: Only for visual/state tracking
  useEffect(() => {
    const savedEmail = localStorage.getItem("user_email");
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
    }
  }, []);

  // Handle File Preview (No changes needed)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, idImage: file });
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  // ✅ 2. Bulletproof HandleSubmit
  const handleSubmit = async () => {
    // 🛰️ DIRECT UPLINK CHECK: Don't rely solely on state, check storage directly
    const directEmail = localStorage.getItem("user_email");
    
    // We prioritize the direct storage value to avoid React state lag
    const finalEmail = directEmail || formData.email;

    if (!finalEmail) {
      console.error("CRITICAL_ERROR: Personnel identifier (email) not found in local storage.");
      alert("Session terminal disconnected. Please re-register.");
      router.push("/auth/register");
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch("/api/kyc/submit", { 
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            email: finalEmail, // Use the verified direct identifier
            idImageUrl: "https://placeholder-url.com/id.png", 
          }) 
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setSubmitted(true);
        // Clean up the storage so a new user can register later
        localStorage.removeItem("user_email");
        
        setTimeout(() => {
          router.push("/auth/login?message=review_pending");
        }, 3000);
      } else {
        throw new Error(result.error || "UPLINK_DENIED");
      }
    } catch (err: any) {
      console.error("DATA_SYNC_FAILED:", err);
      alert(`Submission failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-300 font-sans">
      
      {/* Progress HUD */}
      <div className="fixed top-0 left-0 w-full z-50 p-6 bg-gradient-to-b from-[#02040a] to-transparent backdrop-blur-md">
        <div className="max-w-xl mx-auto flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[10px] font-black tracking-[0.4em] text-cyan-500/60 uppercase">System_Verify</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Node_{step}_Active</span>
        </div>
        <div className="max-w-xl mx-auto h-[1px] bg-white/5">
            <motion.div className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" animate={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen p-6 pt-24">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">

            {/* STEP 1: OPERATOR INFO */}
            {step === 1 && (
               <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">Operator_Profile</h2>
                    <p className="text-slate-500 text-xs font-mono">Status: Awaiting registration parameters...</p>
                </div>
                <div className="space-y-4">
                    <input type="text" placeholder="FULL_LEGAL_NAME" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-cyan-500/50 font-mono text-sm text-white" onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                    <input type="text" placeholder="BASE_ADDRESS" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-cyan-500/50 font-mono text-sm text-white" onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
                <button onClick={() => setStep(2)} disabled={!formData.fullName || !formData.address} className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-20 uppercase text-[10px] tracking-[0.2em]">Next_Protocol</button>
               </motion.div>
            )}

            {/* STEP 2: DOC SELECTION */}
            {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">Identity_Source</h2>
                        <p className="text-slate-500 text-xs font-mono">Select valid government uplink:</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                          { id: "NIN", label: "NIN", icon: <Fingerprint /> },
                          { id: "VOTERS_CARD", label: "Voters", icon: <Landmark /> },
                          { id: "PASSPORT", label: "Passport", icon: <Globe /> },
                          { id: "DRIVERS_LICENSE", label: "Drivers", icon: <CreditCard /> }
                        ].map((doc) => (
                            <button key={doc.id} onClick={() => { setFormData({...formData, idType: doc.id as any}); setStep(3); }} className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:border-cyan-500/50 hover:bg-white/[0.08] transition-all flex flex-col items-center gap-4 group">
                                <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform group-hover:text-cyan-500">{doc.icon}</div>
                                <span className="text-[10px] font-black uppercase tracking-widest">{doc.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* STEP 3: CAPTURE & PREVIEW */}
            {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase underline decoration-cyan-500">Visual_Capture</h2>
                        <p className="text-slate-500 text-xs font-mono uppercase">Targeting: {formData.idType}</p>
                    </div>

                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    
                    <div className="relative group overflow-hidden rounded-[2.5rem] border-2 border-dashed border-white/10 hover:border-cyan-500/40 transition-all bg-white/[0.02]">
                        {previewUrl ? (
                            <div className="relative aspect-video w-full">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay" />
                                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400/50 animate-scan" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-white rounded-full text-black"><RefreshCcw size={20}/></button>
                                </div>
                            </div>
                        ) : (
                            <div onClick={() => fileInputRef.current?.click()} className="aspect-video flex flex-col items-center justify-center gap-4 cursor-pointer">
                                <ScanLine className="text-slate-700 group-hover:text-cyan-500 group-hover:scale-110 transition-all" size={48} />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Initiate_Scan</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => setStep(2)} className="flex-1 bg-white/5 p-5 rounded-2xl font-bold text-[10px] uppercase">Back</button>
                        <button onClick={() => setStep(4)} disabled={!formData.idImage} className="flex-[2] bg-white text-black p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-10">Confirm_Uplink</button>
                    </div>
                </motion.div>
            )}

            {/* STEP 4: SAFETY CIRCLE */}
            {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">Safety_Circle</h2>
                        <p className="text-slate-500 text-xs font-mono uppercase">Binding emergency uplink nodes...</p>
                    </div>

                    <div className="space-y-8">
                        {/* FAMILY */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-cyan-500 border-b border-cyan-500/10 pb-2">
                                <Home size={16} />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Family_Primary</h3>
                            </div>
                            <div className="flex gap-2">
                                {["Father", "Mother", "Sister", "Brother"].map((rel) => (
                                    <button key={rel} onClick={() => setFormData(d => ({...d, contacts: {...d.contacts, family: {...d.contacts.family, relation: rel}}}))} className={`px-4 py-2 rounded-xl text-[9px] font-bold border transition-all ${formData.contacts.family.relation === rel ? 'bg-cyan-500 border-cyan-500 text-black shadow-[0_0_15px_#06b6d4]' : 'bg-white/5 border-white/10 text-slate-500'}`}>{rel.toUpperCase()}</button>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input placeholder="NAME" className="bg-white/5 border border-white/10 p-4 rounded-xl text-xs outline-none font-mono text-white" onChange={(e) => setFormData(d => ({...d, contacts: {...d.contacts, family: {...d.contacts.family, name: e.target.value}}}))}/>
                                <input placeholder="PHONE" className="bg-white/5 border border-white/10 p-4 rounded-xl text-xs outline-none font-mono text-white" onChange={(e) => setFormData(d => ({...d, contacts: {...d.contacts, family: {...d.contacts.family, phone: e.target.value}}}))}/>
                            </div>
                        </div>

                        {/* FRIENDS */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-emerald-500 border-b border-emerald-500/10 pb-2">
                                <UserPlus size={16} />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Trusted_Allies</h3>
                            </div>
                            {formData.contacts.friends.map((friend, i) => (
                                <div key={i} className="grid grid-cols-2 gap-3">
                                    <input placeholder={`Friend ${i+1} Name`} className="bg-white/5 border border-white/10 p-4 rounded-xl text-xs outline-none font-mono text-white" onChange={(e) => {
                                        const f = [...formData.contacts.friends];
                                        f[i].name = e.target.value;
                                        setFormData(d => ({...d, contacts: {...d.contacts, friends: f}}));
                                    }}/>
                                    <input placeholder="PHONE" className="bg-white/5 border border-white/10 p-4 rounded-xl text-xs outline-none font-mono text-white" onChange={(e) => {
                                        const f = [...formData.contacts.friends];
                                        f[i].phone = e.target.value;
                                        setFormData(d => ({...d, contacts: {...d.contacts, friends: f}}));
                                    }}/>
                                </div>
                            ))}
                        </div>

                        {/* PARTNER */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-rose-500 border-b border-rose-500/10 pb-2">
                                <Heart size={16} />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Partner_Uplink</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input placeholder="PARTNER_NAME" className="bg-white/5 border border-white/10 p-4 rounded-xl text-xs outline-none font-mono text-white" onChange={(e) => setFormData(d => ({...d, contacts: {...d.contacts, partner: {...d.contacts.partner, name: e.target.value}}}))}/>
                                <input placeholder="PHONE" className="bg-white/5 border border-white/10 p-4 rounded-xl text-xs outline-none font-mono text-white" onChange={(e) => setFormData(d => ({...d, contacts: {...d.contacts, partner: {...d.contacts.partner, phone: e.target.value}}}))}/>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-6 rounded-3xl transition-all flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(225,29,72,0.3)] uppercase text-[10px] tracking-[0.4em]"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Authorize_System_Lock"}
                    </button>
                </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* SUCCESS OVERLAY */}
      <AnimatePresence>
        {submitted && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-[#02040a] flex flex-col items-center justify-center p-6 text-center">
                <div className="relative mb-8">
                    <CheckCircle2 className="text-cyan-500 relative z-10" size={80} />
                    <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
                </div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Link_Active.</h2>
                <p className="text-slate-500 text-xs font-mono tracking-widest uppercase mt-2">Credentials encrypted. Standby for terminal access.</p>
            </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(220px); }
          100% { transform: translateY(0); }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
}