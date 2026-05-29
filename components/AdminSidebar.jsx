"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

// ── Custom SVG Icons (no generic icon libraries) ──────────────────────────────

const IconDashboard = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.9" />
    <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.5" />
    <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.5" />
    <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.9" />
  </svg>
);

const IconUsers = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="9" cy="7" r="3.5" fill="currentColor" />
    <path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <circle cx="18" cy="8" r="2.5" fill="currentColor" opacity="0.5" />
    <path d="M22 20c0-2.5-1.5-4.5-4-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
  </svg>
);

const IconQuiz = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" opacity="0.15" />
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
    <path d="M9 9.5C9 8.1 10.1 7 11.5 7h1C13.9 7 15 8.1 15 9.5c0 1-0.6 1.8-1.5 2.2L12 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="15.5" r="1" fill="currentColor" />
  </svg>
);

const IconBlog = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2" />
    <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="8" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const IconReport = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="2" />
    <path d="M7 17V13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M11 17V9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M15 17V11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M19 17V7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const IconLogout = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const IconChevron = ({ size = 16, collapsed }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}
  >
    <polyline points="15 18 9 12 15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconShield = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L4 6v5c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Nav items config ──────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/admin",         label: "Dashboard",  Icon: IconDashboard, color: "indigo"  },
  { href: "/admin/users",   label: "Users",      Icon: IconUsers,     color: "violet"  },
  { href: "/admin/quizzes", label: "Quizzes",    Icon: IconQuiz,      color: "sky"     },
  { href: "/admin/blogs",   label: "Blog",       Icon: IconBlog,      color: "amber"   },
  { href: "/admin/reports", label: "Reports",    Icon: IconReport,    color: "emerald" },
];

const COLOR_MAP = {
  indigo:  { active: "bg-indigo-500 text-white border-indigo-700",  dot: "bg-indigo-400",  hover: "hover:bg-indigo-50 hover:text-indigo-600" },
  violet:  { active: "bg-violet-500 text-white border-violet-700",  dot: "bg-violet-400",  hover: "hover:bg-violet-50 hover:text-violet-600" },
  sky:     { active: "bg-sky-500 text-white border-sky-700",        dot: "bg-sky-400",     hover: "hover:bg-sky-50 hover:text-sky-600"       },
  amber:   { active: "bg-amber-500 text-white border-amber-700",    dot: "bg-amber-400",   hover: "hover:bg-amber-50 hover:text-amber-600"   },
  emerald: { active: "bg-emerald-500 text-white border-emerald-700",dot: "bg-emerald-400", hover: "hover:bg-emerald-50 hover:text-emerald-600"},
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileOpen?.(false)}
        />
      )}

      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen z-50 flex flex-col bg-white border-r-4 border-gray-100 transition-transform duration-300 font-[family-name:var(--font-nunito)] shrink-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{ width: collapsed ? 72 : 240 }}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen?.(false)}
          className="md:hidden absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-xl"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Collapse toggle (Desktop only) */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden md:flex absolute -right-4 top-6 z-10 bg-white border-2 border-gray-200 rounded-full w-8 h-8 items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <IconChevron collapsed={collapsed} />
      </button>

      {/* Brand */}
      <Link href="/" className={`flex items-center gap-3 px-4 py-5 border-b-2 border-gray-100 hover:bg-indigo-50 transition-colors ${collapsed ? "justify-center" : ""}`} title="Kembali ke landing page">
        <div className="relative shrink-0">
          <svg className="w-10 h-10 drop-shadow-md" viewBox="0 0 100 100" fill="none">
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
        {!collapsed && (
          <div className="leading-none">
            <div className="font-black text-gray-900 text-[17px] tracking-tight">Learn<span className="text-[#6366F1]">Lang</span></div>
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.14em] mt-0.5">Admin Panel</div>
          </div>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, Icon, color }) => {
          const active = isActive(href);
          const c = COLOR_MAP[color];
          return (
            <Link key={href} href={href}>
              <div
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl font-black text-sm transition-all
                  ${collapsed ? "justify-center" : ""}
                  ${active
                    ? `${c.active} border-b-4 shadow-sm`
                    : `text-gray-500 ${c.hover} border-b-4 border-transparent`
                  }
                `}
                title={collapsed ? label : undefined}
              >
                <span className="flex-shrink-0">
                  <Icon size={20} />
                </span>
                {!collapsed && <span>{label}</span>}
                {!collapsed && active && (
                  <span className={`ml-auto w-2 h-2 rounded-full ${c.dot}`} />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className={`px-3 py-4 border-t-2 border-gray-100 space-y-2`}>
        {/* User info */}
        {!collapsed && session?.user && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
              {session.user.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black text-gray-800 truncate">{session.user.name}</div>
              <div className="text-[10px] font-bold text-gray-400 truncate">{session.user.email}</div>
            </div>
            <Link
              href="/admin/notifications"
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
              title="Notifikasi"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        )}
        {/* Bell icon when collapsed */}
        {collapsed && (
          <Link
            href="/admin/notifications"
            className="w-full flex items-center justify-center py-2 rounded-xl text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            title="Notifikasi"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        )}

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-black text-sm text-red-400
            hover:bg-red-50 hover:text-red-600 transition-all border-b-4 border-transparent hover:border-red-100
            ${collapsed ? "justify-center" : ""}
          `}
          title={collapsed ? "Logout" : undefined}
        >
          <IconLogout size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
    </>
  );
}
