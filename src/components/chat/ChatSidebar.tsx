import { useState, useMemo } from "react";
import {
  Zap, Plus, Trash2, LogOut, ChevronLeft, Search, Moon, Sun, Settings,
  FolderOpen, RotateCcw,
} from "lucide-react";
import { type Conversation } from "@/lib/chat-store";
import { PERSONAS, type Persona } from "@/lib/personas";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  usage: number;
  maxUsage: number;
  activePersona: string;
  onPersonaChange: (id: string) => void;
  darkMode: boolean;
  onToggleDark: () => void;
  deletedConvos: Conversation[];
  onRestore: (id: string) => void;
}

function groupByDate(convos: Conversation[]) {
  const now = Date.now();
  const DAY = 86400000;
  const today: Conversation[] = [];
  const yesterday: Conversation[] = [];
  const thisWeek: Conversation[] = [];
  const older: Conversation[] = [];

  for (const c of convos) {
    const diff = now - c.updatedAt;
    if (diff < DAY) today.push(c);
    else if (diff < 2 * DAY) yesterday.push(c);
    else if (diff < 7 * DAY) thisWeek.push(c);
    else older.push(c);
  }
  return { today, yesterday, thisWeek, older };
}

export default function ChatSidebar(props: Props) {
  const {
    conversations, activeId, onSelect, onNew, onDelete, onLogout,
    collapsed, onToggleCollapse, usage, maxUsage,
    activePersona, onPersonaChange, darkMode, onToggleDark,
    deletedConvos, onRestore,
  } = props;

  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(c => c.title.toLowerCase().includes(q));
  }, [conversations, search]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  if (collapsed) {
    return (
      <div className="w-14 flex-shrink-0 border-r border-border flex flex-col items-center py-3 bg-card h-full transition-all duration-250">
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onToggleCollapse} className="mb-4 text-muted-foreground hover:text-foreground">
              <Zap className="h-5 w-5 text-primary" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Expand sidebar</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onNew} className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-primary-foreground mb-4">
              <Plus className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">New Chat</TooltipContent>
        </Tooltip>

        {PERSONAS.map(p => (
          <Tooltip key={p.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onPersonaChange(p.id)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg mb-1 text-sm transition-colors ${
                  activePersona === p.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {p.emoji}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{p.label}</TooltipContent>
          </Tooltip>
        ))}

        <div className="mt-auto space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onToggleDark} className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary">
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{darkMode ? "Light mode" : "Dark mode"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onLogout} className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive">
                <LogOut className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Sign Out</TooltipContent>
          </Tooltip>
        </div>
      </div>
    );
  }

  const renderGroup = (label: string, items: Conversation[]) => {
    if (!items.length) return null;
    return (
      <div key={label} className="mb-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-3 mb-1 font-medium">{label}</div>
        {items.map(c => (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
              activeId === c.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"
            }`}
          >
            <span className="flex-1 truncate" style={{ fontFamily: "var(--font-ui)" }}>{c.title}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive flex-shrink-0"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-60 flex-shrink-0 border-r border-border flex flex-col bg-card h-full transition-all duration-250">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm gold-text">JetFlows</span>
          </div>
          <button onClick={onToggleCollapse} className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <Plus className="h-4 w-4" /> New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-secondary border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary/50 placeholder:text-muted-foreground"
            style={{ fontFamily: "var(--font-ui)" }}
          />
        </div>
      </div>

      {/* Personas */}
      <div className="px-3 py-2 border-b border-border">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1.5 font-medium">Persona</div>
        <div className="space-y-0.5">
          {PERSONAS.map(p => (
            <button
              key={p.id}
              onClick={() => onPersonaChange(p.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                activePersona === p.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
              style={{ fontFamily: "var(--font-ui)" }}
            >
              <span>{p.emoji}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground text-xs py-8">No conversations</p>
        ) : (
          <>
            {renderGroup("Today", groups.today)}
            {renderGroup("Yesterday", groups.yesterday)}
            {renderGroup("This Week", groups.thisWeek)}
            {renderGroup("Older", groups.older)}
          </>
        )}
      </div>

      {/* Deleted */}
      <div className="px-3 py-2 border-t border-border">
        <button
          onClick={() => setShowDeleted(!showDeleted)}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground w-full"
        >
          <Trash2 className="h-3 w-3" /> Recently Deleted ({deletedConvos.length})
        </button>
        {showDeleted && deletedConvos.length > 0 && (
          <div className="mt-1 space-y-0.5 max-h-32 overflow-y-auto">
            {deletedConvos.map(c => (
              <div key={c.id} className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-muted-foreground">
                <span className="truncate flex-1">{c.title}</span>
                <button onClick={() => onRestore(c.id)} className="text-primary hover:text-primary/80 flex-shrink-0">
                  <RotateCcw className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-2">
        <div className="text-[10px] text-muted-foreground flex justify-between">
          <span>Usage</span>
          <span>{usage}/{maxUsage}</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-1">
          <div className="bg-primary h-1 rounded-full transition-all" style={{ width: `${Math.min((usage / maxUsage) * 100, 100)}%` }} />
        </div>

        <div className="flex items-center justify-between">
          <button onClick={onToggleDark} className="text-muted-foreground hover:text-foreground p-1 rounded">
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button onClick={onLogout} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive">
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
