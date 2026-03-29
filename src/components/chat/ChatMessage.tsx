import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, RefreshCw, ThumbsUp, ThumbsDown, Bookmark, ChevronDown, FileText, Check, Pencil, X } from "lucide-react";
import { type Message } from "@/lib/chat-store";
import { MODEL_PILLS } from "./ModelPillBar";

interface Props {
  msg: Message;
  modelId: string;
  isStreaming?: boolean;
  onCopy?: (text: string) => void;
  onRegenerate?: (format?: string) => void;
  onOpenArtifact?: (code: string) => void;
  onEditSubmit?: (newContent: string) => void;
}

export default function ChatMessage({ msg, modelId, isStreaming, onCopy, onRegenerate, onOpenArtifact, onEditSubmit }: Props) {
  const [showActions, setShowActions] = useState(false);
  const [regenOpen, setRegenOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(msg.content);

  const model = MODEL_PILLS.find(m => m.id === modelId);

  // Parse <think>...</think> blocks
  let thinkContent = "";
  let mainContent = msg.content;
  const thinkMatch = msg.content.match(/<think>([\s\S]*?)<\/think>/);
  if (thinkMatch) {
    thinkContent = thinkMatch[1].trim();
    mainContent = msg.content.replace(/<think>[\s\S]*?<\/think>/, "").trim();
  }

  const [thinkExpanded, setThinkExpanded] = useState(false);

  // Check for 5+ line code blocks
  const hasLargeCode = /```[\s\S]{0,20}\n([\s\S]{4,}\n){4,}[\s\S]*?```/.test(mainContent);

  // Extract code for artifacts
  const codeMatch = mainContent.match(/```[\w]*\n([\s\S]*?)```/);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    onCopy?.(msg.content);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenOptions = [
    "As bullets", "As paragraph", "As table",
    "Shorter", "More detailed", "Simpler language",
  ];

  if (msg.role === "user") {
    return (
      <div className="flex justify-end animate-msg-in group" style={{ fontFamily: "var(--font-chat)" }}>
        <div className="max-w-[75%] relative">
          {editing ? (
            <div className="bg-primary/20 border border-primary/30 rounded-2xl px-4 py-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-transparent text-sm resize-none outline-none min-h-[60px]"
                rows={3}
              />
              <div className="flex gap-2 mt-2 justify-end">
                <button onClick={() => setEditing(false)} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
                  <X className="h-3 w-3" /> Cancel
                </button>
                <button
                  onClick={() => { onEditSubmit?.(editText); setEditing(false); }}
                  className="text-xs text-primary flex items-center gap-1 hover:text-primary/80"
                >
                  <RefreshCw className="h-3 w-3" /> Resubmit
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-3">
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <div className="text-[10px] text-muted-foreground mt-1 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // AI message
  return (
    <div
      className="flex justify-start animate-msg-in"
      style={{ fontFamily: "var(--font-chat)" }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setRegenOpen(false); }}
    >
      <div className="max-w-[85%]">
        {/* Model badge */}
        <div className="flex items-center gap-1.5 mb-1.5 text-[11px] text-muted-foreground">
          {model && (
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: model.dot }} />
          )}
          <span>{model?.label || "AI"}</span>
          {msg.speed && (
            <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] capitalize">{msg.speed}</span>
          )}
        </div>

        {/* Reasoning block */}
        {thinkContent && (
          <div className="mb-3">
            <button
              onClick={() => setThinkExpanded(!thinkExpanded)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>🧠 Reasoning</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${thinkExpanded ? "rotate-180" : ""}`} />
            </button>
            {thinkExpanded && (
              <div className="mt-2 bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30">
                {thinkContent}
              </div>
            )}
          </div>
        )}

        {/* Main content with markdown */}
        <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none
          [&_p]:mb-2 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:mb-0.5
          [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-3
          [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2
          [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1.5
          [&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
          [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-xs [&_code]:font-[var(--font-code)]
          [&_pre]:bg-secondary [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:relative [&_pre]:overflow-x-auto
          [&_pre_code]:bg-transparent [&_pre_code]:p-0
          [&_table]:w-full [&_th]:bg-secondary/60 [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left [&_th]:text-xs
          [&_td]:px-3 [&_td]:py-1.5 [&_td]:text-xs [&_td]:border-t [&_td]:border-border
          [&_tr:nth-child(even)]:bg-secondary/20
          [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2
          [&_strong]:text-foreground
          "
        >
          <ReactMarkdown
            components={{
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
              ),
              pre: ({ children }) => (
                <div className="relative group/code">
                  <pre>{children}</pre>
                  <button
                    onClick={() => {
                      const text = codeMatch?.[1] || "";
                      navigator.clipboard.writeText(text);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity bg-background/80 rounded px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Copy
                  </button>
                </div>
              ),
            }}
          >
            {mainContent || "..."}
          </ReactMarkdown>
        </div>

        {/* Open in Artifacts button */}
        {hasLargeCode && !isStreaming && (
          <button
            onClick={() => onOpenArtifact?.(codeMatch?.[1] || "")}
            className="mt-2 flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" /> Open in Artifacts
          </button>
        )}

        {/* Action bar on hover */}
        {!isStreaming && showActions && (
          <div className="flex items-center gap-1 mt-2 animate-msg-in">
            <button onClick={handleCopy} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-secondary transition-colors">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>

            <div className="relative">
              <button
                onClick={() => setRegenOpen(!regenOpen)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-secondary transition-colors"
              >
                <RefreshCw className="h-3 w-3" /> Regenerate <ChevronDown className="h-2.5 w-2.5" />
              </button>
              {regenOpen && (
                <div className="absolute bottom-full left-0 mb-1 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[160px] z-50">
                  {regenOptions.map(opt => (
                    <button
                      key={opt}
                      onClick={() => { onRegenerate?.(opt); setRegenOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="text-muted-foreground hover:text-foreground px-1.5 py-1 rounded-md hover:bg-secondary transition-colors">
              <ThumbsUp className="h-3 w-3" />
            </button>
            <button className="text-muted-foreground hover:text-foreground px-1.5 py-1 rounded-md hover:bg-secondary transition-colors">
              <ThumbsDown className="h-3 w-3" />
            </button>
            <button className="text-muted-foreground hover:text-foreground px-1.5 py-1 rounded-md hover:bg-secondary transition-colors">
              <Bookmark className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Suggestion chips */}
        {!isStreaming && msg.content && msg.role === "assistant" && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {["🔄 Continue", "📋 Summarize this", "🔍 Go deeper"].map(chip => (
              <button
                key={chip}
                className="text-[11px] px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
