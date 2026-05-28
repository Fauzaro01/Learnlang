"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";
import FriendsList from "@/components/FriendsList";
import ArgaAIChat from "@/components/ArgaAIChat";
import { motion } from "framer-motion";

// ==================================================
// CUSTOM SVG ICONS — Handcrafted and premium
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

const ChatBubbleIllustration = () => (
  <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 80 80" fill="none">
    {/* Background shape */}
    <rect
      x="15"
      y="15"
      width="50"
      height="50"
      rx="16"
      fill="#818CF8"
      stroke="#312E81"
      strokeWidth="4"
    />
    {/* Tail */}
    <path
      d="M25 61l-10 10V61H25z"
      fill="#818CF8"
      stroke="#312E81"
      strokeWidth="4"
      strokeLinejoin="round"
    />
    {/* White panel inside */}
    <rect x="25" y="25" width="30" height="30" rx="8" fill="white" />
    {/* Dots */}
    <circle cx="33" cy="40" r="3" fill="#4F46E5" />
    <circle cx="40" cy="40" r="3" fill="#4F46E5" />
    <circle cx="47" cy="40" r="3" fill="#4F46E5" />
  </svg>
);

const EmptyChatIcon = () => (
  <svg
    className="w-20 h-20 mx-auto mb-4 drop-shadow-md"
    viewBox="0 0 80 80"
    fill="none"
  >
    <circle
      cx="40"
      cy="40"
      r="32"
      fill="#EEF2FF"
      stroke="#818CF8"
      strokeWidth="3"
    />
    <path
      d="M25 45c0-6 7-10 15-10s15 4 15 10-7 10-15 10c-2 0-4.5-.5-6-1.5L25 58l1.5-6.5c-1.5-1.5-1.5-3-1.5-6.5z"
      fill="white"
      stroke="#4F46E5"
      strokeWidth="2.5"
    />
    <circle cx="34" cy="45" r="2" fill="#4F46E5" />
    <circle cx="40" cy="45" r="2" fill="#4F46E5" />
    <circle cx="46" cy="45" r="2" fill="#4F46E5" />
  </svg>
);

// ==================================================

export default function ChatsClient({ initialUserId = null }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const ARGA_AI_ID = "__arga_ai__";
  const argaConversation = {
    friendId: ARGA_AI_ID,
    friend: {
      id: ARGA_AI_ID,
      name: "Arga AI",
      username: "arga_ai",
      avatar: null,
      isOnline: true,
      isTyping: false,
    },
    lastMessage: {
      content: "Siap bantu grammar, latihan, dan koreksi kalimatmu.",
      createdAt: new Date().toISOString(),
      senderId: ARGA_AI_ID,
    },
    unreadCount: 0,
  };

  useEffect(() => {
    if (session === null) {
      router.push("/login");
    }
  }, [session, router]);

  useEffect(() => {
    if (!session) return;
    loadConversations();
  }, [session, initialUserId]);

  useEffect(() => {
    if (!initialUserId) return;
    setSelectedFriendId(initialUserId);
  }, [initialUserId]);

  const loadConversations = async () => {
    try {
      const [friendsResponse, conversationsResponse] = await Promise.all([
        fetch("/api/friends?type=friends", { cache: "no-store" }),
        fetch("/api/chats/conversations", { cache: "no-store" }),
      ]);

      const friendsData = friendsResponse.ok
        ? await friendsResponse.json()
        : null;
      const conversationsData = conversationsResponse.ok
        ? await conversationsResponse.json()
        : null;

      const friends = (friendsData?.data?.users || []).map((user) => ({
        friendId: user.id,
        friend: user,
        lastMessage: null,
        unreadCount: 0,
      }));

      const conversationMap = new Map(
        (conversationsData?.data?.conversations || []).map((item) => [
          item.friendId,
          item,
        ]),
      );

      const merged = friends.map((friend) => {
        const match = conversationMap.get(friend.friendId);
        return match
          ? {
              ...friend,
              friend: {
                ...friend.friend,
                ...match.friend,
              },
              lastMessage: match.lastMessage,
              unreadCount: match.unreadCount,
            }
          : friend;
      });

      const conversationOnly = (conversationsData?.data?.conversations || [])
        .filter(
          (item) => !merged.some((friend) => friend.friendId === item.friendId),
        )
        .map((item) => ({
          friendId: item.friendId,
          friend: item.friend,
          lastMessage: item.lastMessage,
          unreadCount: item.unreadCount,
        }));

      const mapped = [argaConversation, ...merged, ...conversationOnly];

      setConversations(mapped);

      if (initialUserId) {
        setSelectedFriendId(initialUserId);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white relative w-full font-[family-name:var(--font-nunito)]">
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

      {/* Cloud Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="cloud-bg w-48 h-16 top-12 -left-12 shadow-sm animate-[bounce_4s_infinite]" />
        <div className="cloud-bg w-64 h-20 top-32 -right-16 shadow-sm animate-[bounce_5s_infinite]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6 relative z-10">
        {/* ── Hero Banner — Gamified ── */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#4F46E5] to-[#6366F1] p-8 sm:p-10 text-white shadow-xl border-4 border-b-8 border-[#312E81] relative"
        >
          <div className="flex flex-col gap-5 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-black text-white border-2 border-white/30 shadow-sm w-fit uppercase tracking-wider">
              💬 Obrolan Langsung
            </div>

            <div className="max-w-2xl flex items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 drop-shadow-md leading-tight">
                  Chit Chat!
                </h1>
                <p className="text-lg sm:text-xl text-white/90 font-bold leading-relaxed max-w-xl">
                  Diskusikan latihan harianmu, kirim pesan ke teman, atau buka
                  Arga AI untuk latihan dan koreksi instan.
                </p>
              </div>
              <div className="hidden sm:block">
                <ChatBubbleIllustration />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-2">
              {[
                ["Arga AI", "Asisten Pribadimu"],
                ["Personal", "Pesan Pribadi"],
                ["Aman", "100% Terenkripsi"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border-4 border-[#312E81] bg-white text-[#312E81] px-5 py-3 shadow-[0_4px_0_#312E81] transform hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all cursor-default"
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

        {/* ── Main Chat Interface with Chunky Border ── */}
        <div className="flex min-h-0 h-[600px] bg-white flex-col md:flex-row border-4 border-b-8 border-gray-200 rounded-[32px] overflow-hidden shadow-xl relative z-10">
          {/* Mobile responsive toggle header */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b-4 border-gray-200 bg-white">
            <h2 className="text-lg font-black text-gray-900">Pesan Masuk</h2>
            <button
              className="px-4 py-2 text-xs font-black text-indigo-600 bg-indigo-50 border-2 border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors"
              onClick={() => setIsSidebarOpen((s) => !s)}
            >
              {isSidebarOpen ? "Tutup Teman" : "Daftar Teman"}
            </button>
          </div>

          {/* Left panel: Friends / Conversations */}
          <div
            className={`${isSidebarOpen ? "block" : "hidden"} min-h-0 w-full md:w-80 border-r-4 border-gray-200 bg-white overflow-hidden md:block`}
          >
            <FriendsList
              conversations={conversations}
              selectedFriendId={selectedFriendId}
              onSelectFriend={(id) => {
                setSelectedFriendId(id);
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  setIsSidebarOpen(false);
                }
              }}
              isLoading={isLoading}
              onConversationsUpdate={setConversations}
            />
          </div>

          {/* Right panel: Active Chat Window */}
          <div
            className={`${isSidebarOpen ? "hidden md:block" : "block"} min-h-0 flex-1 bg-gray-50/50 overflow-hidden`}
          >
            {selectedFriendId === ARGA_AI_ID ? (
              <ArgaAIChat />
            ) : selectedFriendId ? (
              <ChatWindow
                friendId={selectedFriendId}
                friend={
                  conversations.find((c) => c.friendId === selectedFriendId)
                    ?.friend
                }
                onMessageSent={() => loadConversations()}
                onOpenSidebar={() => setIsSidebarOpen(true)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center p-8 max-w-sm">
                  <EmptyChatIcon />
                  <p className="text-xl font-black text-gray-900 mb-2">
                    Pilih Teman Belajar
                  </p>
                  <p className="text-sm font-bold text-gray-400">
                    Mulai obrolan seru untuk mempraktikkan kosakata barumu hari
                    ini!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
