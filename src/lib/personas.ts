export interface Persona {
  id: string;
  label: string;
  emoji: string;
  systemPrompt: string;
}

export const PERSONAS: Persona[] = [
  { id: "general", label: "General", emoji: "💬", systemPrompt: "You are a helpful, balanced assistant." },
  { id: "researcher", label: "Researcher", emoji: "🔬", systemPrompt: "You are a rigorous research assistant. Think critically and challenge assumptions." },
  { id: "coder", label: "Coder", emoji: "💻", systemPrompt: "You are a senior software engineer. Write clean, production-ready code with comments." },
  { id: "writer", label: "Writer", emoji: "✍️", systemPrompt: "You are a professional writer and editor. Use clear structure and vivid language." },
  { id: "analyst", label: "Analyst", emoji: "📊", systemPrompt: "You are a data analyst. Use data, metrics, and structured comparisons in all responses." },
];

export function getPersonaById(id: string): Persona {
  return PERSONAS.find(p => p.id === id) || PERSONAS[0];
}
