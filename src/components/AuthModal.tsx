import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal = ({ onClose }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store user session in localStorage for now
    const user = { email, id: crypto.randomUUID(), usage: 0, maxUsage: 100 };
    localStorage.setItem("jetflows_user", JSON.stringify(user));
    navigate("/dashboard");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="glass-strong rounded-2xl p-8 w-full max-w-md gold-border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-bold gold-text text-lg">JetFlows</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <h2 className="text-xl font-bold mb-2">{isLogin ? "Welcome Back" : "Create Account"}</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {isLogin ? "Sign in to continue solving with AI" : "Start with 100 free AI requests per month"}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-secondary border-border"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-secondary border-border"
          />
          <Button type="submit" className="w-full gold-gradient text-primary-foreground font-semibold">
            {isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>
        <p className="text-sm text-center text-muted-foreground mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
