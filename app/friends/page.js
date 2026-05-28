"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import UserAvatar from "@/components/UserAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  buildFollowingIdSet,
  syncFollowStateAcrossCollections,
  removeUserFromRecommendations,
} from "@/lib/friends-utils";
import { motion } from "framer-motion";

// ==================================================
// CUSTOM SVG ICONS — hand-drawn game style
// ==================================================

const SparkleIcon = () => (
  <svg
    className="w-4 h-4 text-yellow-300 animate-pulse"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M8 0L9.5 5.5L15 7L9.5 8.5L8 14L6.5 8.5L1 7L6.5 5.5L8 0Z"
      fill="currentColor"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="w-5 h-5 text-gray-500"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const HeartFilledIcon = () => (
  <svg
    className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-bounce"
    viewBox="0 0 24 24"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const MailIcon = () => (
  <svg
    className="w-4 h-4 text-[#14B8A6]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const FriendsBadgeIllustration = () => (
  <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 80 80" fill="none">
    {/* Head 1 */}
    <circle
      cx="28"
      cy="35"
      r="12"
      fill="#E2E8F0"
      stroke="#0F766E"
      strokeWidth="3.5"
    />
    {/* Body 1 */}
    <path
      d="M12 58c0-8 6-12 16-12s16 4 16 12v3H12v-3z"
      fill="#0D9488"
      stroke="#0F766E"
      strokeWidth="3.5"
    />
    {/* Head 2 */}
    <circle
      cx="52"
      cy="35"
      r="12"
      fill="#E2E8F0"
      stroke="#0F766E"
      strokeWidth="3.5"
    />
    {/* Body 2 */}
    <path
      d="M36 58c0-8 6-12 16-12s16 4 16 12v3H36v-3z"
      fill="#2DD4BF"
      stroke="#0F766E"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    {/* Sparkle */}
    <path
      d="M40 18l1.5 3 3 .5-2 2 .5 3-3-2-3 2 .5-3-2-2 3-.5 1.5-3z"
      fill="#F59E0B"
    />
  </svg>
);

const EmptyInboxIcon = () => (
  <svg
    className="w-20 h-20 mx-auto mb-4 drop-shadow-md"
    viewBox="0 0 80 80"
    fill="none"
  >
    <rect
      x="15"
      y="20"
      width="50"
      height="40"
      rx="8"
      fill="#F0FDF4"
      stroke="#10B981"
      strokeWidth="3"
    />
    <path
      d="M15 28l25 15 25-15"
      stroke="#10B981"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="40" cy="50" r="8" fill="#E8F5E9" />
  </svg>
);

const LoaderIcon = () => (
  <svg
    className="w-4 h-4 animate-spin text-white"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

// ==================================================

export default function FriendsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [followingIds, setFollowingIds] = useState(new Set());
  const [actionLoadingUserId, setActionLoadingUserId] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load friends
  useEffect(() => {
    if (activeTab === "friends" && session) {
      loadFriends();
    }
  }, [activeTab, session]);

  // Load recommendations
  useEffect(() => {
    if (activeTab === "recommendations" && session) {
      loadRecommendations();
    }
  }, [activeTab, session]);

  // Load followers
  useEffect(() => {
    if (activeTab === "followers" && session) {
      loadFollowers();
    }
  }, [activeTab, session]);

  // Load following
  useEffect(() => {
    if (activeTab === "following" && session) {
      loadFollowing();
    }
  }, [activeTab, session]);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/friends?type=friends", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to load friends");
      const data = await response.json();
      setFriends(data.data.users);
      updateFollowingIds(data.data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/friends/recommendations", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to load recommendations");
      const data = await response.json();
      setRecommendations(data.data.recommendations);
      updateFollowingIds(data.data.recommendations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/friends?type=followers", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to load followers");
      const data = await response.json();
      setFollowers(data.data.users);
      updateFollowingIds(data.data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowing = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/friends?type=following", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to load following");
      const data = await response.json();
      setFollowing(data.data.users);
      updateFollowingIds(data.data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.length < 2) {
      setError("Masukkan minimal 2 karakter pencarian");
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);
    try {
      const response = await fetch(
        `/api/friends?type=search&q=${encodeURIComponent(searchQuery)}`,
        { cache: "no-store" },
      );
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setSearchResults(data.data.users);
      setActiveTab("search");
      updateFollowingIds(data.data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFollowingIds = (users) => {
    setFollowingIds(buildFollowingIdSet(users));
  };

  const syncFollowStateAcrossLists = (userId, isFollowing) => {
    const synced = syncFollowStateAcrossCollections(
      {
        searchResults,
        recommendations,
        followers,
        following,
        friends,
      },
      userId,
      isFollowing,
    );

    setSearchResults(synced.searchResults);
    setRecommendations(synced.recommendations);
    setFollowers(synced.followers);
    setFollowing(synced.following);
    setFriends(synced.friends);
  };

  const handleFollow = async (userId) => {
    setActionLoadingUserId(userId);
    setError("");
    try {
      const response = await fetch("/api/friends/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId: userId }),
      });

      if (!response.ok) {
        throw new Error("Failed follow user");
      }
      const data = await response.json();

      // Update local state immediately for responsive UI
      setFollowingIds((prev) => new Set([...prev, userId]));
      syncFollowStateAcrossLists(userId, true);

      // Immediately remove from recommendations local state for instant feedback
      setRecommendations((prev) => removeUserFromRecommendations(prev, userId));

      if (activeTab === "following") {
        void loadFollowing();
      }

      if (data?.data?.isFriend || activeTab === "friends") {
        void loadFriends();
      }

      toast.success(
        data?.data?.message ||
          (data?.data?.isFriend
            ? "Sekarang kalian berteman!"
            : "Berhasil mengikuti pengguna"),
      );
    } catch (err) {
      setError(err.message);
      toast.error("Failed follow user");
    } finally {
      setActionLoadingUserId(null);
    }
  };

  const handleUnfollow = async (userId) => {
    setActionLoadingUserId(userId);
    setError("");
    try {
      const response = await fetch(
        `/api/friends/unfollow?followingId=${userId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed unfollow user");
      }

      // Update local state immediately for responsive UI
      setFollowingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      syncFollowStateAcrossLists(userId, false);

      if (activeTab === "following") {
        void loadFollowing();
      }

      if (activeTab === "friends") {
        void loadFriends();
      }

      toast.success("Berhasil berhenti mengikuti pengguna");
    } catch (err) {
      setError(err.message);
      toast.error("Failed unfollow user");
    } finally {
      setActionLoadingUserId(null);
    }
  };

  const FriendCard = ({ user, isFriend }) => (
    <Card
      className="border-4 border-b-8 border-gray-200 rounded-3xl overflow-hidden hover:border-[#14B8A6]/70 transition-all duration-200 bg-white"
      style={{ borderBottomColor: "#E5E7EB" }}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <UserAvatar
            src={user.avatar}
            name={user.name}
            className="w-14 h-14"
            size={44}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-black text-gray-950 text-base truncate">
                {user.name}
              </h3>
              {isFriend && (
                <span className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-2.5 py-1 text-[10px] font-black uppercase text-red-600 border border-red-200">
                  <HeartFilledIcon />
                  Teman
                </span>
              )}
            </div>
            {user.username && (
              <p className="text-xs font-bold text-gray-400 mb-2">
                @{user.username}
              </p>
            )}
            {user.bio && (
              <p className="text-xs font-bold text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                {user.bio}
              </p>
            )}

            <div className="flex gap-2 flex-col sm:flex-row mt-1">
              {isFriend && (
                <Link
                  href={`/chats?userId=${user.id}`}
                  className="w-full sm:w-1/2"
                >
                  <button className="w-full py-2 bg-indigo-50 border-2 border-indigo-200 text-[#4F46E5] hover:bg-indigo-100 rounded-2xl font-black text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                    💬 Chat
                  </button>
                </Link>
              )}

              <button
                onClick={() =>
                  followingIds.has(user.id)
                    ? handleUnfollow(user.id)
                    : handleFollow(user.id)
                }
                className={`py-2 px-4 rounded-2xl font-black text-xs transition-all duration-100 flex items-center justify-center gap-1.5 shadow-sm ${
                  followingIds.has(user.id)
                    ? "bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
                    : "bg-[#14B8A6] hover:bg-[#2DD4BF] text-white border-b-4 border-[#0D9488]"
                } ${isFriend ? "w-full sm:w-1/2" : "w-full"}`}
                disabled={actionLoadingUserId === user.id}
              >
                {actionLoadingUserId === user.id ? (
                  <>
                    <LoaderIcon />
                    Memproses...
                  </>
                ) : followingIds.has(user.id) ? (
                  "Batal Ikuti"
                ) : (
                  "Ikuti"
                )}
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ title, description, actionLabel, onAction }) => (
    <Card className="border-4 border-b-8 border-gray-200 rounded-3xl p-8 bg-white text-center shadow-sm">
      <CardContent className="py-6 flex flex-col items-center">
        <EmptyInboxIcon />
        <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
        <p className="text-sm font-bold text-gray-500 mb-6 max-w-xs">
          {description}
        </p>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-5 py-3.5 bg-[#14B8A6] hover:bg-[#2DD4BF] text-white border-b-4 border-[#0D9488] rounded-2xl font-black text-sm duo-btn flex items-center justify-center gap-2 shadow-sm"
          >
            {actionLabel}
          </button>
        )}
      </CardContent>
    </Card>
  );

  const LoadingCard = () => (
    <Card className="border-4 border-gray-200 rounded-3xl p-6 bg-white shadow-sm">
      <CardContent className="pt-0">
        <div className="flex gap-4">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-5 w-36 mb-2 rounded-xl" />
            <Skeleton className="h-4 w-24 mb-3 rounded-xl" />
            <Skeleton className="h-10 w-full rounded-2xl" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg font-black text-[#14B8A6] animate-pulse">
          Memuat Pengguna...
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .cloud-bg {
          position: absolute;
          background: white;
          border-radius: 999px;
          opacity: 0.7;
          border: 3px solid #E2E8F0;
        }
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
      `,
        }}
      />

      <div className="min-h-[calc(100vh-4rem)] bg-white relative w-full font-[family-name:var(--font-nunito)]">
        {/* Cloud Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="cloud-bg w-48 h-16 top-12 -left-12 shadow-sm animate-[bounce_4s_infinite]" />
          <div className="cloud-bg w-64 h-20 top-32 -right-16 shadow-sm animate-[bounce_5s_infinite]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8 relative z-10">
          {/* ── Hero Banner — Gamified ── */}
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#0D9488] to-[#14B8A6] p-8 sm:p-10 text-white shadow-xl border-4 border-b-8 border-[#0F766E] relative"
          >
            <div className="flex flex-col gap-5 relative z-10">
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-black text-white border-2 border-white/30 shadow-sm w-fit uppercase tracking-wider">
                👥 Temukan Komunitas
              </div>

              <div className="max-w-2xl flex items-center justify-between gap-6">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 drop-shadow-md leading-tight">
                    Cari Teman Belajar!
                  </h1>
                  <p className="text-lg sm:text-xl text-white/90 font-bold leading-relaxed max-w-xl">
                    Temukan rekan belajar bahasa Inggris di seluruh Indonesia,
                    ikuti aktivitas mereka, dan berlombalah menjadi nomor satu!
                  </p>
                </div>
                <div className="hidden sm:block">
                  <FriendsBadgeIllustration />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-2">
                {[
                  ["Teman", "Belajar Bareng"],
                  ["Inbox", "Request Masuk"],
                  ["Koneksi", "100% Interaktif"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border-4 border-[#0F766E] bg-white text-[#0F766E] px-5 py-3 shadow-[0_4px_0_#0F766E] transform hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all cursor-default"
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
          </motion.section>

          {/* ── Inbox / Actions Header ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-3xl font-black text-gray-950 flex items-center gap-3">
              Cari Teman Baru
            </h2>
      
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              variant="destructive"
              className="rounded-2xl border-2 border-red-200 bg-red-50 text-red-700"
            >
              <AlertDescription className="font-bold">{error}</AlertDescription>
            </Alert>
          )}

          {/* ── Sticky search & Tabs selection ── */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-4">
              {/* Search Card Container */}
              <Card className="border-4 border-gray-200 rounded-3xl overflow-hidden bg-white shadow-sm">
                <CardContent className="p-4">
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                      placeholder="Cari nama lengkap atau @username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 rounded-2xl border-2 border-gray-200 px-4 py-3 font-bold text-gray-900"
                    />
                    <button
                      type="submit"
                      disabled={loading || searchQuery.length < 2}
                      className="p-3 bg-[#14B8A6] hover:bg-[#2DD4BF] text-white rounded-2xl font-black text-sm flex items-center justify-center border-b-4 border-[#0D9488]"
                    >
                      <SearchIcon />
                    </button>
                  </form>
                </CardContent>
              </Card>

              {/* Tabs selection header */}
              <div className="overflow-x-auto pb-1">
                <TabsList className="inline-flex w-max min-w-full gap-2 p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
                  {[
                    ["search", "Cari"],
                    ["recommendations", "Rekomendasi"],
                    ["friends", "Teman"],
                    ["followers", "Pengikut"],
                    ["following", "Mengikuti"],
                  ].map(([val, label]) => (
                    <TabsTrigger
                      key={val}
                      value={val}
                      className="px-5 py-2.5 rounded-xl text-sm font-black text-gray-500 transition-all data-[state=active]:bg-[#14B8A6] data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            {/* Contents tab views */}
            <div className="grid gap-6">
              {/* Search view */}
              <TabsContent
                value="search"
                className="mt-0 outline-none flex flex-col gap-4"
              >
                {loading ? (
                  <div className="grid gap-4">
                    {[...Array(3)].map((_, i) => (
                      <LoadingCard key={i} />
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid gap-4">
                    {searchResults.map((user) => (
                      <FriendCard
                        key={user.id}
                        user={user}
                        isFriend={user.isFriend}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title={hasSearched ? "Tidak ada hasil" : "Cari teman baru"}
                    description={
                      hasSearched
                        ? "Coba gunakan kata kunci lain."
                        : "Ketik minimal 2 karakter di atas dan tekan enter untuk mulai mencari."
                    }
                    actionLabel="Lihat rekomendasi"
                    onAction={() => setActiveTab("recommendations")}
                  />
                )}
              </TabsContent>

              {/* Recommendations view */}
              <TabsContent
                value="recommendations"
                className="mt-0 outline-none flex flex-col gap-4"
              >
                {loading ? (
                  <div className="grid gap-4">
                    {[...Array(3)].map((_, i) => (
                      <LoadingCard key={i} />
                    ))}
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="grid gap-4">
                    {recommendations.map((user) => (
                      <FriendCard
                        key={user.id}
                        user={user}
                        isFriend={user.isFriend}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="Rekomendasi kosong"
                    description="Belum ada rekomendasi teman untukmu saat ini."
                    actionLabel="Cari manual"
                    onAction={() => setActiveTab("search")}
                  />
                )}
              </TabsContent>

              {/* Friends view */}
              <TabsContent
                value="friends"
                className="mt-0 outline-none flex flex-col gap-4"
              >
                {loading ? (
                  <div className="grid gap-4">
                    {[...Array(3)].map((_, i) => (
                      <LoadingCard key={i} />
                    ))}
                  </div>
                ) : friends.length > 0 ? (
                  <div className="grid gap-4">
                    {friends.map((user) => (
                      <FriendCard key={user.id} user={user} isFriend={true} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="Belum memiliki teman"
                    description="Mulai ikuti pengguna lain. Jika mereka mengikuti balik, kamu akan otomatis berteman!"
                    actionLabel="Temukan teman"
                    onAction={() => setActiveTab("recommendations")}
                  />
                )}
              </TabsContent>

              {/* Followers view */}
              <TabsContent
                value="followers"
                className="mt-0 outline-none flex flex-col gap-4"
              >
                {loading ? (
                  <div className="grid gap-4">
                    {[...Array(3)].map((_, i) => (
                      <LoadingCard key={i} />
                    ))}
                  </div>
                ) : followers.length > 0 ? (
                  <div className="grid gap-4">
                    {followers.map((user) => (
                      <FriendCard
                        key={user.id}
                        user={user}
                        isFriend={user.isFriend}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="Belum memiliki pengikut"
                    description="Ketika pengguna lain mulai mengikutimu, mereka akan tampil di sini."
                    actionLabel="Cari teman"
                    onAction={() => setActiveTab("search")}
                  />
                )}
              </TabsContent>

              {/* Following view */}
              <TabsContent
                value="following"
                className="mt-0 outline-none flex flex-col gap-4"
              >
                {loading ? (
                  <div className="grid gap-4">
                    {[...Array(3)].map((_, i) => (
                      <LoadingCard key={i} />
                    ))}
                  </div>
                ) : following.length > 0 ? (
                  <div className="grid gap-4">
                    {following.map((user) => (
                      <FriendCard
                        key={user.id}
                        user={user}
                        isFriend={user.isFriend}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="Belum mengikuti siapa pun"
                    description="Ikuti pengguna menarik lainnya untuk melihat aktivitas belajar mereka."
                    actionLabel="Temukan pengguna"
                    onAction={() => setActiveTab("recommendations")}
                  />
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
