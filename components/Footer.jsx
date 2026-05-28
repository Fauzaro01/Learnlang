import Link from "next/link";

export default function Footer() {
  return (
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
      
      <div className="max-w-7xl mx-auto border-t-2 border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm font-bold text-gray-400">
          © 2026 <span className="text-[#6366F1] font-black">LearnLang</span> · Dibuat Oleh SolvingTech
        </p>
        <div className="flex gap-6 text-sm font-bold text-gray-400">
          <Link href="/privacy" className="hover:text-[#6366F1] transition-colors">Privasi</Link>
          <Link href="/terms" className="hover:text-[#6366F1] transition-colors">Ketentuan</Link>
        </div>
      </div>
    </footer>
  );
}
