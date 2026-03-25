import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Send, Plus, Trash2, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  type AIModel,
  type Conversation,
  type Message,
  MODEL_INFO,
  getConversations,
  createConversation,
  addMessage,
  updateLastAssistantMessage,
  deleteConversation,
  getUser,
  incrementUsage,
  streamAIResponse,
} from "@/lib/chat-store";

const ModelPicker = ({
  selectedModel,
  activeModel,
  onSelect,
}: {
  selectedModel: AIModel;
  activeModel?: AIModel;
  onSelect: (m: AIModel) => void;
}) => {
  const [open, setOpen] = useState(false);
  const current = activeModel || selectedModel;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass gold-border text-sm"
      >
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: MODEL_INFO[current].color }} />
        <span>{MODEL_INFO[current].name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 glass-strong rounded-lg p-1 gold-border z-10 min-w-[200px]">
          {(Object.keys(MODEL_INFO) as AIModel[]).map((model) => (
            <button
              key={model}
              onClick={() => { onSelect(model); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left ${
                current === model ? "bg-secondary" : "hover:bg-secondary/50"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: MODEL_INFO[model].color }} />
              <div>
                <div className="font-medium">{MODEL_INFO[model].name}</div>
                <div className="text-xs text-muted-foreground">{MODEL_INFO[model].description}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ChatMessage = ({ msg }: { msg: Message }) => (
  <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
    <div
      className={`max-w-[85%] rounded-xl px-4 py-3 ${
        msg.role === "user" ? "gold-gradient text-primary-foreground" : "glass gold-border"
      }`}
    >
      {msg.role === "assistant" && msg.model && (
        <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: MODEL_INFO[msg.model].color }} />
          {MODEL_INFO[msg.model].name}
        </div>
      )}
      <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
    </div>
  </div>
);

const EmptyState = ({
  onSelectModel,
}: {
  onSelectModel: (model: AIModel) => void;
}) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center max-w-md">
      <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">JetFlows AI Solver</h2>
      <p className="text-muted-foreground mb-6">
        Choose your AI model and start a conversation. Real AI responses powered by Claude, GPT, and Gemini.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(MODEL_INFO) as AIModel[]).map((model) => (
          <button
            key={model}
            onClick={() => onSelectModel(model)}
            className="glass gold-border rounded-lg p-3 text-left hover:bg-secondary/50"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: MODEL_INFO[model].color }} />
              <span className="text-sm font-medium">{MODEL_INFO[model].name}</span>
            </div>
            <span className="text-xs text-muted-foreground">{MODEL_INFO[model].description}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>("claude");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = getUser();

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    setConversations(getConversations());
  }, []);

  const activeConvo = conversations.find((c) => c.id === activeId) || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [activeConvo?.messages.length, streamingContent]);

  const handleNewConversation = useCallback((model?: AIModel) => {
    const m = model || selectedModel;
    if (model) setSelectedModel(m);
    const convo = createConversation(m);
    setConversations(getConversations());
    setActiveId(convo.id);
    setInput("");
  }, [selectedModel]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const currentUser = getUser();
    if (currentUser && currentUser.usage >= currentUser.maxUsage) {
      toast({ title: "Limit reached", description: "You've used all 100 free requests. Upgrade to continue.", variant: "destructive" });
      return;
    }

    let convoId = activeId;
    if (!convoId) {
      const convo = createConversation(selectedModel);
      convoId = convo.id;
      setActiveId(convo.id);
    }

    const userMsg = input.trim();
    setInput("");
    addMessage(convoId, "user", userMsg);
    setConversations(getConversations());
    setIsLoading(true);
    setStreamingContent("");

    const updatedConvo = getConversations().find((c) => c.id === convoId);
    const model = updatedConvo?.model || selectedModel;

    // Add placeholder assistant message
    addMessage(convoId, "assistant", "", model);
    setConversations(getConversations());

    let fullContent = "";

    await streamAIResponse(
      updatedConvo?.messages || [],
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
        updateLastAssistantMessage(convoId!, `Sorry, an error occurred: ${error}`);
        setConversations(getConversations());
        setStreamingContent("");
        setIsLoading(false);
        toast({ title: "AI Error", description: error, variant: "destructive" });
      },
    );
  }, [input, isLoading, activeId, selectedModel, toast]);

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

  const currentUsage = user?.usage || 0;
  const maxUsage = user?.maxUsage || 100;

  // Get display messages - replace last assistant empty content with streaming
  const displayMessages = activeConvo?.messages.map((msg, i) => {
    if (isLoading && streamingContent && i === activeConvo.messages.length - 1 && msg.role === "assistant") {
      return { ...msg, content: streamingContent };
    }
    return msg;
  }) || [];

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      {showSidebar && (
        <div className="w-72 flex-shrink-0 border-r border-border flex flex-col bg-card">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-bold gold-text">JetFlows</span>
            </div>
            <Button onClick={() => handleNewConversation()} className="w-full gold-gradient text-primary-foreground font-semibold" size="sm">
              <Plus className="h-4 w-4 mr-2" /> New Chat
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map((convo) => (
              <div
                key={convo.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm ${
                  activeId === convo.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"
                }`}
                onClick={() => setActiveId(convo.id)}
              >
                <span className="flex-1 truncate">{convo.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(convo.id); }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {conversations.length === 0 && (
              <p className="text-center text-muted-foreground text-xs py-8">No conversations yet</p>
            )}
          </div>

          <div className="p-4 border-t border-border space-y-3">
            <div className="text-xs text-muted-foreground">
              Usage: {currentUsage} / {maxUsage} requests
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5">
              <div className="gold-gradient h-1.5 rounded-full" style={{ width: `${Math.min((currentUsage / maxUsage) * 100, 100)}%` }} />
            </div>
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button onClick={() => setShowSidebar(!showSidebar)} className="text-muted-foreground hover:text-foreground text-sm">
            {showSidebar ? "Hide" : "Show"} Sidebar
          </button>
          <ModelPicker
            selectedModel={selectedModel}
            activeModel={activeConvo?.model}
            onSelect={setSelectedModel}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          {!activeConvo || activeConvo.messages.length === 0 ? (
            <EmptyState onSelectModel={(m) => handleNewConversation(m)} />
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {displayMessages.map((msg) => (
                <ChatMessage key={msg.id} msg={msg} />
              ))}
              {isLoading && !streamingContent && (
                <div className="flex justify-start">
                  <div className="glass gold-border rounded-xl px-4 py-3">
                    <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: MODEL_INFO[activeConvo.model].color }} />
                      {MODEL_INFO[activeConvo.model].name}
                    </div>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-100" />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <div className="max-w-3xl mx-auto flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              className="flex-1 bg-secondary border-border resize-none min-h-[48px] max-h-[120px]"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="gold-gradient text-primary-foreground self-end"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
