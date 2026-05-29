"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, AlertCircle, Bird, PartyPopper, Sparkles } from "lucide-react";
import HeroMascotIllustration from "@/components/HeroMascotIllustration";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      if (result?.error) {
        setError("Email atau password salah. Coba lagi! 😅");
      } else {
        router.push("/learn");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-[family-name:var(--font-nunito)] relative overflow-hidden">
      {/* Cloud decorations – same as landing page */}
      <div className="absolute top-16 -left-10 w-52 h-16 bg-white rounded-full border-2 border-gray-200 opacity-70 animate-[bounce_5s_ease-in-out_infinite] pointer-events-none z-0" />
      <div className="absolute top-36 -right-14 w-64 h-20 bg-white rounded-full border-2 border-gray-200 opacity-70 animate-[bounce_7s_ease-in-out_infinite] pointer-events-none z-0" />
      <div className="absolute bottom-20 -left-8 w-40 h-14 bg-white rounded-full border-2 border-gray-200 opacity-50 pointer-events-none z-0" />

      {/* Back to home */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-white hover:text-[#6366F1] font-black text-sm transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Beranda
        </Link>
      </div>

      {/* Logo top-right on mobile */}
      <div className="absolute top-5 right-6 lg:hidden z-20">
        <span className="text-2xl font-black text-[#6366F1]">LernLang</span>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* ── LEFT: Green mascot panel ─────────────────── */}
        <div className="hidden lg:flex w-[45%] bg-[#6366F1] flex-col items-center justify-center relative overflow-hidden px-10">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#818CF8] rounded-full opacity-50" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#4338CA] rounded-full opacity-40" />
          <div className="absolute top-1/2 -right-10 w-36 h-36 bg-[#818CF8] rounded-full opacity-60" />

          <div className="relative z-10 text-center">
            <HeroMascotIllustration />

            <h2 className="text-4xl font-black text-white mt-4 drop-shadow-sm leading-tight flex items-center justify-center gap-2">
              Halo, Kembali lagi! <Sparkles className="w-8 h-8 text-yellow-300" />
            </h2>
            <p className="text-white/85 font-bold text-lg mt-3 max-w-xs mx-auto leading-relaxed">
              Lanjutkan streak belajarmu dan jadilah yang terbaik!
            </p>

            {/* Stats */}
            <div className="mt-8 flex gap-4 justify-center">
              {[
                { val: "24/7", label: "Support" },
                { val: "100%", label: "Gratis" },
                { val: "AI", label: "Powered" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white/25 backdrop-blur-sm rounded-2xl px-5 py-3 text-center"
                >
                  <div className="text-2xl font-black text-white">{s.val}</div>
                  <div className="text-xs font-bold text-white/80 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Login form ─────────────────── */}
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-[420px]"
          >
            {/* Mobile mascot */}
            <div className="lg:hidden flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#6366F1] rounded-3xl flex items-center justify-center shadow-lg border-b-4 border-[#4338CA]">
                <Bird className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-[#E0E7FF] border-2 border-[#A5B4FC] rounded-full px-4 py-1.5 mb-4">
                <span className="text-[#3730A3] font-black text-xs uppercase tracking-wider">
                  Masuk ke Akun
                </span>
              </div>
              <h1 className="text-4xl font-black text-gray-950 leading-tight">
                Selamat Datang
                <br />
                <span className="text-[#6366F1] inline-flex items-center gap-2">Kembali! <PartyPopper className="w-8 h-8" /></span>
              </h1>
              <p className="text-gray-500 font-bold mt-3 text-base">
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className="text-[#6366F1] hover:text-[#4338CA] font-black underline underline-offset-2"
                >
                  Daftar Gratis →
                </Link>
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-[#FFE5E5] border-2 border-[#FF4D4D] rounded-2xl px-4 py-3 mb-6"
              >
                <AlertCircle className="w-6 h-6 text-[#C62828]" />
                <p className="text-[#C62828] font-bold text-sm leading-snug">{error}</p>
              </motion.div>
            )}

            {/* Form card */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl shadow-[0_8px_0_#E2E8F0] p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                    Alamat Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@example.com"
                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl font-bold text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#6366F1] focus:bg-white focus:ring-4 focus:ring-[#6366F1]/10 transition-all text-sm"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPass ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl font-bold text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#6366F1] focus:bg-white focus:ring-4 focus:ring-[#6366F1]/10 transition-all text-sm pr-14"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6366F1] transition-colors text-lg"
                    >
                      {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#6366F1] hover:bg-[#818CF8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl border-b-4 border-[#4338CA] hover:border-b-[6px] active:border-b-0 active:translate-y-1 transition-all duration-100 shadow-sm flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Memproses...
                    </>
                  ) : (
                    "MASUK SEKARANG →"
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
