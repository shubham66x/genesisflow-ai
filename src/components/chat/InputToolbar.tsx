import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Paperclip, Mic, MicOff, Globe, X, Loader2, FlaskConical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ResponseMode = "fast" | "expert" | "deep";
type ThinkMode = "direct" | "think";
type ToneMode = "formal" | "balanced" | "witty";

interface Props {
  modelLabel: string;
  onSend: (text: string, opts: {
    responseMode: ResponseMode;
    thinkMode: ThinkMode;
    tone: ToneMode;
    webEnabled: boolean;
    researchMode: boolean;
    file?: File;
  }) => void;
  isLoading: boolean;
  onSuggestionClick?: (text: string) => void;
}

const ACCEPTED_TYPES = [".pdf", ".txt", ".docx", ".png", ".jpg", ".jpeg"];

export default function InputToolbar({ modelLabel, onSend, isLoading }: Props) {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [responseMode, setResponseMode] = useState<ResponseMode>("fast");
  const [thinkMode, setThinkMode] = useState<ThinkMode>("direct");
  const [tone, setTone] = useState<ToneMode>("balanced");
  const [webEnabled, setWebEnabled] = useState(false);
  const [researchMode, setResearchMode] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim(), { responseMode, thinkMode, tone, webEnabled, researchMode, file: file || undefined });
    setInput("");
    setFile(null);
    setResearchMode(false);
  }, [input, isLoading, responseMode, thinkMode, tone, webEnabled, researchMode, file, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // File handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      toast({ title: "Unsupported file type", description: `Accepted: ${ACCEPTED_TYPES.join(", ")}`, variant: "destructive" });
      return;
    }
    setFile(f);
  };

  // Voice
  const toggleVoice = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      setInterimText("");
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast({ title: "🎤 Voice not supported", description: "Voice input requires Chrome or Edge browser." });
      return;
    }

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (event: any) => {
      const transcript = Array.from(event.results as SpeechRecognitionResultList)
        .map((r: any) => r[0].transcript)
        .join("");
      if (event.results[0]?.isFinal) {
        setInput(prev => prev + transcript);
        setInterimText("");
      } else {
        setInterimText(transcript);
      }
    };

    rec.onerror = (e: any) => {
      setListening(false);
      setInterimText("");
      if (e.error === "not-allowed") {
        toast({ title: "Microphone access denied", description: "Please allow mic permission in browser settings.", variant: "destructive" });
      }
    };
    rec.onend = () => { setListening(false); setInterimText(""); };

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, [listening, toast]);

  const charCount = input.length;

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto px-4 py-3 space-y-2">
        {/* Mode toggles row */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          {/* Response mode */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["fast", "expert", "deep"] as ResponseMode[]).map(m => (
              <button
                key={m}
                onClick={() => setResponseMode(m)}
                className={`px-2.5 py-1 capitalize transition-colors ${responseMode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Think mode */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["direct", "think"] as ThinkMode[]).map(m => (
              <button
                key={m}
                onClick={() => setThinkMode(m)}
                className={`px-2.5 py-1 capitalize transition-colors ${thinkMode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
              >
                {m === "think" ? "🧠 Think" : m}
              </button>
            ))}
          </div>

          {/* Tone */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["formal", "balanced", "witty"] as ToneMode[]).map(m => (
              <button
                key={m}
                onClick={() => setTone(m)}
                className={`px-2.5 py-1 capitalize transition-colors ${tone === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Research mode */}
          <button
            onClick={() => setResearchMode(!researchMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${researchMode ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
          >
            <FlaskConical className="h-3 w-3" /> Research
          </button>
        </div>

        {/* File chip */}
        {file && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg border border-border text-xs w-fit">
            <Paperclip className="h-3 w-3 text-muted-foreground" />
            <span className="text-foreground">{file.name}</span>
            <span className="text-muted-foreground">{(file.size / 1024).toFixed(0)}KB</span>
            <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Research mode badge */}
        {researchMode && (
          <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5 w-fit">
            <FlaskConical className="h-3.5 w-3.5" />
            Research Mode Active
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-2">
          {/* Left icons */}
          <div className="flex items-center gap-1 pb-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <button
              onClick={toggleVoice}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                listening
                  ? "bg-destructive text-destructive-foreground animate-pulse"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <button
              onClick={() => setWebEnabled(!webEnabled)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                webEnabled ? "text-success" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Globe className="h-4 w-4" />
            </button>
          </div>

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${modelLabel}...`}
              rows={1}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm resize-none outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
              style={{ fontFamily: "var(--font-chat)", maxHeight: "200px" }}
            />
            {interimText && (
              <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
                <span className="text-sm italic text-muted-foreground/50">{interimText}</span>
              </div>
            )}
            {charCount > 500 && (
              <span className="absolute bottom-2 right-2 text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                {charCount}
              </span>
            )}
          </div>

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all mb-0.5 ${
              input.trim() && !isLoading
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
