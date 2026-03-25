export type AIModel = "claude" | "gpt" | "gemini" | "step";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: AIModel;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  model: AIModel;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "jetflows_conversations";
const USER_KEY = "jetflows_user";

export function getConversations(): Conversation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveConversations(convos: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convos));
}

export function createConversation(model: AIModel): Conversation {
  const convo: Conversation = {
    id: crypto.randomUUID(),
    title: "New Conversation",
    model,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const all = getConversations();
  all.unshift(convo);
  saveConversations(all);
  return convo;
}

export function addMessage(convoId: string, role: "user" | "assistant", content: string, model?: AIModel): Conversation | null {
  const all = getConversations();
  const convo = all.find((c) => c.id === convoId);
  if (!convo) return null;

  convo.messages.push({
    id: crypto.randomUUID(),
    role,
    content,
    model,
    timestamp: Date.now(),
  });

  // Auto-title from first user message
  if (convo.messages.filter((m) => m.role === "user").length === 1 && role === "user") {
    convo.title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
  }

  convo.updatedAt = Date.now();
  saveConversations(all);
  return convo;
}

export function deleteConversation(convoId: string) {
  const all = getConversations().filter((c) => c.id !== convoId);
  saveConversations(all);
}

export function getUser() {
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function incrementUsage() {
  const user = getUser();
  if (user) {
    user.usage = (user.usage || 0) + 1;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  return user;
}

export const MODEL_INFO: Record<AIModel, { name: string; description: string; color: string }> = {
  claude: { name: "Claude", description: "Anthropic's reasoning model", color: "hsl(25, 90%, 55%)" },
  gpt: { name: "GPT", description: "OpenAI's versatile model", color: "hsl(160, 70%, 45%)" },
  gemini: { name: "Gemini", description: "Google's multimodal model", color: "hsl(210, 90%, 55%)" },
  step: { name: "Step", description: "Step AI's analytical model", color: "hsl(280, 70%, 55%)" },
};

// Simulated AI response (will be replaced with real API calls via Lovable Cloud)
export async function getAIResponse(messages: Message[], model: AIModel): Promise<string> {
  // Simulate processing delay
  await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));

  const lastMsg = messages[messages.length - 1]?.content || "";
  const modelName = MODEL_INFO[model].name;
  const msgCount = messages.length;

  // Context-aware simulated response
  if (msgCount <= 2) {
    return `Thank you for your question. I am ${modelName}, and I will help you work through this step by step.\n\nBased on what you have shared about "${lastMsg.slice(0, 60)}", here is my initial analysis:\n\n1. First, let us break down the core elements of your question.\n2. Then we will explore the most effective approach.\n3. Finally, I will provide actionable recommendations.\n\nLet me start with the first point. The key consideration here is understanding the underlying factors at play. Would you like me to go deeper into any specific aspect, or shall I continue with the full breakdown?`;
  }

  return `Building on our previous discussion, here is the next layer of analysis.\n\nConsidering everything we have covered so far across our ${Math.floor(msgCount / 2)} exchanges, the pattern that emerges is quite clear.\n\nHere are the key insights for this stage:\n\n1. The approach we discussed earlier connects directly to this next step.\n2. There are additional factors worth considering that strengthen our solution.\n3. The practical application would look something like this in your specific situation.\n\nI am keeping full context of our conversation, so feel free to ask follow-up questions, request clarification on any point, or steer the discussion in a new direction. What would you like to explore next?`;
}
