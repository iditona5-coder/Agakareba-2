import React, { useState } from 'react';
import { Copy, Check, Terminal, Code2 } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

interface FormattedCaptionProps {
  caption: string;
  isReadingMode?: boolean;
  className?: string;
}

interface Segment {
  type: 'text' | 'code-block';
  content: string;
  language?: string;
}

/**
 * Parses caption text into structured segments (prose and code blocks)
 */
function parseCaption(text: string): Segment[] {
  if (!text) return [];

  const segments: Segment[] = [];

  // Check for markdown code blocks with ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const textBefore = text.slice(lastIndex, match.index);
    if (textBefore.trim()) {
      segments.push({ type: 'text', content: textBefore });
    }

    const language = match[1]?.trim() || '';
    const codeContent = match[2]?.trimEnd() || '';
    if (codeContent) {
      segments.push({
        type: 'code-block',
        language: language || 'code',
        content: codeContent,
      });
    }

    lastIndex = match.index + match[0].length;
  }

  const remaining = text.slice(lastIndex);
  if (remaining.trim()) {
    // Check if the remaining text itself looks like raw unformatted multiline code
    const lines = remaining.split('\n');
    const isCodeLike =
      lines.length >= 2 &&
      lines.some(
        (line) =>
          /^\s*(import |export |const |let |var |function |class |def |public |private |<[a-z]+|{\s*$|console\.|return |if\s*\(|SELECT |curl |npm |git )/i.test(
            line
          ) || /[{};=>]{2,}/.test(line)
      );

    if (isCodeLike && !segments.length) {
      // Treat the entire block as code if it has strong code patterns throughout
      segments.push({
        type: 'code-block',
        language: 'code',
        content: remaining.trim(),
      });
    } else {
      segments.push({ type: 'text', content: remaining });
    }
  }

  return segments.length > 0 ? segments : [{ type: 'text', content: text }];
}

/**
 * Individual Code Block with syntax styling, horizontal scroll, and copy button
 */
const CodeBlockItem: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-2.5 rounded-xl overflow-hidden border border-slate-700/80 bg-[#161b22] shadow-md transition-all">
      {/* Code Header Bar */}
      <div className="px-3.5 py-1.5 bg-[#0d1117] border-b border-slate-700/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
          <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-semibold uppercase tracking-wider text-slate-400">
            {language || 'Kode'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          title="Salin potongan kode"
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Salin</span>
            </>
          )}
        </button>
      </div>

      {/* Code Pre Container: Ruang padding lega, font monospace rapi, scroll horizontal jika panjang */}
      <pre className="p-3.5 sm:p-4 text-xs sm:text-[13px] font-mono text-emerald-300/90 leading-relaxed overflow-x-auto whitespace-pre selection:bg-emerald-800 selection:text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
};

/**
 * Formatted Caption Component
 * Prevents code from looking cramped ("mepet") by wrapping code blocks in dedicated styled boxes
 * and rendering inline code tags with distinct styling.
 */
export const FormattedCaption: React.FC<FormattedCaptionProps> = ({
  caption,
  isReadingMode = false,
  className = '',
}) => {
  if (!caption) return null;

  const segments = parseCaption(caption);

  return (
    <div className={`w-full ${className}`}>
      {segments.map((seg, idx) => {
        if (seg.type === 'code-block') {
          return (
            <CodeBlockItem
              key={`code-${idx}`}
              code={seg.content}
              language={seg.language}
            />
          );
        }

        // Render prose text with inline code support (`code`)
        const parts = seg.content.split(/(`[^`]+`)/g);

        return (
          <div
            key={`text-${idx}`}
            className={`whitespace-pre-line break-words ${
              isReadingMode
                ? 'text-[15px] sm:text-[16px] text-slate-800 leading-relaxed'
                : 'text-[14px] sm:text-[15px] text-slate-900 leading-relaxed font-normal'
            }`}
          >
            {parts.map((part, pIdx) => {
              if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
                const codeSnippet = part.slice(1, -1);
                return (
                  <code
                    key={pIdx}
                    className="inline-block px-1.5 py-0.5 mx-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/80 font-mono text-xs sm:text-[13px] font-semibold"
                  >
                    {codeSnippet}
                  </code>
                );
              }
              return <span key={pIdx}>{part}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
};
