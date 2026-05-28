"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";

// ==================================================
// CUSTOM BESPOKE SVG ICONS (Not generic!)
// ==================================================

const MascotGuide = () => null; // Removed to save space and reduce density

const VocabularyIcon = () => (
  <svg
    className="w-20 h-20 lg:w-24 lg:h-24 drop-shadow-[0_10px_20px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform duration-500"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="25"
      y="30"
      width="45"
      height="55"
      rx="8"
      fill="#A7F3D0"
      transform="rotate(-12 25 30)"
    />
    <rect x="35" y="20" width="45" height="55" rx="8" fill="#10B981" />
    <rect x="35" y="20" width="45" height="45" rx="8" fill="#34D399" />
    <path
      d="M45 40H65M45 50H65M45 60H55"
      stroke="white"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <circle cx="80" cy="15" r="5" fill="#FCD34D" className="animate-pulse" />
    <circle cx="20" cy="80" r="4" fill="#6EE7B7" />
  </svg>
);

const ListeningIcon = () => (
  <svg
    className="w-20 h-20 lg:w-24 lg:h-24 drop-shadow-[0_10px_20px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform duration-500"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 55v-15c0-16.5 13.5-30 30-30s30 13.5 30 30v15"
      stroke="#3B82F6"
      strokeWidth="10"
      strokeLinecap="round"
    />
    <rect x="12" y="45" width="16" height="30" rx="8" fill="#1D4ED8" />
    <rect x="72" y="45" width="16" height="30" rx="8" fill="#1D4ED8" />
    <rect x="12" y="45" width="16" height="25" rx="8" fill="#2563EB" />
    <rect x="72" y="45" width="16" height="25" rx="8" fill="#2563EB" />
    {/* Equalizer waves */}
    <rect x="42" y="45" width="4" height="20" rx="2" fill="#60A5FA">
      <animate
        attributeName="height"
        values="20;40;20"
        dur="1s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="y"
        values="45;35;45"
        dur="1s"
        repeatCount="indefinite"
      />
    </rect>
    <rect x="49" y="35" width="4" height="40" rx="2" fill="#93C5FD">
      <animate
        attributeName="height"
        values="40;20;40"
        dur="1.2s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="y"
        values="35;45;35"
        dur="1.2s"
        repeatCount="indefinite"
      />
    </rect>
    <rect x="56" y="40" width="4" height="30" rx="2" fill="#60A5FA">
      <animate
        attributeName="height"
        values="30;50;30"
        dur="0.8s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="y"
        values="40;30;40"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </rect>
  </svg>
);

const GrammarIcon = () => (
  <svg
    className="w-20 h-20 lg:w-24 lg:h-24 drop-shadow-[0_10px_20px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform duration-500"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M25 25h20a5 5 0 0 0 0-10 10 10 0 0 1 20 0 5 5 0 0 0 0 10h20v20a5 5 0 0 0 10 0 10 10 0 0 1 0 20 5 5 0 0 0-10 0v20H65a5 5 0 0 0 0 10 10 10 0 0 1-20 0 5 5 0 0 0 0-10H25V65a5 5 0 0 0-10 0 10 10 0 0 1 0-20 5 5 0 0 0 10 0V25z"
      fill="#FBBF24"
    />
    <path
      d="M25 25h20a5 5 0 0 0 0-10 10 10 0 0 1 20 0 5 5 0 0 0 0 10h20v20a5 5 0 0 0 10 0 10 10 0 0 1 0 20 5 5 0 0 0-10 0v10H25V25z"
      fill="#F59E0B"
    />
    {/* Glass */}
    <circle
      cx="65"
      cy="65"
      r="18"
      fill="rgba(255,255,255,0.4)"
      stroke="#1E3A8A"
      strokeWidth="6"
    />
    <path
      d="M78 78l12 12"
      stroke="#1E3A8A"
      strokeWidth="8"
      strokeLinecap="round"
    />
    <circle cx="60" cy="60" r="5" fill="rgba(255,255,255,0.8)" />
  </svg>
);

// ==================================================

const methods = [
  {
    key: "vocabulary",
    title: "Vocabulary",
    subtitle: "Rekomendasi",
    description:
      "Perkaya pembendaharaan kata harianmu dengan kartu interaktif yang seru.",
    icon: VocabularyIcon,
    theme: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-500/30",
    button: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  },
  {
    key: "listening",
    title: "Listening",
    subtitle: "Fokus Audio",
    description:
      "Latih telingamu menangkap intonasi dan pengucapan langsung dari native.",
    icon: ListeningIcon,
    theme: "from-blue-400 to-indigo-500",
    shadow: "shadow-blue-500/30",
    button: "bg-blue-50 text-blue-700 hover:bg-blue-100",
  },
  {
    key: "grammar",
    title: "Grammar",
    subtitle: "Struktur",
    description:
      "Susun kalimat yang presisi tanpa takut salah dengan panduan interaktif.",
    icon: GrammarIcon,
    theme: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-500/30",
    button: "bg-amber-50 text-amber-700 hover:bg-amber-100",
  },
];

export default function LearnPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hoveredMethod, setHoveredMethod] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const handleStartMethod = async (methodKey) => {
    try {
      const response = await fetch("/api/learn/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: methodKey, limit: 5 }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success) return;
      const sessionId = payload.data?.session?.id;
      if (sessionId) {
        sessionStorage.setItem("learningSessionId", sessionId);
        sessionStorage.setItem("learningMethod", methodKey);
        router.push(`/learn/${methodKey}`);
      }
    } catch (err) {
      console.error("Error starting session:", err);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
        <MascotGuide />
        <div className="text-xl font-black text-indigo-500 animate-pulse">
          Menyiapkan Misi...
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] relative w-full overflow-y-auto overflow-x-hidden font-[family-name:var(--font-nunito)] flex flex-col items-center justify-center py-12 px-4 sm:px-6">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-indigo-50/80 to-transparent -z-10 pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Clean, Centered Header */}
        <div className="text-center mb-6 lg:mb-8 relative z-10 w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white shadow-sm text-indigo-600 font-black text-xs lg:text-sm mb-4 border-2 border-indigo-50"
          >
            Pilih Jalur Belajarmu
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl lg:text-4xl font-black text-slate-900 leading-[1.2] tracking-tight mb-3"
          >
            Mulai{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">
              Petualangan
            </span>{" "}
            Bahasamu!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm lg:text-base text-slate-500 font-bold max-w-md mx-auto"
          >
            Selesaikan tantangan harian dan tingkatkan insting bahasamu.
          </motion.p>
        </div>

        {/* Spacious 3-Column Grid */}
        <div className="w-full max-w-5xl grid md:grid-cols-3 gap-5 lg:gap-8 relative z-10">
          {methods.map((method, index) => {
            const isHovered = hoveredMethod === method.key;
            const Icon = method.icon;

            return (
              <motion.div
                key={method.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                onHoverStart={() => setHoveredMethod(method.key)}
                onHoverEnd={() => setHoveredMethod(null)}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStartMethod(method.key)}
                className={`relative cursor-pointer group bg-white rounded-[2rem] p-5 lg:p-6 transition-all duration-300 border-2 border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:border-transparent flex flex-col items-center text-center ${isHovered ? method.shadow : ""}`}
              >
                {/* Hover Gradient Border */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${method.theme} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem] -z-10`}
                  style={{ margin: "-2px" }}
                />
                <div className="absolute inset-0 bg-white rounded-[2rem] -z-10 transition-transform duration-500" />

                {/* Large Icon Banner */}
                <div
                  className={`w-full h-32 lg:h-36 rounded-2xl mb-5 flex items-center justify-center bg-gradient-to-br ${method.theme} shadow-inner overflow-hidden relative`}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="scale-75 lg:scale-90">
                    <Icon />
                  </div>
                </div>

                {/* Content */}
                <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                  {method.subtitle}
                </span>
                <h3 className="text-xl lg:text-2xl font-black text-slate-800 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-800 group-hover:to-slate-600 transition-all">
                  {method.title}
                </h3>
                <p className="text-xs lg:text-sm text-slate-500 font-semibold leading-relaxed mb-5 px-1">
                  {method.description}
                </p>

                {/* Action Button */}
                <button
                  className={`mt-auto w-full py-3 rounded-xl font-black text-sm lg:text-base transition-all duration-300 ${method.button} flex items-center justify-center gap-2 group-hover:scale-[1.02]`}
                >
                  Mulai Misi
                  <svg
                    className="w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
