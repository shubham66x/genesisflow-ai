import {
  Briefcase,
  Brain,
  Palette,
  Search,
  UtensilsCrossed,
  Code2,
  GraduationCap,
  DollarSign,
  MessageCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  examples: string[];
  speedMode: "fast" | "balanced" | "deep";
}

export const CATEGORIES: Category[] = [
  {
    id: "productivity",
    label: "Productivity",
    icon: Briefcase,
    color: "hsl(43, 100%, 50%)",
    examples: ["Plan my day", "Create a focus schedule", "Build a habit tracker"],
    speedMode: "fast",
  },
  {
    id: "business",
    label: "Business",
    icon: Briefcase,
    color: "hsl(160, 70%, 45%)",
    examples: ["Startup idea validation", "Sales script", "Market research"],
    speedMode: "balanced",
  },
  {
    id: "creativity",
    label: "Creativity",
    icon: Palette,
    color: "hsl(280, 70%, 55%)",
    examples: ["Write a blog post", "Social media caption", "Story outline"],
    speedMode: "balanced",
  },
  {
    id: "research",
    label: "Research",
    icon: Search,
    color: "hsl(210, 90%, 55%)",
    examples: ["Deep analysis on a topic", "Compare two technologies", "Learning guide"],
    speedMode: "deep",
  },
  {
    id: "daily_life",
    label: "Daily Life",
    icon: UtensilsCrossed,
    color: "hsl(25, 90%, 55%)",
    examples: ["Meal plan for the week", "Fitness routine", "Travel itinerary"],
    speedMode: "fast",
  },
  {
    id: "coding",
    label: "Coding",
    icon: Code2,
    color: "hsl(150, 80%, 40%)",
    examples: ["Debug my code", "Generate an API", "Automation script"],
    speedMode: "balanced",
  },
  {
    id: "learning",
    label: "Learning",
    icon: GraduationCap,
    color: "hsl(45, 95%, 50%)",
    examples: ["Explain quantum physics", "Exam prep guide", "Step-by-step tutorial"],
    speedMode: "balanced",
  },
  {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    color: "hsl(120, 60%, 45%)",
    examples: ["Monthly budget plan", "Saving strategy", "Investment basics"],
    speedMode: "fast",
  },
  {
    id: "communication",
    label: "Communication",
    icon: MessageCircle,
    color: "hsl(330, 70%, 55%)",
    examples: ["Draft a professional email", "Negotiation script", "Conversation tips"],
    speedMode: "fast",
  },
  {
    id: "general",
    label: "General",
    icon: Sparkles,
    color: "hsl(200, 70%, 55%)",
    examples: ["Quick question", "Fun fact", "Random advice"],
    speedMode: "fast",
  },
];

// Smart model routing based on detected category and complexity
export type SpeedMode = "fast" | "balanced" | "deep";

export const SPEED_MODEL_MAP: Record<SpeedMode, string> = {
  fast: "google/gemini-2.5-flash-lite",
  balanced: "google/gemini-3-flash-preview",
  deep: "google/gemini-2.5-pro",
};

export function detectCategory(input: string): Category {
  const lower = input.toLowerCase();

  const keywords: Record<string, string[]> = {
    productivity: ["plan", "schedule", "habit", "focus", "time block", "reminder", "organize", "todo", "routine"],
    business: ["startup", "market", "sales", "brand", "monetize", "revenue", "customer", "pitch", "strategy"],
    creativity: ["write", "story", "blog", "content", "caption", "script", "creative", "poem", "design"],
    research: ["analyze", "compare", "research", "study", "report", "summarize", "explain in detail", "deep dive"],
    daily_life: ["cook", "meal", "recipe", "fitness", "workout", "travel", "health", "diet", "exercise"],
    coding: ["code", "debug", "api", "function", "programming", "javascript", "python", "automate", "deploy", "error", "bug"],
    learning: ["learn", "teach", "explain", "exam", "study guide", "tutorial", "concept", "course"],
    finance: ["budget", "save", "invest", "expense", "money", "financial", "tax", "income"],
    communication: ["email", "negotiate", "conversation", "letter", "message", "reply", "professional"],
    general: [],
  };

  for (const [catId, words] of Object.entries(keywords)) {
    if (words.some((w) => lower.includes(w))) {
      return CATEGORIES.find((c) => c.id === catId) || CATEGORIES[CATEGORIES.length - 1];
    }
  }

  return CATEGORIES[CATEGORIES.length - 1]; // general
}

export function getSmartModel(category: Category, inputLength: number): { model: string; speed: SpeedMode } {
  // Override for long inputs → deep model
  if (inputLength > 500) {
    return { model: SPEED_MODEL_MAP.deep, speed: "deep" };
  }

  // Short simple queries → always fast
  if (inputLength < 50 && category.speedMode !== "deep") {
    return { model: SPEED_MODEL_MAP.fast, speed: "fast" };
  }

  return { model: SPEED_MODEL_MAP[category.speedMode], speed: category.speedMode };
}
