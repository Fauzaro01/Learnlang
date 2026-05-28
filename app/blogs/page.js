"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { blogListMetadata } from "../metadata";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ==================================================
// CUSTOM BESPOKE SVG ICONS — No generic library icons
// ==================================================

const CalendarIcon = () => (
  <svg
    className="w-3.5 h-3.5 text-slate-400 shrink-0"
    viewBox="0 0 16 16"
    fill="none"
  >
    <rect
      x="1.5"
      y="3"
      width="13"
      height="11"
      rx="2.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M1.5 7h13" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M5 1.5v3M11 1.5v3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const AuthorIcon = () => (
  <svg
    className="w-3.5 h-3.5 text-slate-400 shrink-0"
    viewBox="0 0 16 16"
    fill="none"
  >
    <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M2.5 14c0-2.5 2.2-4.5 5.5-4.5s5.5 2 5.5 4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg
    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14 5l7 7m0 0l-7 7m7-7H3"
    />
  </svg>
);

const EmptyBlogIcon = () => (
  <svg
    className="w-24 h-24 mx-auto mb-6 drop-shadow-lg"
    viewBox="0 0 100 100"
    fill="none"
  >
    {/* Open book */}
    <path
      d="M15 30c0-3 8-8 35-8s35 5 35 8v42c0 3-8 6-35 6s-35-3-35-6V30z"
      fill="#E0E7FF"
    />
    <path
      d="M50 22v50"
      stroke="#6366F1"
      strokeWidth="2"
      strokeDasharray="4 2"
    />
    <path
      d="M50 22c-12 0-28 2-32 5v45c4-3 20-5 32-5"
      fill="#EEF2FF"
      stroke="#818CF8"
      strokeWidth="1.5"
    />
    <path
      d="M50 22c12 0 28 2 32 5v45c-4-3-20-5-32-5"
      fill="white"
      stroke="#818CF8"
      strokeWidth="1.5"
    />
    {/* Text lines */}
    <path
      d="M26 38h18M26 44h14M26 50h10"
      stroke="#A5B4FC"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M56 38h18M56 44h14M56 50h10"
      stroke="#C7D2FE"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Sparkle */}
    <circle cx="78" cy="20" r="4" fill="#FBBF24" />
    <circle cx="22" cy="24" r="3" fill="#6EE7B7" />
    {/* Question mark */}
    <circle cx="50" cy="54" r="10" fill="#6366F1" />
    <text
      x="50"
      y="59"
      textAnchor="middle"
      fill="white"
      fontSize="14"
      fontWeight="bold"
    >
      ?
    </text>
  </svg>
);

// ==================================================

export default function BlogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchBlogs();
    }
  }, [status]);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/blogs");
      const data = await response.json();
      if (response.ok) {
        setBlogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg font-black text-[#9333EA] animate-pulse">
          Memuat Artikel...
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout>
      {/* JSON-LD Structured Data for Blog */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogListMetadata.structuredData),
        }}
      />

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

      <div className="min-h-[calc(100vh-4rem)] bg-white relative w-full font-[family-name:var(--font-nunito)]">
        {/* Cloud Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="cloud-bg w-48 h-16 top-12 -right-12 shadow-sm animate-[bounce_4s_infinite]" />
          <div className="cloud-bg w-64 h-20 top-32 -left-16 shadow-sm animate-[bounce_5s_infinite]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-10 relative z-10">
          {/* ── Hero Banner — Gamified ── */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#9333EA] to-[#A855F7] p-8 sm:p-12 text-white shadow-xl border-4 border-b-8 border-[#7E22CE] relative"
          >
            <div className="flex flex-col gap-5 relative z-10">
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-black text-white border-2 border-white/30 shadow-sm w-fit uppercase tracking-wider">
                📚 Jurnal Belajar
              </div>

              <div className="max-w-2xl">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 drop-shadow-md leading-tight">
                  Kuasai Teorinya!
                </h1>
                <p className="text-lg sm:text-xl text-white/90 font-bold leading-relaxed max-w-xl">
                  Baca tips, trik, dan rahasia cepat fasih bahasa Inggris dari
                  para ahli bahasa.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 mt-2">
                {[
                  ["Baru", "Update Rutin"],
                  ["Tips", "Grammar & Vocab"],
                  ["100%", "Gratis Akses"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border-4 border-[#7E22CE] bg-white text-[#7E22CE] px-5 py-3 shadow-[0_4px_0_#7E22CE] transform hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all cursor-default"
                  >
                    <div className="text-xl font-black leading-none mb-1">
                      {value}
                    </div>
                    <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.header>

          {/* ── Blog Grid ── */}
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-black text-gray-950 text-center">
              Daftar Artikel
            </h2>

            {blogs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 px-6 bg-white rounded-3xl border-4 border-b-8 border-gray-200 shadow-sm mt-4"
              >
                <EmptyBlogIcon />
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  Belum ada artikel
                </h2>
                <p className="text-sm font-bold text-gray-500 max-w-sm mx-auto">
                  Kami sedang menyiapkan materi seru untukmu. Mampir lagi nanti,
                  ya!
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4"
              >
                {blogs.map((blog, index) => (
                  <Link
                    key={blog.id}
                    href={`/blogs/${blog.slug}`}
                    className="group h-full block"
                  >
                    <div
                      className="h-full overflow-hidden border-4 border-b-[8px] border-gray-200 hover:border-[#9333EA]/70 rounded-3xl transition-all duration-200 active:translate-y-2 active:border-b-4 bg-white shadow-sm hover:shadow-xl duo-btn flex flex-col"
                      style={{ borderBottomColor: "#E5E7EB" }}
                    >
                      {/* Cover Image Placeholder or Real Image */}
                      {blog.coverImage ? (
                        <div className="relative w-full h-40 border-b-4 border-black/10">
                          <Image
                            src={blog.coverImage}
                            alt={blog.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-[#E9D5FF] to-[#D8B4FE] border-b-4 border-black/10 flex items-center justify-center">
                          <svg
                            className="w-16 h-16 text-[#A855F7] drop-shadow-sm"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <rect
                              x="3"
                              y="4"
                              width="14"
                              height="17"
                              rx="2.5"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <rect
                              x="7"
                              y="4"
                              width="14"
                              height="14"
                              rx="2"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              opacity="0.5"
                            />
                            <path
                              d="M6 9h8M6 12h8M6 15h5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      )}

                      <div className="p-5 flex flex-col flex-1 gap-2">
                        {/* Meta */}
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <CalendarIcon />
                            {new Date(blog.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                              },
                            )}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <AuthorIcon />
                            {blog.author?.name || "Admin"}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-black text-gray-900 line-clamp-2 group-hover:text-[#9333EA] transition-colors leading-snug">
                          {blog.title}
                        </h2>

                        {/* Excerpt */}
                        {blog.excerpt && (
                          <p className="text-xs font-bold text-gray-500 line-clamp-2 mt-1 mb-2">
                            {blog.excerpt}
                          </p>
                        )}

                        {/* Read More */}
                        <div className="flex items-center text-xs font-black text-[#9333EA] uppercase tracking-wider gap-1.5 mt-auto pt-3">
                          Baca Artikel
                          <ArrowIcon />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
