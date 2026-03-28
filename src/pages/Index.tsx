import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion, useInView } from "framer-motion";
import {
  Zap, ArrowRight, Check, Star, Brain, Cpu, Rocket, Shield,
  Briefcase, Palette, Search, Code2, GraduationCap, DollarSign,
  MessageCircle, UtensilsCrossed, Sparkles, ChevronRight,
  Timer, Layers, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";
import { CATEGORIES } from "@/lib/categories";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const scalePop = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 200, damping: 15 } },
};

const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

const slideRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

function AnimSection({ children, className = "", variants = fadeUp }: { children: React.ReactNode; className?: string; variants?: any }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={variants} className={className}>
      {children}
    </motion.div>
  );
}

const STEPS = [
  { num: "01", title: "Type or Speak", desc: "Enter your question, task, or goal in plain language.", icon: MessageCircle },
  { num: "02", title: "AI Detects Intent", desc: "Our engine identifies the category, urgency, and complexity instantly.", icon: Brain },
  { num: "03", title: "Smart Model Routing", desc: "The best AI model is selected automatically — fast, balanced, or deep.", icon: Cpu },
  { num: "04", title: "Optimized Response", desc: "You get a structured, actionable answer in seconds. No fluff.", icon: Rocket },
];

const STATS = [
  { num: "10+", label: "Life Categories" },
  { num: "<2s", label: "Fast Response" },
  { num: "3", label: "AI Models" },
  { num: "∞", label: "Possibilities" },
];

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const howItWorksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading]);

  const scrollToHow = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Orbs */}
      <div className="orb w-[400px] h-[400px] bg-primary top-20 -left-40 animate-pulse-soft" />
      <div className="orb w-[300px] h-[300px] bg-info top-[60vh] -right-32 animate-pulse-soft" style={{ animationDelay: "1.5s" }} />
      <div className="orb w-[250px] h-[250px] bg-primary bottom-40 left-1/3 animate-pulse-soft" style={{ animationDelay: "3s" }} />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-gradient-animated">JetFlows</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-muted-foreground hidden sm:inline-flex" onClick={() => setShowAuth(true)}>
              Sign In
            </Button>
            <Button className="gold-gradient text-primary-foreground font-semibold" onClick={() => setShowAuth(true)}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <AnimSection>
            <motion.div className="inline-flex items-center gap-2 px-4 py-2 rounded-full gold-border shimmer mb-8">
              <Star className="h-4 w-4 text-primary animate-wiggle" />
              <span className="text-sm text-primary font-medium">AI Life Operating System</span>
            </motion.div>
          </AnimSection>

          <AnimSection variants={{ hidden: { opacity: 0, filter: "blur(12px)" }, visible: { opacity: 1, filter: "blur(0)", transition: { duration: 0.8 } } }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Solve Any Life Problem{" "}
              <span className="text-gradient-animated">with AI</span>
            </h1>
          </AnimSection>

          <AnimSection>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              One input. Smart routing. Instant answers. From productivity to coding, finance to creativity — 
              the right AI model handles everything automatically.
            </p>
          </AnimSection>

          <AnimSection>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="gold-gradient text-primary-foreground font-semibold text-lg px-8 py-6 glow-pulse hover-lift"
                onClick={() => setShowAuth(true)}
              >
                Start Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gold-border text-foreground text-lg px-8 py-6 hover-lift"
                onClick={scrollToHow}
              >
                See How It Works
              </Button>
            </div>
          </AnimSection>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {STATS.map((s, i) => (
              <motion.div key={i} variants={scalePop} className="glass rounded-xl p-4 hover-tilt">
                <div className="text-2xl md:text-3xl font-bold text-gradient-animated">{s.num}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <AnimSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-gradient-animated">10 Life Categories</span> — One AI
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Whatever you need, just type. The system detects your goal and routes to the perfect AI model.
              </p>
            </div>
          </AnimSection>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-5 gap-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {CATEGORIES.map((cat) => (
              <motion.div
                key={cat.id}
                variants={scalePop}
                className="category-card text-center group"
                onClick={() => setShowAuth(true)}
              >
                <cat.icon className="h-7 w-7 mx-auto mb-2 transition-transform duration-300 group-hover:scale-110" style={{ color: cat.color }} />
                <div className="text-sm font-semibold">{cat.label}</div>
                <div className="text-[10px] text-muted-foreground mt-1 capitalize">{cat.speedMode} mode</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section ref={howItWorksRef} className="py-20 px-4" id="how-it-works">
        <div className="container mx-auto max-w-4xl">
          <AnimSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How <span className="text-gradient-animated">JetFlows</span> Works
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                No model selection. No complexity. Just type and get the perfect answer.
              </p>
            </div>
          </AnimSection>

          <div className="space-y-6">
            {STEPS.map((step, i) => (
              <AnimSection key={i} variants={i % 2 === 0 ? slideLeft : slideRight}>
                <div className="flex items-start gap-5 glass rounded-xl p-6 hover-lift">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl gradient-shift flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-mono mb-1">STEP {step.num}</div>
                    <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <AnimSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Speed & Intelligence</h2>
            </div>
          </AnimSection>

          <motion.div
            className="grid md:grid-cols-3 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {[
              { icon: Timer, title: "< 2 Second Responses", desc: "Fast mode delivers answers almost instantly. No waiting." },
              { icon: Layers, title: "Smart Model Routing", desc: "The right AI brain is auto-selected for every task type." },
              { icon: Shield, title: "Context Memory", desc: "Follow up endlessly. Your conversation context is preserved." },
              { icon: BarChart3, title: "Structured Output", desc: "Every response is organized, actionable, and clear." },
              { icon: Brain, title: "Multi-Model Power", desc: "Gemini, GPT-5, and specialized models working together." },
              { icon: Sparkles, title: "Zero Complexity", desc: "No model picking. No settings. Just type and go." },
            ].map((f, i) => (
              <motion.div key={i} variants={scalePop} className="glass rounded-xl p-5 hover-lift hover-glow">
                <f.icon className="h-7 w-7 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI Models Integrated */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <AnimSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Powered by <span className="text-gradient-animated">Premium AI Models</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                We intelligently route your requests to the best model for each task.
              </p>
            </div>
          </AnimSection>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 gap-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {[
              { name: "GPT-5", tag: "Deep Reasoning", color: "hsl(160, 70%, 45%)" },
              { name: "GPT-5 Mini", tag: "Balanced", color: "hsl(160, 70%, 55%)" },
              { name: "GPT-5 Nano", tag: "Ultra Fast", color: "hsl(160, 70%, 65%)" },
              { name: "Gemini Pro", tag: "Deep Analysis", color: "hsl(210, 90%, 55%)" },
              { name: "Gemini Flash", tag: "Speed King", color: "hsl(210, 80%, 65%)" },
              { name: "Gemini Lite", tag: "Lightning Fast", color: "hsl(210, 70%, 75%)" },
            ].map((m, i) => (
              <motion.div key={i} variants={scalePop} className="glass rounded-xl p-4 hover-tilt gold-border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="font-semibold text-sm">{m.name}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">{m.tag}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <AnimSection>
            <div className="glass-strong rounded-2xl p-10 gold-border glow-pulse relative overflow-hidden">
              <div className="absolute inset-0 shimmer pointer-events-none" />
              <h2 className="text-3xl font-bold mb-4 relative z-10">
                Ready to Let AI Handle Your Life?
              </h2>
              <p className="text-muted-foreground mb-8 relative z-10">
                Join the AI operating system revolution. Start solving any problem in seconds.
              </p>
              <Button
                size="lg"
                className="gold-gradient text-primary-foreground font-semibold text-lg px-10 py-6 hover-lift relative z-10"
                onClick={() => setShowAuth(true)}
              >
                Launch JetFlows <Rocket className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-muted-foreground mt-4 relative z-10">Free to start. No credit card required.</p>
            </div>
          </AnimSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-border">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-bold text-gradient-animated">JetFlows</span>
          </div>
          <p className="text-sm text-muted-foreground">2025 JetFlows — AI Life Operating System. All rights reserved.</p>
        </div>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
};

export default Index;
