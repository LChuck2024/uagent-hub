import React from "react";

interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  if (!content) return null;

  // Split content into blocks: code blocks vs text blocks
  const blocks: { type: "code" | "text"; lang?: string; text: string }[] = [];
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({
        type: "text",
        text: content.substring(lastIndex, match.index),
      });
    }
    blocks.push({
      type: "code",
      lang: match[1] || "",
      text: match[2],
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    blocks.push({
      type: "text",
      text: content.substring(lastIndex),
    });
  }

  // Parse text block lines for headers, lists, bold text
  const renderTextBlock = (text: string, blockIdx: number) => {
    const lines = text.split("\n");
    return (
      <div key={`text-block-${blockIdx}`} className="space-y-2 text-stone-700">
        {lines.map((line, lineIdx) => {
          const trimmed = line.trim();

          // Empty line
          if (!trimmed) {
            return <div key={`empty-${lineIdx}`} className="h-2" />;
          }

          // Headers
          if (trimmed.startsWith("### ")) {
            return (
              <h4 key={lineIdx} className="text-md font-bold text-stone-600 font-display mt-3">
                {parseInlineFormatting(trimmed.substring(4))}
              </h4>
            );
          }
          if (trimmed.startsWith("## ")) {
            return (
              <h3 key={lineIdx} className="text-lg font-bold text-orange-700 font-display mt-4">
                {parseInlineFormatting(trimmed.substring(3))}
              </h3>
            );
          }
          if (trimmed.startsWith("# ")) {
            return (
              <h2 key={lineIdx} className="text-xl font-extrabold text-stone-900 font-display mt-5">
                {parseInlineFormatting(trimmed.substring(2))}
              </h2>
            );
          }

          // Bullet lists
          if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            return (
              <ul key={lineIdx} className="list-disc pl-5 space-y-1">
                <li>{parseInlineFormatting(trimmed.substring(2))}</li>
              </ul>
            );
          }

          // Numbered lists
          const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
          if (numMatch) {
            return (
              <ol key={lineIdx} className="list-decimal pl-5 space-y-1">
                <li value={parseInt(numMatch[1])}>
                  {parseInlineFormatting(numMatch[2])}
                </li>
              </ol>
            );
          }

          // Blockquotes
          if (trimmed.startsWith("> ")) {
            return (
              <blockquote key={lineIdx} className="border-l-4 border-orange-600 bg-orange-50 px-3 py-1 my-2 rounded-r italic text-stone-700">
                {parseInlineFormatting(trimmed.substring(2))}
              </blockquote>
            );
          }

          // Regular paragraph
          return (
            <p key={lineIdx} className="leading-relaxed">
              {parseInlineFormatting(line)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper to parse bold, italic and inline codes
  const parseInlineFormatting = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const inlineRegex = /(\*\*|__)(.*?)\1|(`)(.*?)\3|(\*)(.*?)\5/g;
    let idx = 0;
    let m;

    while ((m = inlineRegex.exec(text)) !== null) {
      if (m.index > idx) {
        parts.push(text.substring(idx, m.index));
      }
      if (m[1]) {
        // Bold
        parts.push(
          <strong key={m.index} className="font-semibold text-stone-900">
            {m[2]}
          </strong>
        );
      } else if (m[3]) {
        // Inline code
        parts.push(
          <code key={m.index} className="font-mono text-xs bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded border border-stone-300">
            {m[4]}
          </code>
        );
      } else if (m[5]) {
        // Italic
        parts.push(<em key={m.index} className="italic text-stone-800">{m[6]}</em>);
      }
      idx = inlineRegex.lastIndex;
    }

    if (idx < text.length) {
      parts.push(text.substring(idx));
    }

    return parts.length > 0 ? parts : [text];
  };

  return (
    <div className="prose-custom space-y-3 text-stone-700">
      {blocks.map((block, idx) => {
        if (block.type === "code") {
          return (
            <div key={`code-block-${idx}`} className="my-3 rounded-lg border border-stone-200 overflow-hidden shadow-lg">
              <div className="bg-stone-100 px-4 py-1.5 flex justify-between items-center text-xs text-stone-500 font-mono border-b border-stone-200">
                <span>{block.lang || "code"}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(block.text)}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                  title="复制代码"
                >
                  复制
                </button>
              </div>
              <pre className="p-4 bg-stone-900 overflow-x-auto text-xs font-mono text-stone-200">
                <code>{block.text}</code>
              </pre>
            </div>
          );
        } else {
          return renderTextBlock(block.text, idx);
        }
      })}
    </div>
  );
}
