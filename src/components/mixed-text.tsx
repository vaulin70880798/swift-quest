"use client";

import { Fragment, ReactNode } from "react";

type MixedTextTag = "span" | "p" | "div" | "h1" | "h2" | "h3";

interface MixedTextProps {
  text: string;
  as?: MixedTextTag;
  className?: string;
}

const ENGLISH_RUN_REGEX =
  /([A-Za-z][A-Za-z0-9_@#().,%:+\-*/=<>!?$[\]{}|&]*(?:\s+[A-Za-z0-9_@#().,%:+\-*/=<>!?$[\]{}|&]+)*)/g;

function renderMixedText(text: string): ReactNode[] {
  const chunks: ReactNode[] = [];
  let lastIndex = 0;

  const pushPlainWithLineBreaks = (plain: string, keyPrefix: string) => {
    const lines = plain.split("\n");
    lines.forEach((line, index) => {
      if (line) {
        chunks.push(
          <Fragment key={`${keyPrefix}-line-${index}`}>{line}</Fragment>,
        );
      }
      if (index < lines.length - 1) {
        chunks.push(<br key={`${keyPrefix}-br-${index}`} />);
      }
    });
  };

  for (const match of text.matchAll(ENGLISH_RUN_REGEX)) {
    const start = match.index ?? 0;
    const englishChunk = match[0] ?? "";

    if (start > lastIndex) {
      pushPlainWithLineBreaks(text.slice(lastIndex, start), `plain-${start}`);
    }

    chunks.push(
      <span key={`en-${start}`} className="mixed-text__en" dir="ltr">
        {englishChunk}
      </span>,
    );

    lastIndex = start + englishChunk.length;
  }

  if (lastIndex < text.length) {
    pushPlainWithLineBreaks(text.slice(lastIndex), `plain-tail-${lastIndex}`);
  }

  return chunks;
}

export function MixedText({ text, as = "span", className }: MixedTextProps) {
  const Tag = as;
  return <Tag className={`mixed-text ${className ?? ""}`.trim()}>{renderMixedText(text)}</Tag>;
}
