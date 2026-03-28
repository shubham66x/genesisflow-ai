import { useState, useRef, useEffect } from "react";
import { Plus, Brain, Search, Palette, GraduationCap, Image, Camera, FolderOpen, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type AttachmentAction = 
  | "thinking" 
  | "deep_research" 
  | "create_image" 
  | "study" 
  | "add_photos" 
  | "camera" 
  | "upload_files";

interface AttachmentMenuProps {
  onAction: (action: AttachmentAction) => void;
  disabled?: boolean;
}

const MENU_ITEMS: { action: AttachmentAction; icon: typeof Brain; label: string; color: string }[] = [
  { action: "thinking", icon: Brain, label: "Thinking Mode", color: "hsl(270, 70%, 55%)" },
  { action: "deep_research", icon: Search, label: "Deep Research", color: "hsl(210, 90%, 55%)" },
  { action: "create_image", icon: Palette, label: "Create Image", color: "hsl(330, 70%, 55%)" },
  { action: "study", icon: GraduationCap, label: "Study & Learn", color: "hsl(45, 95%, 50%)" },
  { action: "add_photos", icon: Image, label: "Add Photos", color: "hsl(160, 70%, 45%)" },
  { action: "camera", icon: Camera, label: "Camera", color: "hsl(200, 70%, 55%)" },
  { action: "upload_files", icon: FolderOpen, label: "Upload Files", color: "hsl(25, 90%, 55%)" },
];

const AttachmentMenu = ({ onAction, disabled }: AttachmentMenuProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="w-10 h-10 flex items-center justify-center rounded-xl glass gold-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
      >
        {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 w-52 glass-strong gold-border rounded-xl p-2 z-50"
          >
            {MENU_ITEMS.map((item, i) => (
              <motion.button
                key={item.action}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => { onAction(item.action); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-secondary/50 transition-colors text-foreground"
              >
                <item.icon className="h-4 w-4 flex-shrink-0" style={{ color: item.color }} />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttachmentMenu;
