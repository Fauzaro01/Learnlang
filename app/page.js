"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { landingPageMetadata } from "./metadata";

// Import modular, high-fidelity components
import HeroMascotIllustration from "@/components/HeroMascotIllustration";
import GamificationIllustration from "@/components/GamificationIllustration";
import AIMascot from "@/components/AIMascot";
import DuolingoGame from "@/components/DuolingoGame";
import InteractivePathMap from "@/components/InteractivePathMap";
import AIReviewIllustration from "@/components/AIReviewIllustration";
import LeaderboardIllustration from "@/components/LeaderboardIllustration";
import AnimatedText from "@/components/AnimatedText";

// ==========================================
//   STUNNING BESPOKE CUSTOM VECTOR SVG ICONS
// ==========================================

const GameControllerIcon = () => (
  <svg
    className="w-10 h-10 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="6"
      width="18"
      height="12"
      rx="4"
      fill="rgba(16,185,129,0.1)"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M7 12h4M9 10v4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="14.5" cy="12" r="1" fill="currentColor" />
    <circle cx="17" cy="10" r="1" fill="currentColor" />
    <circle cx="17" cy="14" r="1" fill="currentColor" />
  </svg>
);

const CompassIcon = () => (
  <svg
    className="w-12 h-12 text-[#6366F1] drop-shadow-[0_0_8px_rgba(99,102,241,0.3)] animate-pulse"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2"
      strokeDasharray="4 2"
      className="opacity-55"
    />
    <circle cx="12" cy="12" r="6" stroke="#10B981" strokeWidth="1.5" />
    <path
      d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"
      fill="#6366F1"
      stroke="#4F46E5"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="1.5" fill="white" />
  </svg>
);

const TrophyBadgeIcon = () => (
  <svg
    className="w-12 h-12 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9H4.5A1.5 1.5 0 0 1 3 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M18 9h1.5A1.5 1.5 0 0 0 21 7.5V6a1.5 1.5 0 0 0-1.5-1.5h-3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M8 3h8v8a4 4 0 0 1-8 0V3z"
      fill="rgba(245,158,11,0.1)"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M12 15v4M9 19h6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const RobotBadgeIcon = () => (
  <svg
    className="w-12 h-12 text-[#1CB0F6] drop-shadow-[0_0_8px_rgba(28,176,246,0.3)]"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="5"
      y="7"
      width="14"
      height="11"
      rx="3"
      fill="rgba(28,176,246,0.1)"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M9 12h.01M15 12h.01"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M12 3v4M8 3h8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const CrownBadgeIcon = () => (
  <svg
    className="w-12 h-12 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 4l3 12h14l3-12-6 5-4-4-4 4-6-5z"
      fill="rgba(234,179,8,0.1)"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M5 20h14"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const HeartBadgeIcon = () => (
  <svg
    className="w-12 h-12 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="6"
      y="3"
      width="12"
      height="18"
      rx="3"
      fill="rgba(244,63,94,0.1)"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M9 3h6M12 3v3M9 10h6M9 14h6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="18" r="1.5" fill="currentColor" />
  </svg>
);

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mascotMood, setMascotMood] = useState("neutral");

  const ctaHref = session ? "/learn" : "/register";
  const ctaLabel = session ? "LANJUT BELAJAR ➔" : "MULAI SEKARANG ➔";

  return (
    <div className="min-h-screen bg-white text-gray-800 font-[family-name:var(--font-nunito)] selection:bg-[#818CF8] selection:text-white">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .duo-btn {
          border-bottom-width: 4px;
          transition: all 0.1s ease;
        }
        .duo-btn:hover {
          transform: translateY(-2px);
          border-bottom-width: 6px;
        }
        .duo-btn:active {
          transform: translateY(4px);
          border-bottom-width: 0px;
        }
        
        .cloud-bg {
          position: absolute;
          background: white;
          border-radius: 999px;
          opacity: 0.7;
          border: 3px solid #E2E8F0;
        }
      `,
        }}
      />

      <Navbar />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(landingPageMetadata.structuredData),
        }}
      />

      {/* Cloud Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="cloud-bg w-48 h-16 top-24 -left-12 shadow-sm animate-[bounce_4s_infinite]" />
        <div className="cloud-bg w-64 h-20 top-40 -right-16 shadow-sm animate-[bounce_5s_infinite]" />
      </div>

      {/* ==========================================
          1. HERO SECTION
         ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-8 lg:pt-12 lg:pb-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">

          <div className="lg:col-span-7 text-center lg:text-left z-10 space-y-5 sm:space-y-8">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-gray-950 leading-[1.1] tracking-tight">
              Cara Pintar, Cepat & <br />
              <AnimatedText /> Belajar <br />
              Bahasa Inggris!
            </h1>

            <p className="text-base sm:text-xl lg:text-2xl text-[#78909C] font-bold max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Platform interaktif yang menggabungkan asyiknya bermain game dengan koreksi kecerdasan buatan (AI) secara instan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start max-w-md mx-auto lg:mx-0">
              <Link href="/register" className="w-full">
                <button className="w-full py-4 sm:py-5 bg-[#6366F1] hover:bg-[#818CF8] text-white border-b-6 border-[#4338CA] rounded-2xl font-black text-lg sm:text-xl duo-btn flex items-center justify-center gap-3 shadow-md">
                  MULAI SEKARANG ➔
                </button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 z-10 hidden sm:block">
            <HeroMascotIllustration />
          </div>
        </div>
      </section>

      {/* ==========================================
          STATS SECTION (SOCIAL PROOF)
         ========================================== */}
      {/* <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-white border-4 border-gray-200 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center shadow-[0_6px_0_#E2E8F0] relative overflow-hidden">
          <div className="space-y-1">
            <h3 className="text-4xl font-black text-[#6366F1]">10,000+</h3>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Kalimat Teranalisis AI</p>
          </div>
          <div className="border-t-2 md:border-t-0 md:border-x-2 border-gray-100 py-4 md:py-0 space-y-1">
            <h3 className="text-4xl font-black text-emerald-500">99.8%</h3>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Koreksi Grammar Presisi</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-4xl font-black text-amber-500">24/7</h3>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Mentor AI Aktif Menemani</p>
          </div>
        </div>
      </section> */}

      {/* ==========================================
          2. THE PLAYGROUND (Mini-game)
         ========================================== */}
      <section className="bg-[#F0F7FF] border-y-2 border-gray-200 py-12 sm:py-24 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto flex flex-col items-center">

          <div className="text-center mb-8 sm:mb-12 flex flex-col items-center gap-2">
            <GameControllerIcon />
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-gray-950 mb-2">Coba Fitur Detektif AI!</h2>
            <p className="text-sm sm:text-lg text-[#0288D1] font-bold px-2">Temukan 1 kata yang salah secara grammar, dan lihat penjelasan cerdas dari AI</p>
          </div>

          <div className="w-full grid lg:grid-cols-12 gap-6 sm:gap-12 items-center">
            <div className="lg:col-span-4 hidden lg:flex items-center justify-center">
              <AIMascot mood={mascotMood} />
            </div>
            <div className="lg:col-span-8 w-full">
              <DuolingoGame onResult={(mood) => setMascotMood(mood)} />
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          3. VISUAL LEARNING TREE (Path Map)
         ========================================== */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto flex flex-col items-center">

          <div className="text-center mb-8 sm:mb-16 flex flex-col items-center gap-2">
            <CompassIcon />
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-gray-950 mb-2">Jalur Belajar Yang Rapi</h2>
            <p className="text-sm sm:text-lg text-[#78909C] font-bold px-2">Klik tombol angka di peta untuk mengintip materi kuis kami!</p>
          </div>

          <InteractivePathMap />
        </div>
      </section>

      {/* ==========================================
          4. STORYTELLING ALTERNATING SECTIONS
         ========================================== */}

      {/* Section A: Belajar Sambil Bermain (Tech battery themed) */}
      <section className="bg-white border-y-2 border-gray-200 py-12 sm:py-24 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          <div className="lg:col-span-5 order-last lg:order-first hidden sm:block">
            <GamificationIllustration />
          </div>
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <TrophyBadgeIcon />
              <span className="text-xs font-black bg-[#E0E7FF] text-[#3730A3] px-3.5 py-1.5 rounded-full uppercase tracking-wider border-2 border-[#A5B4FC]">
                Tantangan Seru
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-950 mb-4 sm:mb-6 leading-tight">
              Kumpulkan Streak Harian & Jaga Sisa Energi!
            </h2>
            <p className="text-base sm:text-lg text-[#78909C] font-bold leading-relaxed mb-4 sm:mb-6">
              Di LearnLang, setiap kebiasaan baikmu akan dihargai. Jaga keaktifan belajarmu dengan mengumpulkan Streak harian. Rasakan ketegangan mempertahankan sisa daya baterai (energy) di setiap kuis sulit!
            </p>
            <p className="text-sm sm:text-base text-gray-500 font-bold leading-relaxed">
              Sistem gamifikasi cerdas ini membuat belajar tidak lagi menjadi beban, melainkan hiburan seru yang melatih fokusmu setiap harinya.
            </p>
          </div>
        </div>
      </section>

      {/* Section B: AI Evaluator */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <RobotBadgeIcon />
              <span className="text-xs font-black bg-[#E1F5FE] text-[#0277BD] px-3.5 py-1.5 rounded-full uppercase tracking-wider border-2 border-[#81D4FA]">
                Teknologi Cerdas
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-950 mb-4 sm:mb-6 leading-tight">
              Evaluasi AI Instan & Penjelasan Super Detail
            </h2>
            <p className="text-base sm:text-lg text-[#78909C] font-bold leading-relaxed mb-4 sm:mb-6">
              Salah menyusun kalimat bahasa Inggris? Tenang! Sistem kecerdasan buatan (AI) kami akan langsung memeriksa letak kesalahanmu secara detail dan memberikan saran perbaikan grammar yang tepat.
            </p>
            <p className="text-sm sm:text-base text-gray-500 font-bold leading-relaxed">
              Bukan cuma menyalahkan, AI kami menjelaskan struktur kalimat yang benar sehingga kamu bisa belajar dari kesalahan secara mendalam dan cepat pintar.
            </p>
          </div>
          <div className="lg:col-span-5 hidden sm:block">
            <AIReviewIllustration />
          </div>
        </div>
      </section>

      {/* Section C: Leaderboard */}
      <section className="bg-white border-y-2 border-gray-200 py-12 sm:py-24 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          <div className="lg:col-span-5 order-last lg:order-first hidden sm:block">
            <LeaderboardIllustration />
          </div>
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <CrownBadgeIcon />
              <span className="text-xs font-black bg-[#FFFDE7] text-[#F57F17] px-3.5 py-1.5 rounded-full uppercase tracking-wider border-2 border-[#FFF59D]">
                Sosial & Kompetisi
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-950 mb-4 sm:mb-6 leading-tight">
              Kompetisi Sehat di Papan Peringkat Global
            </h2>
            <p className="text-base sm:text-lg text-[#78909C] font-bold leading-relaxed mb-4 sm:mb-6">
              Kumpulkan poin dari setiap penyelesaian pelajaran dan raih peringkat teratas di papan klasemen! Diskusi terbuka di forum kian mempermudah kamu bertukar tips dan trik belajar bersama pelajar lainnya.
            </p>
            <p className="text-sm sm:text-base text-gray-500 font-bold leading-relaxed">
              Dengan interaksi sosial yang dinamis, motivasi belajarmu akan terus terjaga bersama komunitas yang suportif.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          5. FUN TESTIMONIALS (Premium hovering cards)
         ========================================== */}
      <section className="py-12 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-16 flex flex-col items-center gap-2">
            <HeartBadgeIcon />
            <h2 className="text-2xl sm:text-4xl font-black text-gray-950 mb-2">Disukai Banyak Pelajar Seru</h2>
            <p className="text-sm sm:text-lg text-[#78909C] font-bold px-2">Inilah pengalaman asyik mereka yang sudah belajar bersama kami.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{
                y: -8,
                boxShadow:
                  "0 20px 25px -5px rgba(99, 102, 241, 0.15), 0 10px 10px -5px rgba(99, 102, 241, 0.1)",
              }}
              className="bg-white border-3 border-b-6 border-gray-200 hover:border-[#6366F1]/40 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300"
            >
              <p className="font-bold text-gray-600 mb-6 italic">
                "Awalnya saya benci belajar grammar. Tapi game kuis di LearnLang
                bikin semuanya jadi adiktif!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center text-white font-bold">
                  R
                </div>
                <div>
                  <h4 className="font-black text-sm text-gray-900">Raka S.</h4>
                  <p className="text-xs text-gray-400 font-bold">Pelajar</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{
                y: -8,
                boxShadow:
                  "0 20px 25px -5px rgba(99, 102, 241, 0.15), 0 10px 10px -5px rgba(99, 102, 241, 0.1)",
              }}
              className="bg-white border-3 border-b-6 border-gray-200 hover:border-[#6366F1]/40 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300"
            >
              <p className="font-bold text-gray-600 mb-6 italic">
                "Penjelasan AI sangat membantu memahami struktur tenses secara
                presisi, mirip guru les privat!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <h4 className="font-black text-sm text-gray-900">
                    Amelia D.
                  </h4>
                  <p className="text-xs text-gray-400 font-bold">Siswa SMA</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{
                y: -8,
                boxShadow:
                  "0 20px 25px -5px rgba(99, 102, 241, 0.15), 0 10px 10px -5px rgba(99, 102, 241, 0.1)",
              }}
              className="bg-white border-3 border-b-6 border-gray-200 hover:border-[#6366F1]/40 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300"
            >
              <p className="font-bold text-gray-600 mb-6 italic">
                "Desain webnya super lucu dan bersahabat! Tidak bikin stres
                layaknya platform belajar biasa."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                  T
                </div>
                <div>
                  <h4 className="font-black text-sm text-gray-900">
                    Taufik H.
                  </h4>
                  <p className="text-xs text-gray-400 font-bold">Karyawan</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==========================================
          6. MASSIVE BOLD CTA
         ========================================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-gradient-to-r from-[#6366F1] to-[#818CF8] rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-12 text-center border-4 border-b-12 border-[#4338CA] shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            {/* Mascot header inside CTA */}
            <motion.svg
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              width="90"
              height="90"
              viewBox="0 0 160 160"
              className="mb-4 drop-shadow-md"
            >
              <rect
                x="30"
                y="40"
                width="100"
                height="80"
                rx="20"
                fill="white"
              />
              <motion.g
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ transformOrigin: "80px 40px" }}
              >
                <rect
                  x="50"
                  y="60"
                  width="60"
                  height="30"
                  rx="8"
                  fill="#1E1B4B"
                />
                <ellipse
                  cx="60"
                  cy="80"
                  rx="3"
                  ry="2"
                  fill="#FF8A80"
                  opacity="0.8"
                />
                <ellipse
                  cx="100"
                  cy="80"
                  rx="3"
                  ry="2"
                  fill="#FF8A80"
                  opacity="0.8"
                />
                <circle cx="70" cy="75" r="5" fill="#10B981" />
                <circle cx="90" cy="75" r="5" fill="#10B981" />
              </motion.g>
              <line
                x1="80"
                y1="40"
                x2="80"
                y2="20"
                stroke="white"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <circle cx="80" cy="15" r="8" fill="#FBBF24" />
            </motion.svg>
            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white mb-4 sm:mb-6">Kuasai Bahasa dengan AI! 🚀</h2>
            <p className="text-base sm:text-xl text-[#F1FFF8] font-bold mb-6 sm:mb-10 max-w-xl mx-auto">
              Daftar gratis selamanya. Dapatkan akses penuh ke sistem koreksi AI sekarang juga!
            </p>
            <Link href="/register">
              <button className="px-8 sm:px-12 py-4 sm:py-5 bg-white text-[#6366F1] border-b-6 border-gray-300 hover:border-gray-400 rounded-2xl font-black text-lg sm:text-2xl active:translate-y-[4px] active:border-b-0 shadow-lg">
                DAFTAR SEKARANG! 🚀
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ==========================================
          7. PLAYFUL FOOTER
         ========================================== */}
      <footer className="bg-white border-t-2 border-gray-200 pt-10 sm:pt-16 pb-8 px-4 sm:px-6 mt-8 sm:mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12 mb-8 sm:mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <svg
                className="w-10 h-10 group-hover:scale-110 transition-transform duration-200 drop-shadow-sm"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="15"
                  y="20"
                  width="70"
                  height="70"
                  rx="16"
                  fill="#6366F1"
                />
                <rect
                  x="15"
                  y="20"
                  width="70"
                  height="60"
                  rx="16"
                  fill="#818CF8"
                />
                <line
                  x1="50"
                  y1="20"
                  x2="50"
                  y2="8"
                  stroke="#4338CA"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <circle cx="50" cy="8" r="5" fill="#FBBF24" />
                <circle cx="10" cy="50" r="7" fill="#4338CA" />
                <circle cx="90" cy="50" r="7" fill="#4338CA" />
                <rect
                  x="25"
                  y="35"
                  width="50"
                  height="25"
                  rx="6"
                  fill="#1E1B4B"
                />
                <ellipse
                  cx="32"
                  cy="53"
                  rx="3.5"
                  ry="2"
                  fill="#FF8A80"
                  opacity="0.8"
                />
                <ellipse
                  cx="68"
                  cy="53"
                  rx="3.5"
                  ry="2"
                  fill="#FF8A80"
                  opacity="0.8"
                />
                <circle cx="40" cy="47" r="4.5" fill="#10B981" />
                <circle cx="60" cy="47" r="4.5" fill="#10B981" />
              </svg>
              <span className="text-2xl font-black text-gray-900 tracking-tight">
                Learn<span className="text-[#6366F1]">Lang</span>
              </span>
            </Link>
            <p className="text-[#78909C] font-bold max-w-sm leading-relaxed">
              Membuat belajar bahasa Inggris menyenangkan layaknya bermain game.
              Cerdas, menyenangkan, dan gratis selamanya!
            </p>
          </div>
          <div>
            <h4 className="font-black text-gray-900 mb-4 text-lg">Eksplor</h4>
            <ul className="space-y-3 font-bold text-[#78909C]">
              <li>
                <Link
                  href="/learn"
                  className="hover:text-[#6366F1] transition-colors"
                >
                  Modul Belajar
                </Link>
              </li>
              <li>
                <Link
                  href="/quiz"
                  className="hover:text-[#6366F1] transition-colors"
                >
                  Game Seru
                </Link>
              </li>
              <li>
                <Link
                  href="/blogs"
                  className="hover:text-[#6366F1] transition-colors"
                >
                  Cerita & Artikel
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-gray-900 mb-4 text-lg">Info</h4>
            <ul className="space-y-3 font-bold text-[#78909C]">
              <li>
                <Link
                  href="/about"
                  className="hover:text-[#6366F1] transition-colors"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[#6366F1] transition-colors"
                >
                  Hubungi Kami
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-[#6366F1] transition-colors"
                >
                  Masuk Akun
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
