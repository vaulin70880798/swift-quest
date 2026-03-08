"use client";

import { useMemo, useState } from "react";

interface CodeSnippetProps {
  code: string;
  language: "swift" | "swiftui";
}

export function CodeSnippet({ code, language }: CodeSnippetProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const normalized = useMemo(() => code.trim(), [code]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(normalized);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/15 bg-black/30 p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-fog/80">
        <span>{language === "swiftui" ? "קטע קוד SwiftUI" : "קטע קוד Swift"}</span>
        <div className="flex gap-2">
          <button
            className="rounded-md border border-sky/40 px-2 py-1 text-fog hover:bg-sky/10"
            onClick={() => setExpanded((value) => !value)}
            type="button"
          >
            {expanded ? "צמצום" : "הרחבה"}
          </button>
          <button
            className="rounded-md border border-amber/40 px-2 py-1 text-fog hover:bg-amber/10"
            onClick={onCopy}
            type="button"
          >
            {copied ? "הועתק" : "העתק"}
          </button>
        </div>
      </div>
      <pre
        className={`overflow-x-auto rounded-lg bg-[#04101f] p-3 text-sm leading-6 text-[#dbf5ff] ${
          expanded ? "max-h-[420px]" : "max-h-[220px]"
        } overflow-y-auto`}
      >
        <code>{normalized}</code>
      </pre>
    </div>
  );
}
