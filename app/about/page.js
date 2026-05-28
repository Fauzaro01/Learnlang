"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import Footer from "@/components/Footer";


// ── Custom hand-crafted SVG icons ──────────────────────────────
const IconBrain   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>;
const IconGlobe   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>;
const IconZap     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>;
const IconTrophy  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const IconChat    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>;
const IconHistory = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>;
const IconArrow   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;

const features = [
  { icon: <IconBrain />,   title: "Koreksi Grammar Instan",  desc: "Kesalahan tenses & ejaan terdeteksi otomatis. Belajar dari kesalahan secara langsung.",        bg: "bg-indigo-50",   accent: "#6366F1" },
  { icon: <IconGlobe />,   title: "Latihan Dua Arah",        desc: "Latihan terjemahan Inggris ↔ Indonesia untuk keluwesan kosakata kontekstual.",                  bg: "bg-sky-50",      accent: "#0EA5E9" },
  { icon: <IconTrophy />,  title: "Papan Klasemen",          desc: "Kompetisi XP mingguan yang memicu semangat belajar melalui persaingan sehat.",                   bg: "bg-amber-50",    accent: "#F59E0B" },
  { icon: <IconZap />,     title: "Energi Harian",           desc: "Sistem isi daya baterai belajar yang melatih konsistensi dan membentuk kebiasaan baik.",         bg: "bg-emerald-50",  accent: "#10B981" },
  { icon: <IconHistory />, title: "Riwayat Presisi",         desc: "Grafik kemajuan dan pola kesalahan yang terdokumentasi rapi untuk evaluasi mandiri.",            bg: "bg-orange-50",   accent: "#F97316" },
  { icon: <IconChat />,    title: "Forum Diskusi",           desc: "Ruang komunitas hangat untuk berbagi tips, berteman, dan berdiskusi bersama pelajar lain.",      bg: "bg-purple-50",   accent: "#A855F7" },
];

const steps = [
  { num: "01", title: "Pilih Level", desc: "Sesuaikan kesulitan — dari latihan dasar hingga tantangan lanjutan.",    color: "bg-indigo-500" },
  { num: "02", title: "Jawab Soal",  desc: "Tulis kalimat, terjemahan, atau pilih jawaban yang benar.",              color: "bg-sky-500"    },
  { num: "03", title: "Terima Ulasan", desc: "Lihat penjelasan lengkap struktur kalimat dan tips grammar-nya.",      color: "bg-emerald-500"},
  { num: "04", title: "Jaga Streak", desc: "Tantangan harian menjaga ritme belajarmu tetap konsisten.",              color: "bg-amber-500"  },
];

const stats = [
  { val: "100%", label: "Gratis Selamanya",  color: "text-indigo-600" },
  { val: "24/7", label: "Siap Menemanimu",   color: "text-sky-500"    },
  { val: "3",    label: "Level Kesulitan",   color: "text-emerald-600"},
  { val: "∞",    label: "Latihan Tersedia",  color: "text-amber-500"  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-[family-name:var(--font-nunito)]">
      <Navbar />

      {/* ═══════════════════════════════════
          1. HERO — Warm Editorial
         ═══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }}
            className="space-y-7">
            <h1 className="text-5xl sm:text-6xl font-black leading-[1.08] text-gray-950 tracking-tight">
              Belajar Bahasa<br/>
              Inggris Itu<br/>
              <span className="text-[#6366F1] underline decoration-wavy decoration-indigo-200 underline-offset-4">
                Menyenangkan.
              </span>
            </h1>
            <p className="text-xl text-gray-500 font-bold leading-relaxed max-w-lg">
              Kami percaya cara terbaik belajar adalah dengan langsung mencoba — dan Learny, robot kecil kami, selalu siap mengoreksi dan mendukungmu di setiap langkah.
            </p>
            <div className="flex gap-4 flex-wrap pt-2">
              <Link href="/register">
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  className="px-7 py-3.5 bg-[#6366F1] text-white font-black rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2 text-sm hover:bg-[#4F46E5] transition-colors">
                  Mulai Gratis <IconArrow />
                </motion.button>
              </Link>
              <Link href="/quiz">
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  className="px-7 py-3.5 bg-gray-100 text-gray-700 font-black rounded-2xl text-sm hover:bg-gray-200 transition-colors">
                  Coba Kuis Dulu →
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Right — Learny illustration (friendly, not sci-fi) */}
          <div className="flex justify-center relative">
            {/* Playful color blob behind mascot */}
            <div className="absolute w-72 h-72 rounded-full bg-indigo-100 blur-3xl opacity-60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <motion.div
              animate={{ y:[0,-10,0], rotate:[0,1,-1,0] }}
              transition={{ duration:4, repeat:Infinity, ease:"easeInOut" }}
              className="relative z-10"
            >
              <svg width="220" height="220" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-2xl">
                {/* Shadow */}
                <ellipse cx="80" cy="152" rx="38" ry="7" fill="#E0E7FF" />
                {/* Body */}
                <rect x="38" y="58" width="84" height="68" rx="18" fill="#6366F1"/>
                <rect x="38" y="58" width="84" height="55" rx="18" fill="#818CF8"/>
                {/* Arms */}
                <rect x="22" y="70" width="16" height="30" rx="8" fill="#6366F1"/>
                <rect x="122" y="70" width="16" height="30" rx="8" fill="#6366F1"/>
                {/* Head */}
                <rect x="40" y="14" width="80" height="56" rx="16" fill="#6366F1"/>
                <rect x="40" y="14" width="80" height="46" rx="16" fill="#818CF8"/>
                {/* Ears */}
                <circle cx="36" cy="40" r="7" fill="#6366F1"/>
                <circle cx="124" cy="40" r="7" fill="#6366F1"/>
                {/* Hat / cap */}
                <ellipse cx="80" cy="15" rx="34" ry="5" fill="#4338CA"/>
                <path d="M56 15 L60 3 Q80 6 100 3 L104 15 Z" fill="#4F46E5"/>
                <path d="M57 12 Q80 15 103 12" stroke="#E0E7FF" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                {/* Antenna */}
                <line x1="80" y1="14" x2="80" y2="3" stroke="#4338CA" strokeWidth="3.5"/>
                <circle cx="80" cy="3" r="3.5" fill="#FCD34D"/>
                {/* Visor */}
                <rect x="52" y="24" width="56" height="22" rx="7" fill="#1E1B4B"/>
                <path d="M54 26 L64 26 L58 42 L54 42 Z" fill="white" opacity="0.07"/>
                {/* Happy eyes */}
                <path d="M63 36 Q68 30 73 36" stroke="#34D399" strokeWidth="3" strokeLinecap="round" fill="none"/>
                <path d="M87 36 Q92 30 97 36" stroke="#34D399" strokeWidth="3" strokeLinecap="round" fill="none"/>
                {/* Smile on body */}
                <path d="M65 90 Q80 100 95 90" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"/>
                {/* Book in hand */}
                <rect x="28" y="78" width="12" height="16" rx="2" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1.5"/>
                <line x1="34" y1="80" x2="34" y2="92" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round"/>
              </svg>

              {/* Floating speech bubble */}
              <motion.div
                animate={{ y:[-2,2,-2], opacity:[0.9,1,0.9] }}
                transition={{ duration:2.5, repeat:Infinity, ease:"easeInOut" }}
                className="absolute -top-3 -right-4 bg-white border-2 border-indigo-100 rounded-2xl rounded-bl-sm px-3 py-2 shadow-lg"
              >
                <p className="text-xs font-black text-indigo-700">Halo! Aku Learny 👋</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          2. SOCIAL PROOF — One strong statement
         ═══════════════════════════════════ */}
      <section className="border-y border-gray-100 py-12 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl sm:text-3xl font-black text-gray-900 leading-snug">
            Lebih dari <span className="text-[#6366F1]">2.000+ pelajar</span> sudah melatih grammar mereka
            bersama Learny — <span className="text-emerald-600">sepenuhnya gratis</span>, tanpa syarat.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm font-bold text-gray-400">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"/>Tersedia 24 jam</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"/>Tanpa iklan</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>Tanpa langganan</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          3. FEATURES — Split list, focused
         ═══════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="mb-12">
          <h2 className="text-4xl sm:text-5xl font-black text-gray-950 tracking-tight">Apa yang kamu dapat</h2>
          <p className="mt-3 text-gray-400 font-bold max-w-lg">Setiap fitur punya satu tujuan: membuat belajar grammar jadi lebih mudah dan lebih menyenangkan.</p>
        </div>

        <div className="divide-y divide-gray-100">
          {[
            {
              num: "01", color: "bg-indigo-500",
              title: "Koreksi Grammar Otomatis",
              body: "Ketik kalimatmu, dan Learny langsung memberi tahu bagian mana yang salah — disertai penjelasan mengapa. Tidak perlu tebak-tebakan."
            },
            {
              num: "02", color: "bg-sky-500",
              title: "Latihan Terjemahan Dua Arah",
              body: "Latihan menerjemahkan dari Bahasa Indonesia ke Inggris dan sebaliknya. Cara paling efektif untuk mengembangkan kosakata dalam konteks nyata."
            },
            {
              num: "03", color: "bg-amber-500",
              title: "Papan Klasemen Mingguan",
              body: "Bersaing secara sehat dengan pelajar lain lewat poin XP. Motivasi yang muncul dari kompetisi terbukti membuat orang belajar lebih konsisten."
            },
            {
              num: "04", color: "bg-emerald-500",
              title: "Streak & Energi Harian",
              body: "Setiap hari belajar = energi terisi. Sistem ini dirancang agar kamu punya alasan untuk kembali — kecil-kecil tapi konsisten adalah cara belajar yang paling ampuh."
            },
            {
              num: "05", color: "bg-orange-500",
              title: "Riwayat & Pola Kesalahan",
              body: "Lihat di mana kamu paling sering salah. Dengan mengetahui polamu sendiri, kamu bisa fokus berlatih di bagian yang benar-benar butuh perhatian."
            },
            {
              num: "06", color: "bg-purple-500",
              title: "Forum Diskusi Komunitas",
              body: "Tanyakan hal yang membingungkan, bagikan trik grammar, atau sekadar ngobrol bareng pelajar lain. Belajar bersama selalu lebih cepat dari belajar sendirian."
            },
          ].map((f, i) => (
            <motion.div key={i}
              initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true }} transition={{ delay: i*0.06, duration:0.4 }}
              className="flex gap-6 py-8 group"
            >
              <div className={`${f.color} text-white text-xs font-black w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1`}>
                {f.num}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-[#6366F1] transition-colors">{f.title}</h3>
                <p className="text-sm font-bold text-gray-500 leading-relaxed max-w-2xl">{f.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════
          4. HOW IT WORKS — User journey
         ═══════════════════════════════════ */}
      <section className="bg-gray-50 border-y border-gray-100 py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-14">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-950 tracking-tight">Perjalananmu bersama Learny</h2>
            <p className="mt-3 text-gray-500 font-bold">Dari belum tahu apa-apa, sampai percaya diri bicara Inggris.</p>
          </div>

          <div className="flex flex-col gap-0">
            {[
              {
                label: "Masuk & Pilih Level",
                detail: "Tidak ada tes masuk yang ribet. Cukup daftar, pilih kesulitan yang sesuai, dan langsung mulai. Bisa diubah kapan saja.",
                tag: "Mulai"
              },
              {
                label: "Kerjakan Soal",
                detail: "Tulis terjemahan, jawab pilihan ganda, atau isi kalimat yang kosong. Setiap soal dirancang agar kamu benar-benar berpikir — bukan asal klik.",
                tag: "Latihan"
              },
              {
                label: "Baca Ulasan Learny",
                detail: "Setelah menjawab, Learny menjelaskan kesalahanmu dengan bahasa yang mudah dimengerti. Ini bagian yang paling banyak membantu.",
                tag: "Evaluasi"
              },
              {
                label: "Kembali Besok",
                detail: "Streak harianmu mencatat seberapa konsisten kamu belajar. Tidak perlu berjam-jam — 10 menit sehari sudah cukup untuk maju.",
                tag: "Konsistensi"
              },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay: i*0.1, duration:0.45 }}
                className={`flex gap-6 py-8 ${i < 3 ? "border-b border-gray-200" : ""}`}
              >
                {/* Step number + vertical line */}
                <div className="flex flex-col items-center gap-0 shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white text-sm font-black flex items-center justify-center">
                    {String(i + 1).padStart(2,"0")}
                  </div>
                </div>

                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-black text-gray-900">{s.label}</h4>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{s.tag}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-500 leading-relaxed">{s.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════
          5. MISI — Warm editorial banner
         ═══════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.6 }}
          className="bg-[#6366F1] rounded-[2.5rem] p-12 md:p-16 text-white text-center relative overflow-hidden"
        >
          {/* Simple warm tonal blobs — NOT techy neon */}
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-black/10 rounded-full" />

          <div className="relative z-10">
            <p className="text-indigo-200 font-black text-xs uppercase tracking-widest mb-4">Misi Kami</p>
            <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-6">
              Belajar bahasa Inggris<br/>harusnya bisa<br/>
              <span className="underline decoration-white/40 decoration-wavy underline-offset-4">untuk semua orang.</span>
            </h2>
            <p className="text-indigo-100 font-bold text-base max-w-xl mx-auto leading-relaxed mb-9">
              Gratis, menyenangkan, dan efektif — tanpa biaya berlangganan, tanpa iklan, tanpa ribet. Hanya Learny dan kamu, belajar bersama setiap hari.
            </p>
            <Link href="/register">
              <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}
                className="px-8 py-4 bg-white text-[#6366F1] font-black rounded-2xl shadow-lg text-sm inline-flex items-center gap-2 hover:bg-indigo-50 transition-colors">
                Daftar Sekarang, Gratis! <IconArrow />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ────────────────────────── */}
      <Footer />
    </div>
  );
}
