"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Check, Copy } from "lucide-react";
import MermaidViewer from "./MermaidViewer";

function CodeBlock({ inline, className, children, ...props }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const codeString = String(children).replace(/\n$/, "");

  if (inline || !match) {
    return (
      <code
        className="rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-xs text-indigo-700 font-semibold"
        {...props}
      >
        {children}
      </code>
    );
  }

  // Jika bahasa mermaid, render sebagai visual diagram
  if (language === "mermaid") {
    return <MermaidViewer chart={codeString} />;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-2xl border-2 border-gray-800 bg-[#1E1E2E] text-gray-100 shadow-sm text-xs">
      <div className="flex items-center justify-between border-b border-gray-700/60 bg-[#181825] px-3.5 py-1.5 text-[11px] font-bold text-gray-400">
        <span className="uppercase tracking-wider text-indigo-400">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-lg px-2 py-0.5 hover:bg-white/10 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Salin</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-3 font-mono leading-relaxed">
        <code className={className} {...props}>
          {children}
        </code>
      </div>
    </div>
  );
}

export default function MarkdownMessage({ content }) {
  return (
    <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-p:leading-relaxed prose-headings:my-2 prose-headings:font-black prose-headings:text-gray-900 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-table:my-2 prose-table:w-full prose-th:border prose-th:border-gray-200 prose-th:bg-gray-50 prose-th:p-2 prose-td:border prose-td:border-gray-200 prose-td:p-2 text-gray-800 font-medium">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code: CodeBlock,
          a: ({ node, ...props }) => (
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 underline font-bold hover:text-indigo-800"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="my-2 overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs" {...props} />
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
