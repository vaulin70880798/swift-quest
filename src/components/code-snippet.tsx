"use client";

import { useMemo, useState } from "react";

import { MixedText } from "@/components/mixed-text";

interface CodeSnippetProps {
  code: string;
  language: "swift" | "swiftui";
}

type TokenClass =
  | "code-token-plain"
  | "code-token-keyword"
  | "code-token-type"
  | "code-token-string"
  | "code-token-number"
  | "code-token-comment"
  | "code-token-function"
  | "code-token-attribute";

interface HighlightToken {
  text: string;
  className: TokenClass;
}

const SWIFT_KEYWORDS = new Set([
  "let",
  "var",
  "if",
  "else",
  "guard",
  "switch",
  "case",
  "default",
  "for",
  "in",
  "while",
  "repeat",
  "break",
  "continue",
  "func",
  "return",
  "print",
  "import",
  "struct",
  "class",
  "protocol",
  "extension",
  "init",
  "deinit",
  "mutating",
  "override",
  "final",
  "try",
  "throw",
  "throws",
  "do",
  "catch",
  "async",
  "await",
  "nil",
  "true",
  "false",
]);

const SWIFT_TYPES = new Set([
  "String",
  "Int",
  "Double",
  "Bool",
  "Array",
  "Dictionary",
  "Set",
  "View",
  "Text",
  "NavigationStack",
  "Task",
  "MainActor",
]);

const TOKEN_REGEX =
  /(\/\/.*$|"(?:\\.|[^"\\])*"|@[A-Za-z_]\w*|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b|[^\s])/g;

function classifyToken(token: string, line: string, tokenStart: number): TokenClass {
  if (token.startsWith("//")) {
    return "code-token-comment";
  }
  if (token.startsWith("\"") && token.endsWith("\"")) {
    return "code-token-string";
  }
  if (token.startsWith("@")) {
    return "code-token-attribute";
  }
  if (/^\d+(?:\.\d+)?$/.test(token)) {
    return "code-token-number";
  }
  if (SWIFT_KEYWORDS.has(token)) {
    return "code-token-keyword";
  }
  if (SWIFT_TYPES.has(token)) {
    return "code-token-type";
  }
  if (/^[A-Za-z_]\w*$/.test(token)) {
    const nextCharacter = line[tokenStart + token.length];
    if (nextCharacter === "(") {
      return "code-token-function";
    }
  }
  return "code-token-plain";
}

function highlightLine(line: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(TOKEN_REGEX)) {
    const start = match.index ?? 0;
    const tokenText = match[0] ?? "";

    if (start > lastIndex) {
      tokens.push({
        text: line.slice(lastIndex, start),
        className: "code-token-plain",
      });
    }

    tokens.push({
      text: tokenText,
      className: classifyToken(tokenText, line, start),
    });

    lastIndex = start + tokenText.length;
  }

  if (lastIndex < line.length) {
    tokens.push({
      text: line.slice(lastIndex),
      className: "code-token-plain",
    });
  }

  if (tokens.length === 0) {
    tokens.push({
      text: " ",
      className: "code-token-plain",
    });
  }

  return tokens;
}

export function CodeSnippet({ code, language }: CodeSnippetProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const normalized = useMemo(() => code.trim(), [code]);
  const highlightedLines = useMemo(
    () => normalized.split("\n").map((line) => highlightLine(line)),
    [normalized],
  );

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
        <MixedText text={language === "swiftui" ? "קטע קוד SwiftUI" : "קטע קוד Swift"} />
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
        dir="ltr"
        className={`overflow-x-auto rounded-lg bg-[#04101f] p-3 text-sm leading-6 ${
          expanded ? "max-h-[420px]" : "max-h-[220px]"
        } overflow-y-auto`}
      >
        <code dir="ltr" className="block text-left">
          {highlightedLines.map((line, lineIndex) => (
            <span key={`line-${lineIndex}`} className="block whitespace-pre">
              {line.map((token, tokenIndex) => (
                <span key={`line-${lineIndex}-token-${tokenIndex}`} className={token.className}>
                  {token.text}
                </span>
              ))}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
