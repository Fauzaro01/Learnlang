"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import UserAvatar from "@/components/UserAvatar";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

// ─── Helpers ────────────────────────────────────────────────

const getStatusBadge = (status) => {
  const map = {
    BENAR: "bg-emerald-100 text-emerald-700 border-2 border-emerald-300",
    HAMPIR_BENAR: "bg-amber-100 text-amber-700 border-2 border-amber-300",
    SALAH: "bg-red-100 text-red-700 border-2 border-red-300",
  };
  const label = {
    BENAR: "Benar",
    HAMPIR_BENAR: "Hampir Benar",
    SALAH: "Salah",
  };
  if (!map[status]) return null;
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[11px] font-black ${map[status]}`}
    >
      {label[status]}
    </span>
  );
};

const getDifficultyBadge = (difficulty) => {
  const map = {
    EASY: "bg-emerald-50 text-emerald-600 border-2 border-emerald-200",
    MEDIUM: "bg-amber-50 text-amber-600 border-2 border-amber-200",
    HARD: "bg-red-50 text-red-600 border-2 border-red-200",
  };
  const label = { EASY: "Mudah", MEDIUM: "Sedang", HARD: "Sulit" };
  if (!map[difficulty]) return null;
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[11px] font-black ${map[difficulty]}`}
    >
      {label[difficulty]}
    </span>
  );
};

const getAchievementStyle = (badgeColor) => {
  const map = {
    green: "bg-emerald-50 border-emerald-300 text-emerald-700",
    yellow: "bg-yellow-50 border-yellow-300 text-yellow-700",
    orange: "bg-orange-50 border-orange-300 text-orange-700",
    red: "bg-red-50 border-red-300 text-red-700",
    purple: "bg-purple-50 border-purple-300 text-purple-700",
    pink: "bg-pink-50 border-pink-300 text-pink-700",
    cyan: "bg-cyan-50 border-cyan-300 text-cyan-700",
    emerald: "bg-emerald-50 border-emerald-300 text-emerald-700",
    gold: "bg-amber-50 border-amber-300 text-amber-700",
  };
  return map[badgeColor] || "bg-blue-50 border-blue-300 text-blue-700";
};

const getActivityStyle = (method) => {
  if (!method) return { icon: "solar:book-open-bold", bg: "bg-indigo-100", text: "text-indigo-500" };
  const m = method.toLowerCase();
  if (m.includes("vocab")) return { icon: "fluent-emoji:books", bg: "bg-indigo-100", text: "text-indigo-500" };
  if (m.includes("listen")) return { icon: "fluent-emoji:headphone", bg: "bg-blue-100", text: "text-blue-500" };
  if (m.includes("grammar")) return { icon: "fluent-emoji:pencil", bg: "bg-amber-100", text: "text-amber-500" };
  return { icon: "solar:book-open-bold", bg: "bg-indigo-100", text: "text-indigo-500" };
};

// ─── Stat Card ───────────────────────────────────────────────

function StatCard({
  icon,
  iconClass,
  value,
  label,
  delay,
  bgClass,
  valueClass,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-3xl border-4 border-b-[6px] border-gray-200 ${bgClass} p-4 flex flex-col items-center shadow-sm hover:-translate-y-1 transition-transform`}
    >
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-2 bg-white/60">
        <Icon icon={icon} className={`text-2xl ${iconClass}`} />
      </div>
      <p className={`text-3xl font-black ${valueClass}`}>{value}</p>
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-0.5 text-center">
        {label}
      </p>
    </motion.div>
  );
}

// ─── Section Card ────────────────────────────────────────────

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-3xl border-4 border-b-[6px] border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b-2 border-gray-100">
        <Icon icon={icon} className="text-xl text-indigo-500" />
        <h2 className="font-black text-gray-900 text-sm">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export default function PublicProfilePage() {
  const params = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${params.username}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else if (response.status === 404) {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  }, [params.username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const copyProfileUrl = async () => {
    const url = `${window.location.origin}/user/${user?.username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link profil berhasil disalin!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin link profil");
    }
  };

  const shareProfile = async () => {
    const url = `${window.location.origin}/user/${user?.username}`;
    const shareData = {
      title: `${user?.name} - LernLang`,
      text: `Lihat progress belajar bahasa Inggris ${user?.name} di LernLang!`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") copyProfileUrl();
      }
    } else {
      copyProfileUrl();
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon
            icon="svg-spinners:ring-resize"
            className="text-5xl text-indigo-500"
          />
          <p className="font-black text-indigo-500 animate-pulse">
            Memuat profil...
          </p>
        </div>
      </div>
    );
  }

  // ── Not Found ──
  if (notFound) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border-4 border-b-[6px] border-gray-200 p-10 text-center max-w-sm w-full shadow-sm">
          <Icon
            icon="fluent-emoji:pensive-face"
            className="text-7xl mx-auto mb-4"
          />
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            Pengguna Tidak Ditemukan
          </h1>
          <p className="text-gray-500 font-bold text-sm mb-6">
            Username &quot;{params.username}&quot; tidak ditemukan atau belum
            terdaftar.
          </p>
          <Link href="/">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-2xl border-b-4 border-indigo-700 transition-all hover:-translate-y-0.5 active:translate-y-1 active:border-b-0">
              <Icon icon="solar:arrow-left-bold" />
              Kembali ke Beranda
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const accuracy = user?.stats?.accuracy ?? 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[family-name:var(--font-nunito)]">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* ── Profile Header ── */}
          <div className="bg-white rounded-3xl border-4 border-b-[6px] border-gray-200 shadow-sm overflow-hidden">
            {/* Cover Banner */}
            <div className="relative h-28 sm:h-36 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
            </div>

            <div className="px-5 sm:px-8 pb-6 relative">
              {/* Avatar */}
              <div className="-mt-14 sm:-mt-16 mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <UserAvatar
                    src={user?.avatar}
                    name={user?.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-white shadow-lg ring-4 ring-indigo-100"
                    size={112}
                  />
                </motion.div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 sm:mb-2">
                  <button
                    onClick={copyProfileUrl}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border-4 border-b-[5px] border-gray-200 bg-white text-gray-700 font-black text-sm hover:-translate-y-0.5 active:translate-y-1 active:border-b-0 transition-all"
                  >
                    <Icon
                      icon={
                        copied ? "solar:check-circle-bold" : "solar:copy-bold"
                      }
                      className={copied ? "text-emerald-500" : "text-gray-500"}
                    />
                    {copied ? "Tersalin" : "Salin Link"}
                  </button>
                  <button
                    onClick={shareProfile}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border-4 border-b-[5px] border-indigo-700 bg-indigo-500 text-white font-black text-sm hover:-translate-y-0.5 active:translate-y-1 active:border-b-0 transition-all"
                  >
                    <Icon icon="solar:share-bold" />
                    Bagikan
                  </button>
                </div>
              </div>

              {/* Name & Info */}
              <div className="space-y-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                    {user?.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-gray-500 font-bold">
                      @{user?.username}
                    </span>
                    {user?.viewerRelationship?.isFriend && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 border-2 border-emerald-300">
                        🤝 Teman
                      </span>
                    )}
                    {!user?.viewerRelationship?.isFriend &&
                      user?.viewerRelationship?.isFollowing && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-700 border-2 border-indigo-300">
                          Mengikuti
                        </span>
                      )}
                  </div>
                </div>

                {user?.bio && (
                  <p className="text-gray-600 font-bold text-sm max-w-2xl">
                    {user.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Icon
                      icon="solar:calendar-bold"
                      className="text-indigo-400"
                    />
                    Bergabung{" "}
                    {user?.createdAt &&
                      formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                        locale: idLocale,
                      })}
                  </span>
                </div>

                {/* Social Counts */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { val: user?.followersCount || 0, label: "Pengikut" },
                    { val: user?.followingCount || 0, label: "Mengikuti" },
                    { val: user?.friendshipCount || 0, label: "Teman" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border-3 border-b-4 border-gray-200 bg-white px-3 py-1.5 text-center shadow-sm"
                    >
                      <div className="text-base font-black text-indigo-600">
                        {item.val}
                      </div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Button */}
                {user?.viewerRelationship?.isFriend && (
                  <div className="pt-1">
                    <Link href={`/chats?userId=${user?.id}`}>
                      <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-2xl border-b-4 border-indigo-700 transition-all hover:-translate-y-0.5 active:translate-y-1 active:border-b-0 text-sm">
                        <Icon icon="solar:chat-round-bold" />
                        Chat Teman
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Stats Grid ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              icon="solar:target-bold"
              iconClass="text-indigo-500"
              value={user?.stats?.totalExercises || 0}
              label="Total Latihan"
              delay={0.1}
              bgClass="bg-[#EEF2FF]"
              valueClass="text-indigo-600"
            />
            <StatCard
              icon="solar:check-circle-bold"
              iconClass="text-emerald-500"
              value={
                user?.stats?.totalCorrectAnswers ??
                user?.stats?.correctCount ??
                0
              }
              label="Jawaban Benar"
              delay={0.2}
              bgClass="bg-[#F0FDF4]"
              valueClass="text-emerald-600"
            />
            <StatCard
              icon="solar:cup-star-bold"
              iconClass="text-amber-500"
              value={user?.stats?.averageScore || 0}
              label="Skor Rata-rata"
              delay={0.3}
              bgClass="bg-amber-50"
              valueClass="text-amber-600"
            />
            <StatCard
              icon="solar:chart-2-bold"
              iconClass="text-violet-500"
              value={`${accuracy}%`}
              label="Akurasi"
              delay={0.4}
              bgClass="bg-violet-50"
              valueClass="text-violet-600"
            />
          </div>

          {/* ── Main Content Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Difficulty Breakdown */}
            <SectionCard title="Tingkat Kesulitan" icon="solar:bolt-bold">
              <div className="space-y-4">
                {[
                  {
                    key: "EASY",
                    label: "Mudah",
                    bar: "bg-emerald-500",
                    track: "bg-emerald-100",
                  },
                  {
                    key: "MEDIUM",
                    label: "Sedang",
                    bar: "bg-amber-500",
                    track: "bg-amber-100",
                  },
                  {
                    key: "HARD",
                    label: "Sulit",
                    bar: "bg-red-500",
                    track: "bg-red-100",
                  },
                ].map((diff) => {
                  const count =
                    user?.stats?.difficultyBreakdown?.[diff.key] || 0;
                  const total = user?.stats?.totalExercises || 1;
                  const percent = Math.round((count / total) * 100);
                  return (
                    <div key={diff.key}>
                      <div className="flex justify-between text-sm font-bold mb-1.5">
                        <span className="text-gray-700">{diff.label}</span>
                        <span className="text-gray-500">
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div className={`h-3 rounded-full ${diff.track}`}>
                        <div
                          className={`h-full rounded-full ${diff.bar} transition-all duration-700`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* Learning Methods */}
            <SectionCard title="Metode Belajar" icon="solar:book-2-bold">
              <div className="space-y-3">
                {[
                  {
                    key: "vocabulary",
                    label: "Vocabulary",
                    icon: "fluent-emoji:books",
                    bg: "bg-indigo-50",
                    text: "text-indigo-600",
                  },
                  {
                    key: "listening",
                    label: "Listening",
                    icon: "fluent-emoji:headphone",
                    bg: "bg-blue-50",
                    text: "text-blue-600",
                  },
                  {
                    key: "grammar",
                    label: "Grammar",
                    icon: "fluent-emoji:pencil",
                    bg: "bg-amber-50",
                    text: "text-amber-600",
                  },
                ].map((method) => {
                  const count = user?.stats?.methodBreakdown?.[method.key] || 0;
                  return (
                    <div
                      key={method.key}
                      className={`flex items-center justify-between p-3 ${method.bg} rounded-2xl border-2 border-b-4 border-gray-100`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon icon={method.icon} className="text-2xl" />
                        <span className="font-black text-sm text-gray-700">
                          {method.label}
                        </span>
                      </div>
                      <span className={`font-black text-base ${method.text}`}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* Achievements */}
            <SectionCard
              title="Pencapaian"
              icon="solar:medal-ribbons-star-bold"
            >
              {user?.achievementSummary ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        val: user.achievementSummary.count || 0,
                        label: "Terbuka",
                        bg: "bg-[#EEF2FF]",
                        text: "text-indigo-600",
                      },
                      {
                        val: user.achievementSummary.totalPoints || 0,
                        label: "Poin",
                        bg: "bg-amber-50",
                        text: "text-amber-600",
                      },
                      {
                        val: `${user.achievementSummary.percentage || 0}%`,
                        label: "Progres",
                        bg: "bg-[#F0FDF4]",
                        text: "text-emerald-600",
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className={`rounded-2xl border-2 border-b-4 border-gray-100 ${s.bg} p-2 text-center`}
                      >
                        <p className={`text-lg font-black ${s.text}`}>
                          {s.val}
                        </p>
                        <p className="text-[10px] font-bold text-gray-500">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                      <span>Progres</span>
                      <span>
                        {user.achievementSummary.unlocked || 0}/
                        {user.achievementSummary.total || 0}
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-700"
                        style={{
                          width: `${user.achievementSummary.percentage || 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Unlocked */}
                  {user.achievements?.length > 0 && (
                    <div>
                      <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                        Dicapai ({user.achievements.length})
                      </p>
                      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                        {user.achievements.map((ach) => (
                          <div
                            key={ach.type}
                            className={`rounded-2xl border-2 border-b-4 p-2.5 text-xs ${getAchievementStyle(ach.badgeColor)}`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-base leading-none">
                                {ach.icon || "🎯"}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                  <p className="font-black truncate">
                                    {ach.title}
                                  </p>
                                  <span className="ml-auto shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-white/60">
                                    +{ach.points}
                                  </span>
                                </div>
                                <p className="mt-0.5 line-clamp-2 text-[11px] opacity-80">
                                  {ach.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Achievements */}
                  {user.achievementSummary.nextAchievements?.length > 0 && (
                    <div className="border-t-2 border-gray-100 pt-3">
                      <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                        Berikutnya
                      </p>
                      {user.achievementSummary.nextAchievements
                        .slice(0, 2)
                        .map((ach) => (
                          <div
                            key={ach.type}
                            className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 opacity-60 mb-1.5"
                          >
                            <span>{ach.icon || "🎯"}</span>
                            <span className="font-black text-xs truncate text-gray-600">
                              {ach.title}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Icon
                    icon="solar:medal-ribbons-star-linear"
                    className="text-4xl text-gray-300 mx-auto mb-2"
                  />
                  <p className="text-sm font-bold text-gray-400">
                    Belum ada data pencapaian
                  </p>
                </div>
              )}
            </SectionCard>

            {/* Recent Activity */}
            <div className="lg:col-span-3">
              <SectionCard title="Aktivitas Terbaru" icon="solar:history-bold">
                {!user?.recentActivity || user.recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon
                      icon="solar:clipboard-list-linear"
                      className="text-5xl text-gray-300 mx-auto mb-2"
                    />
                    <p className="text-sm font-bold text-gray-400">
                      Belum ada aktivitas
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {user.recentActivity.map((activity, idx) => {
                      const style = getActivityStyle(activity.methodLabel || activity.method);
                      return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border-2 border-b-4 border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${style.bg} flex items-center justify-center shrink-0`}>
                            <Icon
                              icon={style.icon}
                              className={`${style.text} text-lg`}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-800">
                              {activity.methodLabel ||
                                activity.method ||
                                "Sesi Belajar"}
                            </p>
                            <p className="text-[11px] font-bold text-gray-400">
                              {activity.level
                                ? `Level ${activity.level}`
                                : "Learning Session"}{" "}
                              •{" "}
                              {format(
                                new Date(activity.createdAt),
                                "dd MMM yyyy",
                                { locale: idLocale },
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-indigo-100 text-indigo-700 border-2 border-indigo-300">
                            {activity.score}/{activity.total}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-700 border-2 border-emerald-300">
                              {activity.accuracy}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                )}
              </SectionCard>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t-4 border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-gray-400">
            © {new Date().getFullYear()} LernLang. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
