import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORY_PROMPTS: Record<string, string> = {
  productivity: "You are an expert productivity coach. Give actionable plans, time blocks, and clear steps. Keep it structured with numbered lists.",
  business: "You are a startup advisor and business strategist. Provide market-ready strategies, clear frameworks, and actionable business advice.",
  creativity: "You are a creative director and content strategist. Generate compelling, original content with strong hooks and clear structure.",
  research: "You are a senior research analyst. Provide deep, well-structured analysis with clear sections, comparisons, and evidence-based insights.",
  daily_life: "You are a lifestyle optimization expert. Give practical, easy-to-follow advice for cooking, fitness, health, and daily routines.",
  coding: "You are a senior software engineer. Provide clean, working code with brief explanations. Use code blocks. Fix bugs precisely.",
  learning: "You are a world-class teacher. Explain concepts simply with analogies, step-by-step breakdowns, and practical examples.",
  finance: "You are a personal finance advisor. Give clear budgets, saving strategies, and practical financial guidance with specific numbers.",
  communication: "You are a communication expert. Draft professional, persuasive content with the right tone and clear structure.",
  general: "You are a versatile AI assistant. Give clear, concise, actionable answers.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, category, speed, model } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS.general;
    const gatewayModel = model || "google/gemini-3-flash-preview";

    // Speed-based instructions
    const speedInstruction = speed === "fast"
      ? " Be extremely concise. Answer in under 100 words. No fluff."
      : speed === "deep"
      ? " Be thorough and comprehensive. Use sections with clear headers. Provide complete analysis."
      : " Be clear and structured. Balance depth with brevity.";

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: gatewayModel,
          messages: [
            {
              role: "system",
              content: systemPrompt + speedInstruction + "\n\nAlways structure your response with:\n1. A brief understanding of the request (1 line)\n2. The main answer (clear, actionable)\n3. Optional: Next steps or improvements\n\nUse markdown formatting for readability.",
            },
            ...messages.map((m: { role: string; content: string }) => ({
              role: m.role,
              content: m.content,
            })),
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
