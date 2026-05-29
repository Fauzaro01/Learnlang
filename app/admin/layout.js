"use client";

import AdminSidebar from "@/components/AdminSidebar";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-[family-name:var(--font-nunito)]">
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b-2 border-gray-100 shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileOpen(true)}
              className="p-1.5 -ml-1.5 text-gray-600 hover:bg-gray-100 rounded-lg active:scale-95 transition-all"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </svg>
            </button>
            <span className="font-black text-gray-900 text-lg tracking-tight">Admin<span className="text-[#6366F1]">Panel</span></span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar pb-safe">
          {children}
        </main>
      </div>
    </div>
  );
}
