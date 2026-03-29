import { useState, useRef } from "react";
import { X, Copy, Download, Pencil, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Tab = "artifacts" | "sources" | "research";

interface Props {
  open: boolean;
  onClose: () => void;
  artifactCode?: string;
  researchContent?: string;
  isMobile?: boolean;
}

export default function RightPanel({ open, onClose, artifactCode, researchContent, isMobile }: Props) {
  const [tab, setTab] = useState<Tab>(researchContent ? "research" : artifactCode ? "artifacts" : "artifacts");
  const [editing, setEditing] = useState(false);
  const [editCode, setEditCode] = useState(artifactCode || "");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!open) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(editCode || artifactCode || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([editCode || artifactCode || ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "artifact.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const panelClass = isMobile
    ? "fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border rounded-t-2xl shadow-2xl transition-transform duration-250"
    : "w-[380px] flex-shrink-0 border-l border-border bg-card h-full transition-all duration-250 overflow-hidden";

  const panelStyle = isMobile ? { maxHeight: "80vh" } : {};

  return (
    <div className={panelClass} style={panelStyle}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex gap-1">
          {(["artifacts", "sources", "research"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
              style={{ fontFamily: "var(--font-ui)" }}
            >
              {t}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: isMobile ? "calc(80vh - 100px)" : "calc(100vh - 52px)" }}>
        {tab === "artifacts" && (
          <div>
            {artifactCode ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border">
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {copied ? "Copied" : "Copy All"}
                  </button>
                  <button onClick={handleDownload} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border">
                    <Download className="h-3 w-3" /> Download .txt
                  </button>
                  <button
                    onClick={() => { setEditing(!editing); setEditCode(artifactCode); }}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors ${
                      editing ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Pencil className="h-3 w-3" /> {editing ? "Editing" : "Edit"}
                  </button>
                </div>

                {editing ? (
                  <textarea
                    ref={textareaRef}
                    value={editCode}
                    onChange={e => setEditCode(e.target.value)}
                    className="w-full bg-secondary rounded-lg p-3 text-xs font-mono resize-none outline-none border border-border min-h-[300px]"
                    style={{ fontFamily: "var(--font-code)" }}
                  />
                ) : (
                  <pre className="bg-secondary rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap" style={{ fontFamily: "var(--font-code)" }}>
                    {/* Line numbers */}
                    {(artifactCode).split("\n").map((line, i) => (
                      <div key={i} className="flex">
                        <span className="text-muted-foreground/40 select-none w-8 text-right pr-3 flex-shrink-0">{i + 1}</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </pre>
                )}
              </>
            ) : (
              <div className="text-center text-muted-foreground text-sm py-12">
                No artifacts yet. Code blocks from AI responses will appear here.
              </div>
            )}
          </div>
        )}

        {tab === "sources" && (
          <div className="text-center text-muted-foreground text-sm py-12">
            Citation sources will appear here when AI responses include references.
          </div>
        )}

        {tab === "research" && (
          <div>
            {researchContent ? (
              <div className="prose prose-invert prose-sm max-w-none text-sm leading-relaxed
                [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4
                [&_ul]:mb-2 [&_ol]:mb-2 [&_p]:mb-2
                [&_strong]:text-foreground
              ">
                <ReactMarkdown>{researchContent}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center text-muted-foreground text-sm py-12">
                Research reports will appear here when Research Mode is used.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
