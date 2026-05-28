"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
// Custom Futuristic Cyber Shield Lock Icon
const CyberLockIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M12 15v3M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

// Custom Futuristic Energy Reactor Icon (Glowing Isometric Crystal Grid)
const CyberEnergyIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

// Custom Futuristic Glowing Neon Flame Icon
const CyberFlameIcon = ({ className = "w-3.5 h-3.5 inline-block" }) => (
  <svg className={`${className} text-amber-500 animate-pulse`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="rgba(245, 158, 11, 0.2)" />
  </svg>
);

import AIMascot from "./AIMascot";

export default function InteractivePathMap() {
  const { data: session } = useSession();
  const [activeLevel, setActiveLevel] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState(null);
  
  const levels = [
    { 
      id: 1, 
      title: "Dasar AI 🧠", 
      desc: "Latihan struktur kalimat dasar dan tenses dasar dideteksi instan oleh AI.", 
      status: "AKTIF",
      progress: 75,
      energy: "⚡ 100% Full",
      color: "#6366F1",     // Indigo
      border: "#4338CA",
      light: "bg-indigo-50/80 border-indigo-200 text-[#6366F1]",
      textColor: "text-[#6366F1]",
      x: 280,
      y: 80,
      offsetDistance: "0%",
      icon: (
        <svg className="w-5 h-5 text-indigo-500 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="4" fill="rgba(99, 102, 241, 0.2)" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" strokeLinecap="round" />
        </svg>
      ),
      // Dynamic Diagnostics parameters
      accuracy: "99.4% ACC",
      nlpEngine: "NLP Detektif Tata Bahasa",
      feedback: "Umpan Balik Instan",
      badgeTitle: "Akademisi Siber (Lulus)",
      badgeIcon: "🏆"
    },
    { 
      id: 2, 
      title: "Cyber Vocab ⚡", 
      desc: "Perkaya kosakata bertema digital, era AI, e-commerce, dan komunikasi bisnis teknologi.", 
      status: "TERKUNCI",
      progress: 0,
      energy: "🔒 0% Locked",
      color: "#10B981",     // Neon Emerald
      border: "#047857",
      light: "bg-emerald-50/80 border-emerald-200 text-emerald-600",
      textColor: "text-emerald-600",
      x: 120,
      y: 220,
      offsetDistance: "33.333%",
      icon: (
        <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <ellipse cx="12" cy="12" rx="9" ry="3" transform="rotate(45 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="3" transform="rotate(-45 12 12)" />
          <circle cx="12" cy="12" r="2.5" fill="#10B981" />
        </svg>
      ),
      // Dynamic Diagnostics parameters
      accuracy: "🔒 0% ACC",
      nlpEngine: "NLP Kosakata Digital",
      feedback: "Latihan Vocab Siber (Terkunci)",
      badgeTitle: "Lari Cepat (Terkunci)",
      badgeIcon: "⚡"
    },
    { 
      id: 3, 
      title: "Global Interface 🌐", 
      desc: "Latih cara berkomunikasi formal dan kasual tingkat global.", 
      status: "TERKUNCI",
      progress: 0,
      energy: "🔒 0% Locked",
      color: "#1CB0F6",     // Bright Cyan/Blue
      border: "#0288D1",
      light: "bg-blue-50/80 border-blue-200 text-[#1CB0F6]",
      textColor: "text-[#1CB0F6]",
      x: 280,
      y: 360,
      offsetDistance: "66.666%",
      icon: (
        <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" />
        </svg>
      ),
      // Dynamic Diagnostics parameters
      accuracy: "🔒 0% ACC",
      nlpEngine: "NLP Dialog Global",
      feedback: "Percakapan AI (Terkunci)",
      badgeTitle: "Energi Penuh (Terkunci)",
      badgeIcon: "🔋"
    },
    { 
      id: 4, 
      title: "AI Evaluator 🤖", 
      desc: "Tantangan tata bahasa tersulit di bawah ulasan detektif Lerny.", 
      status: "TERKUNCI",
      progress: 0,
      energy: "🔒 0% Locked",
      color: "#A560E8",     // Cosmic Purple
      border: "#7B1FA2",
      light: "bg-purple-50/80 border-purple-200 text-purple-600",
      textColor: "text-purple-600",
      x: 120,
      y: 500,
      offsetDistance: "100%",
      icon: (
        <svg className="w-5 h-5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2l8.5 5v10L12 22l-8.5-5V7L12 2z" fill="rgba(165, 96, 232, 0.15)" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" fill="#A560E8" />
        </svg>
      ),
      // Dynamic Diagnostics parameters
      accuracy: "🔒 0% ACC",
      nlpEngine: "NLP Evaluator Sintaksis",
      feedback: "Ulasan Detektif (Terkunci)",
      badgeTitle: "Master Utama (Terkunci)",
      badgeIcon: "👑"
    },
  ];

  // Mathematically perfect bezier curve passing exactly through all 4 alternating nodes
  const bezierCurve = "M280,80 C280,160 120,140 120,220 C120,300 280,280 280,360 C280,440 120,420 120,500";

  // Coordinates of the currently active level (for the hopping mascot)
  const currentActiveNode = levels.find(l => l.id === activeLevel) || levels[0];
  
  // Highlighted details inside the left/right panels (reacts to the clicked/inspected level!)
  const inspectedLevel = levels.find(l => l.id === (selectedLevel || activeLevel)) || levels[0];
  const isInspectedActive = inspectedLevel.status === "AKTIF";

  return (
    <div className="w-full flex justify-center items-center mt-6 relative">
      
      {/* Dynamic Glowing Ambient Orbs in the background (Glassmorphism highlight!) */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none -z-20" />
      <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-[100px] pointer-events-none -z-20" />
      
      {/* ==========================================
          THE DETECTIVE PROGRESSION SIRKUIT PATH
         ========================================== */}
      <div className="flex justify-center w-full z-10 overflow-hidden">
        <div className="relative w-[400px] h-[600px] scale-[0.7] sm:scale-[0.85] md:scale-100 origin-top">
          
          {/* SVG Bezier Path (Winding energy line) */}
          <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cyberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="35%" stopColor="#10B981" />
                <stop offset="70%" stopColor="#1CB0F6" />
                <stop offset="100%" stopColor="#A560E8" />
              </linearGradient>
            </defs>
            {/* Thick solid road base trace */}
            <path 
              d={bezierCurve} 
              stroke="#F1F5F9" 
              strokeWidth="20" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            {/* Animated Neon energy pulse flow */}
            <motion.path 
              d={bezierCurve} 
              stroke="url(#cyberGradient)" 
              strokeWidth="8" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              strokeDasharray="16, 24"
              initial={{ strokeDashoffset: 160 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
            />
          </svg>

          {/* SPRING-LOADED HOPPING DETECTIVE MASCOT */}
          <motion.div
            style={{
              offsetPath: `path('${bezierCurve}')`,
              offsetRotate: "0deg",
              transformOrigin: "50% 100%"
            }}
            animate={{ 
              offsetDistance: currentActiveNode.offsetDistance,
              y: -15
            }}
            transition={{ 
              type: "spring", 
              stiffness: 70, 
              damping: 14,
              mass: 1
            }}
            className="absolute top-0 left-0 pointer-events-none z-30 flex flex-col items-center"
          >
            {/* Miniature scale of Lerny */}
            <div className="w-48 h-48 flex items-center justify-center origin-bottom scale-[0.32] drop-shadow-md">
              <AIMascot mood="neutral" skin="explorer" />
            </div>
          </motion.div>

          {/* ROAD MODULE NODES */}
          {levels.map((lvl) => {
            const isActive = lvl.status === "AKTIF";
            const isSelected = selectedLevel === lvl.id;
            
            return (
              <div 
                key={lvl.id} 
                style={{ 
                  left: `${lvl.x}px`, 
                  top: `${lvl.y}px`,
                  zIndex: isSelected ? 40 : 10 
                }} 
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
              >
                
                {/* Rotating Sci-Fi Target lockHUD Ring for selected level */}
                {isSelected && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute w-20 h-20 border-2 border-dashed border-[#6366F1] rounded-full -z-10 opacity-75 scale-105"
                  />
                )}
                {isSelected && (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-18 h-18 bg-[#6366F1]/10 rounded-full -z-10"
                  />
                )}

                {/* Bouncy 3D Circular Core Button */}
                <button 
                  onClick={() => {
                    setActiveLevel(lvl.id);
                    setSelectedLevel(selectedLevel === lvl.id ? null : lvl.id);
                  }}
                  style={{ 
                    backgroundColor: lvl.color,
                    borderBottomColor: lvl.border
                  }}
                  className={`w-14 h-14 rounded-full border-2 border-b-6 border-white text-white font-black flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:translate-y-[4px] active:border-b-2 shadow-md relative`}
                >
                  {/* Custom Cyber Icon directly inside the button circle! */}
                  {isActive ? (
                    <div className="text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.6)]">
                      {lvl.icon}
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-center w-full h-full">
                      <div className="opacity-40 scale-85 text-white/80">
                        {lvl.icon}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <CyberLockIcon />
                      </div>
                    </div>
                  )}
                  
                  {/* Active GO notification tag */}
                  {isActive && !isSelected && (
                    <span className="absolute -top-3.5 bg-yellow-400 text-yellow-950 text-[8px] font-black px-1.5 py-0.5 rounded border border-yellow-300 shadow-md uppercase tracking-wider animate-bounce">
                      GO
                    </span>
                  )}
                </button>

                {/* Floating Cyber Glass Pop-up Details */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, x: lvl.x >= 200 ? 15 : -15 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: lvl.x >= 200 ? 15 : -15 }}
                      className={`absolute z-45 w-48 sm:w-60 bg-white/95 backdrop-blur-md border-3 border-gray-200 p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xl text-center top-1/2 -translate-y-1/2 ${
                        lvl.x >= 200 ? "right-full mr-4 sm:mr-6" : "left-full ml-4 sm:ml-6"
                      }`}
                    >
                      {/* Small pointer arrow */}
                      {lvl.x >= 200 ? (
                        <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-3.5 h-3.5 bg-white border-t-3 border-r-3 border-gray-200 rotate-45" />
                      ) : (
                        <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-3.5 h-3.5 bg-white border-b-3 border-l-3 border-gray-200 rotate-45" />
                      )}
                      
                      <div className="flex justify-center mb-3">
                        <div className={`w-10 h-10 rounded-xl ${lvl.light} border-2 border-dashed flex items-center justify-center shadow-sm`}>
                          {lvl.icon}
                        </div>
                      </div>

                      <h5 className="font-black text-gray-900 text-sm mb-1">{lvl.title}</h5>
                      <p className="text-gray-500 font-bold text-xs leading-relaxed mb-4">{lvl.desc}</p>
                      
                      <div className="mb-4 flex items-center justify-between text-[11px] font-bold border-t border-gray-50 pt-3">
                        <span className="text-gray-400 flex items-center gap-1.5">
                          <CyberEnergyIcon /> Daya Core:
                        </span>
                        <span className={isActive ? "text-emerald-500" : "text-gray-400"}>
                          {lvl.energy}
                        </span>
                      </div>

                      {isActive ? (
                        <Link href={session ? "/quiz" : "/register"} className="block w-full">
                          <button 
                            style={{ backgroundColor: lvl.color, borderBottomColor: lvl.border }}
                            className="w-full py-2.5 border-b-4 rounded-xl text-white font-black text-xs hover:brightness-105 active:translate-y-[2px] active:border-b-0 shadow-sm"
                          >
                            {session ? "MULAI KUIS ➔" : "DAFTAR & MULAI ➔"}
                          </button>
                        </Link>
                      ) : (
                        <button className="w-full py-2.5 bg-gray-100 text-gray-400 font-black text-xs rounded-xl border-b-4 border-gray-200 cursor-not-allowed">
                          Kunci Dasar 🔒
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
