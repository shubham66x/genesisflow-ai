import { useRef } from "react";

export interface ModelPill {
  id: string;
  label: string;
  dot: string; // color
  emoji: string;
}

export const MODEL_PILLS: ModelPill[] = [
  { id: "claude", label: "Claude", dot: "hsl(270, 70%, 55%)", emoji: "🟣" },
  { id: "grok", label: "Grok", dot: "hsl(0, 0%, 50%)", emoji: "⚫" },
  { id: "gpt4o", label: "GPT-4o", dot: "hsl(160, 70%, 45%)", emoji: "🟢" },
  { id: "gemini", label: "Gemini", dot: "hsl(210, 90%, 55%)", emoji: "🔵" },
  { id: "deepseek", label: "DeepSeek R1", dot: "hsl(200, 70%, 50%)", emoji: "🔷" },
  { id: "step", label: "Step Flash", dot: "hsl(25, 90%, 55%)", emoji: "🟠" },
  { id: "llama", label: "Llama 3.3", dot: "hsl(0, 0%, 80%)", emoji: "⚪" },
];

interface Props {
  selected: string;
  onChange: (id: string) => void;
}

export default function ModelPillBar({ selected, onChange }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-1"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {MODEL_PILLS.map((m) => {
        const active = selected === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
              active
                ? "bg-primary text-primary-foreground shadow-md"
                : "border border-border text-muted-foreground hover:bg-secondary/60"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: m.dot }}
            />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
