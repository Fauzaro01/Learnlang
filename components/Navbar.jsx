"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserAvatar from "@/components/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GraduationCap, FileText, History, Settings, BarChart3, Users, 
  ClipboardList, LogOut, Menu, X, User, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/lib/socket-provider";
import NotificationBell from "@/components/NotificationBell";

// ==========================================
//   MODERN PLAYFUL VECTOR NAV ICONS
// ==========================================

const HomeIcon = () => (
  <svg className="w-5 h-5 transition-transform duration-100 group-hover:scale-110 group-hover:rotate-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="homeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#818CF8" />
      </linearGradient>
    </defs>
    {/* Roof */}
    <path d="M12 2.5L2 10L3.5 11L12 4.5L20.5 11L22 10L12 2.5Z" fill="url(#homeGrad)" />
    {/* House body */}
    <path d="M4 10V20C4 20.5523 4.44772 21 5 21H9V15C9 14.4477 9.44772 14 10 14H14C14.5523 14 15 14.4477 15 15V21H19C19.5523 21 20 20.5523 20 20V10L12 4L4 10Z" fill="url(#homeGrad)" />
    {/* Door */}
    <rect x="10" y="15" width="4" height="6" rx="0.5" fill="#4338CA" />
    {/* Window left */}
    <rect x="6.5" y="12" width="2.5" height="2.5" rx="0.5" fill="#FBBF24" opacity="0.9" />
    {/* Window right */}
    <rect x="15" y="12" width="2.5" height="2.5" rx="0.5" fill="#FBBF24" opacity="0.9" />
  </svg>
);

const AboutIcon = () => (
  <svg className="w-5 h-5 transition-transform duration-100 group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="aboutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#A78BFA" />
      </linearGradient>
    </defs>
    {/* Info circle */}
    <circle cx="12" cy="12" r="9" fill="url(#aboutGrad)" />
    {/* i dot */}
    <circle cx="12" cy="8" r="1.5" fill="white" />
    {/* i line */}
    <rect x="11" y="11" width="2" height="7" rx="1" fill="white" />
    {/* Decorative dots */}
    <circle cx="6" cy="6" r="1" fill="#DDD6FE" opacity="0.6" />
    <circle cx="18" cy="6" r="1" fill="#DDD6FE" opacity="0.6" />
    <circle cx="6" cy="18" r="1" fill="#DDD6FE" opacity="0.6" />
    <circle cx="18" cy="18" r="1" fill="#DDD6FE" opacity="0.6" />
  </svg>
);

const MascotLogo = () => (
  <div className="relative shrink-0 group-hover:scale-110 transition-transform duration-200 drop-shadow-md">
    <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none">
      <rect x="15" y="18" width="70" height="64" rx="18" fill="#6366F1" />
      <rect x="15" y="18" width="70" height="56" rx="18" fill="#818CF8" />
      <line x1="50" y1="18" x2="50" y2="5" stroke="#4338CA" strokeWidth="5" strokeLinecap="round" />
      <circle cx="50" cy="5" r="5" fill="#FBBF24" />
      <circle cx="8"  cy="48" r="8" fill="#4338CA" />
      <circle cx="92" cy="48" r="8" fill="#4338CA" />
      <rect x="24" y="32" width="52" height="24" rx="7" fill="#1E1B4B" />
      <ellipse cx="31" cy="50" rx="4" ry="2.5" fill="#FF8A80" opacity="0.9" />
      <ellipse cx="69" cy="50" rx="4" ry="2.5" fill="#FF8A80" opacity="0.9" />
      <circle cx="40" cy="44" r="5" fill="#10B981" />
      <circle cx="60" cy="44" r="5" fill="#10B981" />
      <circle cx="40" cy="44" r="2" fill="white" />
      <circle cx="60" cy="44" r="2" fill="white" />
    </svg>
    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
  </div>
);



export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";
  const { socket } = useSocket();
  const [friendRequestCount, setFriendRequestCount] = useState(0);

  useEffect(() => {
    if (!socket) return;
    const handler = (payload) => {
      setFriendRequestCount((c) => c + 1);
    };
    socket.on("friend-request", handler);
    return () => {
      socket.off("friend-request", handler);
    };
  }, [socket]);

  const publicNavItems = [
    { name: "Beranda", href: "/", icon: <HomeIcon /> },
    { name: "Tentang", href: "/about", icon: <AboutIcon /> },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b-4 border-gray-200 sticky top-0 z-50 font-[family-name:var(--font-nunito)] transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo (Duolingo Style: Cute 3D block) */}
          <Link href={"/"} className="flex items-center gap-2 sm:gap-3 group">
            <MascotLogo />
            <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Lern<span className="text-[#6366F1]">Lang</span>
            </span>
          </Link>

          {/* Navigation and Profile Section */}
          <div className="flex items-center gap-6">
            
            {/* Public Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              {publicNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl font-black transition-colors flex items-center gap-2.5 text-sm group"
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            {!user && (
              <div className="hidden md:flex items-center gap-4">
                <Link href="/login">
                  <div className="px-5 py-2.5 bg-white border-2 border-b-4 border-gray-200 text-[#1cb0f6] font-black rounded-xl cursor-pointer text-sm transition-all hover:bg-gray-50 active:translate-y-[2px] active:border-b-2">
                    MASUK
                  </div>
                </Link>
                <Link href="/register">
                  <div className="px-6 py-2.5 bg-[#6366F1] border-b-4 border-[#4338CA] text-white font-black rounded-xl cursor-pointer text-sm transition-all hover:bg-[#818CF8] active:translate-y-[2px] active:border-b-0">
                    DAFTAR GRATIS
                  </div>
                </Link>
              </div>
            )}

            {/* Bell Icon - Notifications */}
            {user && <NotificationBell />}

            {/* Profile Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="flex items-center gap-3 bg-white border-2 border-b-4 border-gray-200 pl-4 pr-1 py-1 rounded-full cursor-pointer hover:bg-gray-50 active:translate-y-[2px] active:border-b-2 transition-all">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-black text-gray-800">{user?.name}</p>
                      <p className="text-xs font-black text-[#6366F1]">
                        {isAdmin ? "Admin" : "Pelajar"}
                      </p>
                    </div>
                    <div className="relative">
                      <UserAvatar
                        src={user?.avatar}
                        name={user?.name}
                        className="w-8 h-8 shadow-sm"
                        size={28}
                        showInitial
                      />
                      {friendRequestCount > 0 && (
                        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-600 border-2 border-white rounded-full">
                          {friendRequestCount}
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-2 border-b-4 border-gray-200 shadow-xl p-2 font-[family-name:var(--font-nunito)]">
                  <DropdownMenuLabel className="mb-2">
                    <p className="font-black text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-400 font-bold">{user?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 mb-2" />
                  
                  <DropdownMenuItem asChild className="rounded-xl hover:bg-[#FFFDE7] focus:bg-[#FFFDE7] cursor-pointer font-black text-gray-700 mb-1">
                    <Link href="/profile"><User className="mr-2 h-4 w-4 text-orange-500" /> Profil Saya</Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="rounded-xl hover:bg-[#F1FFF8] focus:bg-[#F1FFF8] cursor-pointer font-black text-gray-700 mb-1">
                    <Link href="/learn"><GraduationCap className="mr-2 h-4 w-4 text-[#6366F1]" /> Belajar</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl hover:bg-[#E1F5FE] focus:bg-[#E1F5FE] cursor-pointer font-black text-gray-700 mb-1">
                    <Link href="/quiz"><FileText className="mr-2 h-4 w-4 text-[#1cb0f6]" /> Quiz & Game</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl hover:bg-[#F9F0FF] focus:bg-[#F9F0FF] cursor-pointer font-black text-gray-700 mb-2">
                    <Link href="/diskusi"><MessageSquare className="mr-2 h-4 w-4 text-purple-500" /> Forum Diskusi</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl hover:bg-gray-100 focus:bg-gray-100 cursor-pointer font-black text-gray-700 mb-1">
                    <Link href="/chats"><MessageSquare className="mr-2 h-4 w-4 text-indigo-500" /> Chats</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl hover:bg-gray-100 focus:bg-gray-100 cursor-pointer font-black text-gray-700 mb-2">
                    <Link href="/friends"><Users className="mr-2 h-4 w-4 text-emerald-500" /> Cari Teman</Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-gray-200 my-2" />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="rounded-xl font-black text-gray-700">
                          <Settings className="mr-2 h-4 w-4 text-gray-400" /> Menu Admin
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="rounded-xl border-2 border-gray-200 shadow-xl p-1 font-[family-name:var(--font-nunito)]">
                          <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-black"><Link href="/admin"><BarChart3 className="mr-2 h-4 w-4" /> Dashboard</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-black"><Link href="/admin/quizzes"><ClipboardList className="mr-2 h-4 w-4" /> Kuis</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-black"><Link href="/admin/quizzes"><ClipboardList className="mr-2 h-4 w-4" /> Kuis</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-black"><Link href="/admin/users"><Users className="mr-2 h-4 w-4" /> Pengguna</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-black"><Link href="/admin/blogs"><FileText className="mr-2 h-4 w-4" /> Blog</Link></DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </>
                  )}

                  <DropdownMenuSeparator className="bg-gray-200 my-2" />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="rounded-xl cursor-pointer text-red-600 font-black hover:bg-red-50 focus:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" /> Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b-4 border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-6 space-y-4">
              {publicNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3.5 py-3 px-4 rounded-xl hover:bg-gray-100 text-gray-800 font-black text-lg transition-colors group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}

              {!user && (
                <div className="pt-6 border-t border-gray-100 space-y-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-full py-3 rounded-xl bg-white border-2 border-b-4 border-gray-200 text-[#1cb0f6] font-black text-center">
                      MASUK
                    </div>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-full py-3 rounded-xl bg-[#6366F1] border-b-4 border-[#4338CA] text-white font-black text-center shadow-lg">
                      DAFTAR GRATIS
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
