import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
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
import { CATEGORIES, detectCategory } from "@/lib/categories";
import { resolveGatewayModel } from "@/lib/models";
import { getPersonaById, PERSONAS } from "@/lib/personas";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ModelPillBar, { MODEL_PILLS } from "@/components/chat/ModelPillBar";
import InputToolbar from "@/components/chat/InputToolbar";
import ChatMessage from "@/components/chat/ChatMessage";
import RightPanel from "@/components/chat/RightPanel";

const RESEARCH_PREPEND = `You are a research assistant. Structure your response as a full research report with these exact sections using markdown:
## Executive Summary
## Key Findings
## Supporting Evidence
## Conflicting Perspectives
## Conclusion
Be thorough. Use headers, bullets, and bold key terms.

`;

const RESEARCH_STEPS = ["🔍 Analyzing...", "📚 Researching...", "✍️ Writing report..."];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();
  const isMobile = useIsMobile();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [deletedConvos, setDeletedConvos] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude");
  const [activePersona, setActivePersona] = useState("general");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [usage, setUsage] = useState(0);
  const maxUsage = 100;

  // Right panel
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [artifactCode, setArtifactCode] = useState<string | undefined>();
  const [researchContent, setResearchContent] = useState<string | undefined>();

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("jetflows_dark");
    return saved !== null ? saved === "true" : true;
  });

  // Research progress
  const [researchStep, setResearchStep] = useState(-1);

  // Think mode animation
  const [showThinking, setShowThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showNewMsgBtn, setShowNewMsgBtn] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/"); return; }
    setConversations(getConversations());
  }, [authLoading, user]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
    localStorage.setItem("jetflows_dark", String(darkMode));
  }, [darkMode]);

  const activeConvo = conversations.find(c => c.id === activeId) || null;

  // Auto scroll
  useEffect(() => {
    if (!showNewMsgBtn) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConvo?.messages.length, streamingContent]);

  // Detect if scrolled up
  const handleScroll = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowNewMsgBtn(!atBottom && isLoading);
  }, [isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowNewMsgBtn(false);
  };

  const modelLabel = MODEL_PILLS.find(m => m.id === selectedModel)?.label || "AI";

  const handleSend = useCallback(async (
    text: string,
    opts: { responseMode: string; thinkMode: string; tone: string; webEnabled: boolean; researchMode: boolean; file?: File }
  ) => {
    if (isLoading) return;
    if (usage >= maxUsage) {
      toast({ title: "Limit reached", description: "You've used all free requests.", variant: "destructive" });
      return;
    }

    const category = detectCategory(text);
    const speed = category.speedMode;
    const model = resolveGatewayModel(selectedModel === "claude" ? "claude-sonnet-4.5" : selectedModel === "gpt4o" ? "gpt-4.1" : selectedModel === "gemini" ? "gemini-flash" : selectedModel === "deepseek" ? "deepseek-r1" : selectedModel === "grok" ? "grok-3" : selectedModel === "llama" ? "llama-4" : "auto", speed);

    let convoId = activeId;
    if (!convoId) {
      const convo = createConversation(category.id);
      convoId = convo.id;
      setActiveId(convo.id);
    }

    // Build message content with persona prefix
    const persona = getPersonaById(activePersona);
    let finalPrompt = text;
    if (opts.researchMode) {
      finalPrompt = RESEARCH_PREPEND + text;
    }

    addMessage(convoId, "user", text, category.id, speed);
    setConversations(getConversations());
    setIsLoading(true);
    setStreamingContent("");

    // Think mode animation
    if (opts.thinkMode === "think") {
      setShowThinking(true);
      await new Promise(r => setTimeout(r, 1500));
      setShowThinking(false);
    }

    // Research progress
    if (opts.researchMode) {
      let step = 0;
      setResearchStep(0);
      const interval = setInterval(() => {
        step++;
        if (step < RESEARCH_STEPS.length) setResearchStep(step);
        else clearInterval(interval);
      }, 1500);
    }

    const updatedConvo = getConversations().find(c => c.id === convoId);
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
        setResearchStep(-1);
      },
      () => {
        updateLastAssistantMessage(convoId!, fullContent);
        incrementUsage();
        setUsage(prev => prev + 1);
        setConversations(getConversations());
        setStreamingContent("");
        setIsLoading(false);
        setResearchStep(-1);

        // Auto-open right panel for research
        if (opts.researchMode && fullContent) {
          setResearchContent(fullContent);
          setRightPanelOpen(true);
        }
      },
      (error) => {
        updateLastAssistantMessage(convoId!, `Error: ${error}`);
        setConversations(getConversations());
        setStreamingContent("");
        setIsLoading(false);
        setResearchStep(-1);
        toast({ title: "AI Error", description: error, variant: "destructive" });
      },
    );
  }, [isLoading, activeId, toast, selectedModel, usage, activePersona]);

  const handleDelete = (id: string) => {
    const convo = conversations.find(c => c.id === id);
    if (convo) {
      setDeletedConvos(prev => [convo, ...prev].slice(0, 10));
    }
    deleteConversation(id);
    if (activeId === id) setActiveId(null);
    setConversations(getConversations());
  };

  const handleRestore = (id: string) => {
    const convo = deletedConvos.find(c => c.id === id);
    if (!convo) return;
    // Re-add to localStorage
    const all = getConversations();
    all.unshift(convo);
    localStorage.setItem("jetflows_conversations", JSON.stringify(all));
    setDeletedConvos(prev => prev.filter(c => c.id !== id));
    setConversations(getConversations());
  };

  const handleLogout = async () => { await signOut(); navigate("/"); };
  const handleNewChat = () => { setActiveId(null); setShowMobileSidebar(false); };

  const displayMessages = activeConvo?.messages.map((msg, i) => {
    if (isLoading && streamingContent && i === activeConvo.messages.length - 1 && msg.role === "assistant") {
      return { ...msg, content: streamingContent };
    }
    return msg;
  }) || [];

  // Skeleton loader
  const SkeletonRows = () => (
    <div className="space-y-3 p-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-8 h-8 rounded-lg bg-secondary" />
          <div className="flex-1">
            <div className="h-3 bg-secondary rounded w-3/4 mb-1.5" />
            <div className="h-2 bg-secondary/60 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden" style={{ fontFamily: "var(--font-ui)" }}>
      {/* Mobile sidebar overlay */}
      {isMobile && showMobileSidebar && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowMobileSidebar(false)} />
      )}

      {/* Sidebar */}
      {isMobile ? (
        showMobileSidebar && (
          <div className="fixed left-0 top-0 bottom-0 z-50">
            <ChatSidebar
              conversations={conversations}
              activeId={activeId}
              onSelect={(id) => { setActiveId(id); setShowMobileSidebar(false); }}
              onNew={() => { handleNewChat(); setShowMobileSidebar(false); }}
              onDelete={handleDelete}
              onLogout={handleLogout}
              collapsed={false}
              onToggleCollapse={() => setShowMobileSidebar(false)}
              usage={usage}
              maxUsage={maxUsage}
              activePersona={activePersona}
              onPersonaChange={setActivePersona}
              darkMode={darkMode}
              onToggleDark={() => setDarkMode(!darkMode)}
              deletedConvos={deletedConvos}
              onRestore={handleRestore}
            />
          </div>
        )
      ) : (
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={handleNewChat}
          onDelete={handleDelete}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          usage={usage}
          maxUsage={maxUsage}
          activePersona={activePersona}
          onPersonaChange={setActivePersona}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(!darkMode)}
          deletedConvos={deletedConvos}
          onRestore={handleRestore}
        />
      )}

      {/* Center panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-background/80 backdrop-blur-sm">
          {isMobile && (
            <button onClick={() => setShowMobileSidebar(true)} className="text-muted-foreground hover:text-foreground">
              <Menu className="h-5 w-5" />
            </button>
          )}
          <div className="flex-1 overflow-hidden">
            <ModelPillBar selected={selectedModel} onChange={setSelectedModel} />
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {activePersona !== "general" && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-primary/30 text-primary bg-primary/5">
                Mode: {getPersonaById(activePersona).label}
              </span>
            )}
            <Zap className="h-4 w-4 text-primary" />
          </div>
        </div>

        {/* Chat area */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-6"
        >
          {!activeConvo || activeConvo.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-lg px-4">
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-ui)" }}>
                  AI Life Operating System
                </h2>
                <p className="text-muted-foreground mb-6 text-sm" style={{ fontFamily: "var(--font-chat)" }}>
                  Pick a category or just type anything. Smart routing handles the rest.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        const convo = createConversation(cat.id);
                        setConversations(getConversations());
                        setActiveId(convo.id);
                      }}
                      className="glass gold-border rounded-xl p-3 text-center hover:scale-105 transition-transform group"
                    >
                      <cat.icon className="h-5 w-5 mx-auto mb-1 group-hover:scale-110 transition-transform" style={{ color: cat.color }} />
                      <div className="text-xs font-medium">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-5">
              {displayMessages.map((msg, i) => (
                <ChatMessage
                  key={msg.id}
                  msg={msg}
                  modelId={selectedModel}
                  isStreaming={isLoading && i === displayMessages.length - 1 && msg.role === "assistant"}
                  onCopy={() => toast({ title: "✅ Copied to clipboard" })}
                  onOpenArtifact={(code) => { setArtifactCode(code); setRightPanelOpen(true); }}
                />
              ))}

              {/* Think mode animation */}
              {showThinking && (
                <div className="flex justify-start animate-msg-in">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-lg">🧠</span>
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {isLoading && !streamingContent && !showThinking && researchStep < 0 && (
                <div className="flex justify-start animate-msg-in">
                  <div className="flex gap-1.5 px-4 py-3">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {/* Research progress */}
              {researchStep >= 0 && (
                <div className="flex justify-start animate-msg-in">
                  <div className="space-y-1.5">
                    {RESEARCH_STEPS.slice(0, researchStep + 1).map((step, i) => (
                      <div key={i} className={`text-sm ${i === researchStep ? "text-foreground animate-pulse" : "text-muted-foreground"}`}>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* New message button */}
        {showNewMsgBtn && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs shadow-lg z-10 hover:bg-primary/90"
          >
            ↓ New message
          </button>
        )}

        {/* Input */}
        <InputToolbar
          modelLabel={modelLabel}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>

      {/* Right panel */}
      <RightPanel
        open={rightPanelOpen}
        onClose={() => setRightPanelOpen(false)}
        artifactCode={artifactCode}
        researchContent={researchContent}
        isMobile={isMobile}
      />
    </div>
  );
};

export default Dashboard;
