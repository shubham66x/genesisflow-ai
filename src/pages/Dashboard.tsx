import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Zap, Send, Plus, Trash2, LogOut, Menu, X, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  type Conversation,
  type Message,
  getConversations,
  createConversation,
  addMessage,
  updateLastAssistantMessage,
  deleteConversation,
  incrementUsage,
  streamAIResponse,
} from "@/lib/chat-store";
import {
  CATEGORIES,
  detectCategory,
  getSmartModel,
  type Category,
} from "@/lib/categories";

const ChatMessage = ({ msg }: { msg: Message }) => {
  const cat = msg.category ? CATEGORIES.find(c => c.id === msg.category) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          msg.role === "user"
            ? "gold-gradient text-primary-foreground"
            : "glass gold-border"
        }`}
      >
        {msg.role === "assistant" && cat && (
          <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
            <cat.icon className="h-3 w-3" style={{ color: cat.color }} />
            <span>{cat.label}</span>
            {msg.speed && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-secondary capitalize">{msg.speed}</span>
            )}
          </div>
        )}
        {msg.role === "assistant" ? (
          <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none [&_p]:mb-2 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:mb-0.5 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_code]:bg-secondary [&_code]:px-1 [&_code]:rounded [&_pre]:bg-secondary [&_pre]:rounded-lg [&_pre]:p-3">
            <ReactMarkdown>{msg.content || "..."}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
        )}
      </div>
    </motion.div>
  );
};

const CategoryGrid = ({ onSelect }: { onSelect: (cat: Category) => void }) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center max-w-lg px-4">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
        <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
      </motion.div>
      <motion.h2
        className="text-2xl font-bold mb-2"
        initial={{ opacity: 0, filter: "blur(8px)" }}
        animate={{ opacity: 1, filter: "blur(0)" }}
        transition={{ delay: 0.2 }}
      >
        AI Life Operating System
      </motion.h2>
      <motion.p
        className="text-muted-foreground mb-6 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Pick a category or just type anything. Smart routing handles the rest.
      </motion.p>
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-5 gap-2"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
      >
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.id}
            variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
            onClick={() => onSelect(cat)}
            className="glass gold-border rounded-xl p-3 text-center hover-lift hover-glow group transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <cat.icon className="h-5 w-5 mx-auto mb-1 transition-transform group-hover:scale-110" style={{ color: cat.color }} />
            <div className="text-xs font-medium">{cat.label}</div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [detectedCat, setDetectedCat] = useState<Category | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [usage, setUsage] = useState(0);
  const maxUsage = 100;

  useEffect(() => {
    if (!authLoading && !user) { navigate("/"); return; }
    setConversations(getConversations());
  }, [authLoading, user]);

  const activeConvo = conversations.find((c) => c.id === activeId) || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [activeConvo?.messages.length, streamingContent]);

  // Live category detection as user types
  useEffect(() => {
    if (input.trim().length > 3) {
      setDetectedCat(detectCategory(input));
    } else {
      setDetectedCat(null);
    }
  }, [input]);

  const startFromCategory = useCallback((cat: Category) => {
    const convo = createConversation(cat.id);
    setConversations(getConversations());
    setActiveId(convo.id);
    setInput(cat.examples[0] + " ");
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    if (usage >= maxUsage) {
      toast({ title: "Limit reached", description: "You've used all free requests.", variant: "destructive" });
      return;
    }

    const userMsg = input.trim();
    const category = detectCategory(userMsg);
    const { model, speed } = getSmartModel(category, userMsg.length);

    let convoId = activeId;
    if (!convoId) {
      const convo = createConversation(category.id);
      convoId = convo.id;
      setActiveId(convo.id);
    }

    setInput("");
    addMessage(convoId, "user", userMsg, category.id, speed);
    setConversations(getConversations());
    setIsLoading(true);
    setStreamingContent("");

    const updatedConvo = getConversations().find((c) => c.id === convoId);

    // Add placeholder assistant message
    addMessage(convoId, "assistant", "", category.id, speed);
    setConversations(getConversations());

    let fullContent = "";

    await streamAIResponse(
      updatedConvo?.messages || [],
      category.id,
      speed,
      model,
      (delta) => {
        fullContent += delta;
        setStreamingContent(fullContent);
      },
      () => {
        updateLastAssistantMessage(convoId!, fullContent);
        incrementUsage();
        setConversations(getConversations());
        setStreamingContent("");
        setIsLoading(false);
      },
      (error) => {
        updateLastAssistantMessage(convoId!, `Error: ${error}`);
        setConversations(getConversations());
        setStreamingContent("");
        setIsLoading(false);
        toast({ title: "AI Error", description: error, variant: "destructive" });
      },
    );
  }, [input, isLoading, activeId, toast]);

  const handleDelete = (id: string) => {
    deleteConversation(id);
    if (activeId === id) setActiveId(null);
    setConversations(getConversations());
  };

  const handleLogout = () => {
    localStorage.removeItem("jetflows_user");
    navigate("/");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const displayMessages = activeConvo?.messages.map((msg, i) => {
    if (isLoading && streamingContent && i === activeConvo.messages.length - 1 && msg.role === "assistant") {
      return { ...msg, content: streamingContent };
    }
    return msg;
  }) || [];

  const currentUsage = usage;

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            exit={{ x: -288 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed md:relative z-50 w-72 flex-shrink-0 border-r border-border flex flex-col bg-card h-full"
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="font-bold text-gradient-animated">JetFlows</span>
                </div>
                <button onClick={() => setShowSidebar(false)} className="text-muted-foreground md:hidden">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <Button
                onClick={() => { setActiveId(null); setShowSidebar(false); }}
                className="w-full gold-gradient text-primary-foreground font-semibold"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" /> New Chat
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.map((convo) => {
                const cat = CATEGORIES.find(c => c.id === convo.category);
                return (
                  <div
                    key={convo.id}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                      activeId === convo.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                    onClick={() => { setActiveId(convo.id); setShowSidebar(false); }}
                  >
                    {cat && <cat.icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: cat.color }} />}
                    <span className="flex-1 truncate">{convo.title}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(convo.id); }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
              {conversations.length === 0 && (
                <p className="text-center text-muted-foreground text-xs py-8">No conversations yet</p>
              )}
            </div>

            <div className="p-4 border-t border-border space-y-3">
              <div className="text-xs text-muted-foreground">
                Usage: {currentUsage} / {maxUsage}
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5">
                <div className="gold-gradient h-1.5 rounded-full transition-all" style={{ width: `${Math.min((currentUsage / maxUsage) * 100, 100)}%` }} />
              </div>
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(!showSidebar)} className="text-muted-foreground hover:text-foreground">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm text-gradient-animated">JetFlows AI</span>
            </div>
          </div>
          {activeConvo && (() => {
            const cat = CATEGORIES.find(c => c.id === activeConvo.category);
            return cat ? (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <cat.icon className="h-3.5 w-3.5" style={{ color: cat.color }} />
                <span>{cat.label}</span>
              </div>
            ) : null;
          })()}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          {!activeConvo || activeConvo.messages.length === 0 ? (
            <CategoryGrid onSelect={startFromCategory} />
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {displayMessages.map((msg) => (
                <ChatMessage key={msg.id} msg={msg} />
              ))}
              {isLoading && !streamingContent && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="glass gold-border rounded-2xl px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.15s" }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="max-w-3xl mx-auto">
            {/* Live category detection indicator */}
            <AnimatePresence>
              {detectedCat && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="flex items-center gap-2 mb-2 text-xs text-muted-foreground"
                >
                  <detectedCat.icon className="h-3 w-3" style={{ color: detectedCat.color }} />
                  <span>Detected: <span className="text-foreground font-medium">{detectedCat.label}</span></span>
                  <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] capitalize">{detectedCat.speedMode}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything — productivity, coding, finance, creativity..."
                className="flex-1 bg-secondary border-border resize-none min-h-[48px] max-h-[120px] rounded-xl"
                rows={1}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="gold-gradient text-primary-foreground self-end rounded-xl"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
