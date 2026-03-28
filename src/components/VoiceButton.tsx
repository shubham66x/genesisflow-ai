import { useState, useRef, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

const VoiceButton = ({ onTranscript, disabled }: VoiceButtonProps) => {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleListening = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) onTranscript(transcript);
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, onTranscript]);

  return (
    <motion.button
      onClick={toggleListening}
      disabled={disabled}
      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all disabled:opacity-50 ${
        listening
          ? "bg-destructive text-destructive-foreground"
          : "glass gold-border text-muted-foreground hover:text-foreground"
      }`}
      animate={listening ? { scale: [1, 1.1, 1] } : {}}
      transition={listening ? { repeat: Infinity, duration: 1 } : {}}
    >
      {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </motion.button>
  );
};

export default VoiceButton;
