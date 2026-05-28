"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSocket } from "@/lib/socket-provider";
import { Icon } from "@iconify/react";

// ============================================================
// CUSTOM SVG ICONS FOR NOTIFICATION TYPES
// ============================================================

const getNotificationIcon = (type) => {
  const iconProps = "w-5 h-5";
  
  switch (type) {
    case "FOLLOW":
    case "UNFOLLOW":
      return (
        <svg className={iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
          <circle cx="18" cy="9" r="3" fill="currentColor"/>
        </svg>
      );
    case "FRIEND_REQUEST":
      return (
        <svg className={iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 11h-6M20 14h-3"/>
        </svg>
      );
    case "FRIEND_REQUEST_ACCEPTED":
      return (
        <svg className={iconProps} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "FRIEND_ADDED":
      return (
        <svg className={iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 11a4 4 0 0 0-4-4h-2a4 4 0 0 0-4 4v2"/>
          <circle cx="15" cy="7" r="4"/>
        </svg>
      );
    case "BLOG_COMMENT":
      return (
        <svg className={iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <line x1="9" y1="10" x2="15" y2="10"/>
          <line x1="9" y1="14" x2="13" y2="14"/>
        </svg>
      );
    case "BLOG_COMMENT_REPLY":
      return (
        <svg className={iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 3h7a4 4 0 0 1 4 4v5h4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a2 2 0 0 0-2-2"/>
          <polyline points="15 6 9 12 15 18"/>
        </svg>
      );
    case "BLOG_REACTION":
      return (
        <svg className={iconProps} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      );
    case "BLOG_PUBLISHED":
      return (
        <svg className={iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="19" x2="12" y2="5"/>
          <line x1="9" y1="16" x2="15" y2="16"/>
        </svg>
      );
    case "QUIZ_CREATED":
      return (
        <svg className={iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
          <text x="11" y="14" textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold">?</text>
        </svg>
      );
    case "QUIZ_SHARED":
      return (
        <svg className={iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      );
    case "QUIZ_RESULT":
      return (
        <svg className={iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 12l2 2 4-4"/>
        </svg>
      );
    case "LESSON_COMPLETED":
      return (
        <svg className={iconProps} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
          <path d="M6 9H4.5A1.5 1.5 0 0 1 3 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3"/>
          <path d="M18 9h1.5A1.5 1.5 0 0 0 21 7.5V6a1.5 1.5 0 0 0-1.5-1.5h-3"/>
          <path d="M8 3h8v8a4 4 0 0 1-8 0V3z"/>
          <path d="M12 15v4M9 19h6"/>
        </svg>
      );
    case "MESSAGE_RECEIVED":
      return (
        <svg className={iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="M2 4l10 8 10-8"/>
        </svg>
      );
    case "GROUP_MESSAGE":
      return (
        <svg className={iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 4h20V2H2v2zm0 5h20v-2H2v2zm0 5h20v-2H2v2z"/>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4v-4H3a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5z"/>
        </svg>
      );
    case "ROOM_MESSAGE":
      return (
        <svg className={iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4v-4H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <circle cx="9" cy="10" r="1"/>
          <circle cx="12" cy="10" r="1"/>
          <circle cx="15" cy="10" r="1"/>
        </svg>
      );
    case "ROOM_CREATED":
      return (
        <svg className={iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      );
    case "ANNOUNCEMENT":
      return (
        <svg className={iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12c0-1.657.895-3.095 2.236-3.882"/>
          <path d="M20 12c0 1.657-.895 3.095-2.236 3.882"/>
          <rect x="5" y="8" width="14" height="8" rx="2"/>
          <line x1="12" y1="12" x2="12" y2="12.01"/>
        </svg>
      );
    default:
      return (
        <svg className={iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      );
  }
};

// Bell icon via Iconify
const NotificationBellIcon = ({ hasUnread }) => (
  <Icon
    icon={hasUnread ? "solar:bell-bing-bold-duotone" : "solar:bell-bold-duotone"}
    className="h-5 w-5"
  />
);


export default function NotificationBell() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  // Load initial notifications
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        // Take latest 5
        const latest5 = (data.data.notifications || []).slice(0, 5);
        setNotifications(latest5);
        const unread = (data.data.notifications || []).filter(
          (n) => !n.isRead,
        ).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Listen for realtime notifications
  useEffect(() => {
    if (!socket) return;
    const handler = (payload) => {
      // Prepend new notification to list
      setNotifications((prev) => {
        const updated = [payload, ...prev];
        // Keep only 5
        return updated.slice(0, 5);
      });
      setUnreadCount((prev) => prev + 1);
    };
    socket.on("notification", handler);
    return () => {
      socket.off("notification", handler);
    };
  }, [socket]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHours < 24) return `${diffHours}h lalu`;
    if (diffDays < 7) return `${diffDays}d lalu`;
    return date.toLocaleDateString("id-ID");
  };

  const handleBellClick = async () => {
    setIsOpen((prev) => !prev);

    if (unreadCount <= 0 || isMarkingRead) return;

    // Optimistic UI: bell click acts like "mark all as read"
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      setIsMarkingRead(true);
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    } finally {
      setIsMarkingRead(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-700 hover:text-primary transition-colors z-[60]"
      >
        <NotificationBellIcon hasUnread={unreadCount > 0} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-amber-600 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Close dropdown on outside click */}
      {isOpen && (
        <div className="fixed inset-0 z-[55]" onClick={() => setIsOpen(false)} />
      )}

      {/* Notification Dropdown - fixed on mobile, absolute on desktop */}
      {isOpen && (
        <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-80 bg-white rounded-2xl sm:rounded-lg shadow-2xl sm:shadow-lg border-2 sm:border border-gray-200 z-[60]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifikasi</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="sm:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                Memuat notifikasi...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                Tidak ada notifikasi
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    !notif.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 text-xl">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                        )}
                      </div>
                      {notif.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notif.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 text-center">
            <Link
              href="/notifications"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Lihat Semua Notifikasi
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
