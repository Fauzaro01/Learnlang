"use client";

import { useEffect, useRef, useState } from "react";

export default function MermaidViewer({ chart }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      if (!containerRef.current || !chart) return;
      setLoading(true);
      setError(null);

      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "strict",
          fontFamily: "inherit",
        });

        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg, bindFunctions } = await mermaid.render(id, chart);

        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = svg;
          if (bindFunctions) {
            bindFunctions(containerRef.current);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Gagal merender diagram Mermaid");
          setLoading(false);
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  return (
    <div className="my-3">
      {loading && (
        <div className="flex items-center justify-center rounded-2xl bg-gray-50 p-4 text-xs text-gray-400 border border-gray-200">
          Memuat diagram...
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <p className="font-bold">Diagram preview (syntax raw):</p>
          <pre className="mt-1 overflow-x-auto text-[11px] font-mono">{chart}</pre>
        </div>
      )}
      <div
        ref={containerRef}
        className={`overflow-x-auto rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-sm flex justify-center ${
          loading || error ? "hidden" : ""
        }`}
      />
    </div>
  );
}
