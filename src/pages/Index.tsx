import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Brain, Shield, ArrowRight, Check, Star, MessageSquare, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold gold-text">JetFlows</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setShowAuth(true)}>
              Sign In
            </Button>
            <Button className="gold-gradient text-primary-foreground font-semibold" onClick={() => setShowAuth(true)}>
              Get Started Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full gold-border mb-8">
            <Star className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary">AI-Powered Problem Solving Engine</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Solve Any Problem with{" "}
            <span className="gold-text">Multiple AI Models</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Choose from Claude, GPT, Gemini, or Step models. Get step-by-step solutions with threaded conversations that remember your context.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gold-gradient text-primary-foreground font-semibold text-lg px-8 py-6" onClick={() => setShowAuth(true)}>
              Start Solving Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="gold-border text-foreground text-lg px-8 py-6">
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Tired of Switching Between AI Tools?</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            You open ChatGPT for one task, Claude for another, Gemini for a third. Each conversation is isolated. Context is lost. Time is wasted. There has to be a better way.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: MessageSquare, title: "Lost Context", desc: "Every new message starts from scratch. No memory, no continuity." },
              { icon: Cpu, title: "Model Lock-in", desc: "Stuck with one AI when different problems need different strengths." },
              { icon: Brain, title: "No Deep Solving", desc: "Surface-level answers when you need step-by-step problem solving." },
            ].map((item, i) => (
              <div key={i} className="glass rounded-xl p-6 text-left">
                <item.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution / Mechanism */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The <span className="gold-text">JetFlows Engine</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One interface. Four AI models. Threaded conversations with full memory. Ask follow-ups, go deeper, switch models mid-conversation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Multi-Model Selection", desc: "Choose Claude, GPT, Gemini, or Step for each conversation. Pick the best brain for the job.", icon: Cpu },
              { title: "Threaded Memory", desc: "Every reply builds on the last. Ask follow-ups endlessly on the same topic without losing context.", icon: MessageSquare },
              { title: "Step-by-Step Solving", desc: "Get detailed, structured solutions that walk you through complex problems piece by piece.", icon: Brain },
              { title: "100 Free Requests", desc: "Start with 100 free requests per month. No credit card required. Upgrade when you need more.", icon: Shield },
            ].map((item, i) => (
              <div key={i} className="glass rounded-xl p-6 flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg gold-gradient flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-10">Why Professionals Choose JetFlows</h2>
          <div className="space-y-4 text-left">
            {[
              "Access 4 leading AI models from a single dashboard",
              "Threaded conversations that remember everything you discussed",
              "Switch models mid-conversation to get different perspectives",
              "Clean, formatted responses without messy markdown",
              "100 free requests every month, no strings attached",
              "Step-by-step problem solving for complex challenges",
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3 glass rounded-lg p-4">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="glass-strong rounded-2xl p-10 gold-border gold-glow">
            <h2 className="text-3xl font-bold mb-4">Ready to Solve Smarter?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of professionals who use JetFlows to solve problems faster with AI. Start free today.
            </p>
            <Button size="lg" className="gold-gradient text-primary-foreground font-semibold text-lg px-10 py-6" onClick={() => setShowAuth(true)}>
              Start Solving Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">100 free requests/month. No credit card required.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-border">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-bold gold-text">JetFlows</span>
          </div>
          <p className="text-sm text-muted-foreground">2024 JetFlows AI Solver. All rights reserved.</p>
        </div>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
};

export default Index;
