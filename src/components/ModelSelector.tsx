import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { AI_MODELS, type AIModel } from "@/lib/models";
import { motion, AnimatePresence } from "framer-motion";

interface ModelSelectorProps {
  selectedId: string;
  onChange: (id: string) => void;
}

const ModelSelector = ({ selectedId, onChange }: ModelSelectorProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = AI_MODELS.find(m => m.id === selectedId) || AI_MODELS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const groups = Array.from(new Set(AI_MODELS.map(m => m.group)));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass gold-border text-xs font-medium hover:bg-secondary/50 transition-colors"
      >
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selected.color }} />
        <span className="truncate max-w-[140px]">{selected.label}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-64 glass-strong gold-border rounded-xl p-2 z-50 max-h-[60vh] overflow-y-auto"
          >
            {groups.map(group => (
              <div key={group}>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 pt-2 pb-1 font-semibold">
                  {group}
                </div>
                {AI_MODELS.filter(m => m.group === group).map(model => (
                  <button
                    key={model.id}
                    onClick={() => { onChange(model.id); setOpen(false); }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                      selectedId === model.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: model.color }} />
                    <span className="truncate">{model.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModelSelector;
