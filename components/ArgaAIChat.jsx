"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

const QUICK_PROMPTS = [
  "Bantu saya belajar grammar present perfect",
  "Buat contoh dialog bahasa Inggris untuk pemula",
  "Jelaskan apa itu past tense",
];

import AIMascot from "./AIMascot";

function AssistantIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 2a4 4 0 0 0-4 4v1.2A6.8 6.8 0 0 0 4 13v2a2 2 0 0 0 2 2h1v1.2A2.8 2.8 0 0 0 9.8 21h4.4A2.8 2.8 0 0 0 17 18.2V17h1a2 2 0 0 0 2-2v-2a6.8 6.8 0 0 0-4-5.8V6a4 4 0 0 0-4-4Z"
        className="fill-violet-500"
      />
      <circle cx="9" cy="13" r="1" fill="white" />
      <circle cx="15" cy="13" r="1" fill="white" />
      <path
        d="M9.5 16.2c.9.7 1.8 1 2.5 1s1.6-.3 2.5-1"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Bubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "rounded-br-md bg-indigo-600 text-white"
            : "rounded-bl-md bg-white text-gray-800 border border-gray-200"
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{content}</div>
        ) : (
          <div className="whitespace-pre-wrap prose prose-sm">
            <ReactMarkdown
              children={content}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ArgaAIChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Halo! Aku Arga AI. Aku siap bantu latihan grammar, koreksi kalimat, atau bikin latihan bahasa Inggris yang sesuai levelmu.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSend = input.trim().length > 0 && !loading;

  const sendMessage = async (messageText = input) => {
    const trimmed = messageText.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/chats/arga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Gagal terhubung ke Arga AI");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data?.data?.message?.content ||
            "Maaf, Arga AI belum dapat membalas saat ini.",
        },
      ]);
    } catch (err) {
      setError(err.message || "Gagal mengirim pesan");
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Maaf, Arga AI sedang tidak tersedia. Pastikan server aktif lalu coba lagi.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white font-[family-name:var(--font-nunito)]">
      <div className="px-5 py-4 border-b-4 border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E0E7FF] border-2 border-[#6366F1] overflow-hidden shrink-0 relative">
            <div className="absolute inset-0 flex items-center justify-center scale-[0.25]">
              <AIMascot mood="neutral" skin="detective" />
            </div>
          </div>
          <div>
            <h2 className="font-black text-gray-950 text-base leading-tight">
              Arga AI
            </h2>
            <p className="text-xs font-bold text-[#78909C]">Online</p>
          </div>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 bg-[#F8F9FF]">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(#C7D2FE 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative h-full overflow-y-auto p-4 md:p-6 space-y-3">
          <div className="mb-1 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                disabled={loading}
                className="rounded-full border-2 border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {messages.map((message, index) => (
              <Bubble
                key={`${message.role}-${index}`}
                role={message.role}
                content={message.content}
              />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-3xl rounded-bl-md px-4 py-3 text-sm border-2 border-b-4 border-gray-200 bg-white text-gray-500 shadow-sm">
                  Arga AI sedang berpikir...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-5 py-4 border-t-4 border-gray-100 bg-white shrink-0">
        {error ? (
          <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Tulis pesan untuk Arga AI..."
              rows={1}
              className="w-full px-4 py-3 rounded-2xl border-2 border-b-4 border-gray-200 bg-white text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:border-[#6366F1] text-sm resize-none leading-relaxed"
              style={{
                minHeight: "48px",
                maxHeight: "120px",
                overflowY: "auto",
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + "px";
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={!canSend}
            className="shrink-0 p-3 rounded-2xl bg-[#6366F1] border-2 border-b-4 border-[#4338CA] text-white font-black disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
          >
            Kirim
          </button>
        </div>

        <p className="text-center text-[10px] font-bold text-gray-300 mt-2">
          Tekan Enter untuk kirim · Shift+Enter untuk baris baru
        </p>
      </div>
    </div>
  );
}
