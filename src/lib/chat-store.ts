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

  if (convo.messages.filter((m) => m.role === "user").length === 1 && role === "user") {
    convo.title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
  }

  convo.updatedAt = Date.now();
  saveConversations(all);
  return convo;
}

export function updateLastAssistantMessage(convoId: string, content: string) {
  const all = getConversations();
  const convo = all.find((c) => c.id === convoId);
  if (!convo) return;
  for (let i = convo.messages.length - 1; i >= 0; i--) {
    if (convo.messages[i].role === "assistant") {
      convo.messages[i].content = content;
      break;
    }
  }
  convo.updatedAt = Date.now();
  saveConversations(all);
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

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export async function streamAIResponse(
  messages: Message[],
  model: AIModel,
  onDelta: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        model,
      }),
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({ error: "Request failed" }));
      onError(errData.error || `Error ${resp.status}`);
      return;
    }

    if (!resp.body) {
      onError("No response stream");
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Flush remaining buffer
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  } catch (e) {
    onError(e instanceof Error ? e.message : "Connection failed");
  }
}
