import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-[#F8F9FF] to-white border-t-4 border-[#E0E7FF] pt-12 sm:pt-20 pb-8 px-4 sm:px-6 mt-8 sm:mt-16 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-20 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12 mb-12 sm:mb-16">
        <div className="col-span-2 md:col-span-6 flex flex-col items-start">
          <Link href="/" className="flex items-center gap-3 mb-5 group active:scale-95 transition-transform">
            <svg
              className="w-12 h-12 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 drop-shadow-md"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="15" y="20" width="70" height="70" rx="20" fill="#6366F1" />
              <rect x="15" y="20" width="70" height="60" rx="20" fill="#818CF8" />
              <line x1="50" y1="20" x2="50" y2="6" stroke="#4338CA" strokeWidth="6" strokeLinecap="round" />
              <circle cx="50" cy="6" r="6" fill="#FBBF24" />
              <circle cx="10" cy="50" r="8" fill="#4338CA" />
              <circle cx="90" cy="50" r="8" fill="#4338CA" />
              <rect x="25" y="35" width="50" height="25" rx="8" fill="#1E1B4B" />
              <ellipse cx="32" cy="53" rx="4" ry="2.5" fill="#FF8A80" opacity="0.9" />
              <ellipse cx="68" cy="53" rx="4" ry="2.5" fill="#FF8A80" opacity="0.9" />
              <circle cx="40" cy="47" r="5" fill="#10B981" />
              <circle cx="60" cy="47" r="5" fill="#10B981" />
            </svg>
            <div className="leading-none">
              <span className="text-3xl font-black text-gray-900 tracking-tight block">
                Learn<span className="text-[#6366F1]">Lang</span>
              </span>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-1 block">
                Platform Edukasi
              </span>
            </div>
          </Link>
          <p className="text-gray-500 font-bold max-w-sm leading-relaxed text-sm">
            Membuat belajar bahasa Inggris semenyenangkan bermain game. Cerdas, interaktif, dan <span className="text-emerald-500 font-black">100% gratis!</span>
          </p>
        </div>

        <div className="col-span-1 md:col-span-3">
          <h4 className="font-black text-gray-900 mb-5 text-lg uppercase tracking-wider text-[13px]">Eksplorasi</h4>
          <ul className="space-y-4 text-[15px] font-bold text-gray-500">
            <li>
              <Link href="/learn" className="hover:text-[#6366F1] hover:translate-x-1 inline-block transition-all">
                Modul Belajar
              </Link>
            </li>
            <li>
              <Link href="/quiz" className="hover:text-amber-500 hover:translate-x-1 inline-block transition-all">
                Game Seru
              </Link>
            </li>
            <li>
              <Link href="/blogs" className="hover:text-violet-500 hover:translate-x-1 inline-block transition-all">
                Artikel & Cerita
              </Link>
            </li>
            <li>
              <Link href="/leaderboard" className="hover:text-emerald-500 hover:translate-x-1 inline-block transition-all">
                Papan Peringkat
              </Link>
            </li>
          </ul>
        </div>

        <div className="col-span-1 md:col-span-3">
          <h4 className="font-black text-gray-900 mb-5 text-lg uppercase tracking-wider text-[13px]">Lainnya</h4>
          <ul className="space-y-4 text-[15px] font-bold text-gray-500">
            <li>
              <Link href="/about" className="hover:text-[#6366F1] hover:translate-x-1 inline-block transition-all">
                Tentang Kami
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-sky-500 hover:translate-x-1 inline-block transition-all">
                Masuk Akun
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-pink-500 hover:translate-x-1 inline-block transition-all">
                Daftar Baru
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto border-t-[3px] border-indigo-50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs font-black text-gray-400 tracking-wide">
          © 2026 <span className="text-gray-800">LearnLang</span>. DIBUAT OLEH <span className="text-[#6366F1]">SOLVINGTECH</span>
        </p>
        <div className="flex gap-6 text-[11px] font-black uppercase tracking-wider text-gray-400">
          <Link href="/privacy" className="hover:text-[#6366F1] transition-colors">Privasi</Link>
          <Link href="/terms" className="hover:text-[#6366F1] transition-colors">Ketentuan</Link>
        </div>
      </div>
    </footer>
  );
}
