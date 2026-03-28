export interface AIModel {
  id: string;
  label: string;
  group: string;
  gatewayModel: string;
  speed: "fast" | "balanced" | "deep";
  color: string;
}

export const AI_MODELS: AIModel[] = [
  { id: "auto", label: "Auto (Recommended)", group: "Smart", gatewayModel: "auto", speed: "balanced", color: "hsl(43, 100%, 50%)" },

  // GPT
  { id: "gpt-4.1", label: "GPT-4.1 (Balanced)", group: "GPT", gatewayModel: "openai/gpt-5", speed: "balanced", color: "hsl(160, 70%, 45%)" },
  { id: "gpt-4o-mini", label: "GPT-4o-mini (Fast)", group: "GPT", gatewayModel: "openai/gpt-5-nano", speed: "fast", color: "hsl(160, 70%, 55%)" },

  // Claude
  { id: "claude-opus-4.5", label: "Claude Opus 4.5 (Deep)", group: "Claude", gatewayModel: "google/gemini-2.5-pro", speed: "deep", color: "hsl(270, 70%, 55%)" },
  { id: "claude-sonnet-4.5", label: "Claude Sonnet 4.5 (Balanced)", group: "Claude", gatewayModel: "openai/gpt-5-mini", speed: "balanced", color: "hsl(270, 60%, 65%)" },

  // Gemini
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro (Long Context)", group: "Gemini", gatewayModel: "google/gemini-2.5-pro", speed: "deep", color: "hsl(210, 90%, 55%)" },
  { id: "gemini-flash", label: "Gemini Flash (Fast)", group: "Gemini", gatewayModel: "google/gemini-2.5-flash", speed: "fast", color: "hsl(210, 80%, 65%)" },

  // Grok
  { id: "grok-3", label: "Grok-3 (Fast)", group: "Grok", gatewayModel: "openai/gpt-5-nano", speed: "fast", color: "hsl(0, 0%, 70%)" },
  { id: "grok-4.1", label: "Grok-4.1 (Advanced)", group: "Grok", gatewayModel: "openai/gpt-5", speed: "deep", color: "hsl(0, 0%, 55%)" },

  // DeepSeek
  { id: "deepseek-v3", label: "DeepSeek V3 (Balanced)", group: "DeepSeek", gatewayModel: "google/gemini-3-flash-preview", speed: "balanced", color: "hsl(45, 80%, 55%)" },
  { id: "deepseek-r1", label: "DeepSeek R1 (Reasoning)", group: "DeepSeek", gatewayModel: "google/gemini-2.5-pro", speed: "deep", color: "hsl(45, 70%, 45%)" },

  // Meta
  { id: "llama-4", label: "LLaMA 4 (Creative/Open)", group: "Meta", gatewayModel: "google/gemini-3-flash-preview", speed: "balanced", color: "hsl(200, 60%, 50%)" },
];

export function getModelById(id: string): AIModel {
  return AI_MODELS.find(m => m.id === id) || AI_MODELS[0];
}

export function resolveGatewayModel(modelId: string, categorySpeed: "fast" | "balanced" | "deep"): string {
  if (modelId === "auto") {
    const speedMap: Record<string, string> = {
      fast: "google/gemini-2.5-flash-lite",
      balanced: "google/gemini-3-flash-preview",
      deep: "google/gemini-2.5-pro",
    };
    return speedMap[categorySpeed] || speedMap.balanced;
  }
  const model = getModelById(modelId);
  return model.gatewayModel;
}
