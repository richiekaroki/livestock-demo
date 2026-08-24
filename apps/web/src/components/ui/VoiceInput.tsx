import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language?: "en-US" | "sw-KE";
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export default function VoiceInput({
  onTranscript,
  language = "en-US",
  className = "",
  disabled = false,
}: VoiceInputProps) {
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setIsSupported(false);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        onTranscript(finalTranscript);
      } else if (interimTranscript) {
        setTranscript(interimTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript("");
  }, [isListening, language, onTranscript]);

  if (!isSupported) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
          isListening
            ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
            : "bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isListening ? t("Stop recording", "Stop recording") : t("Start voice input", "Start voice input")}
        aria-label={isListening ? t("Stop recording", "Stop recording") : t("Start voice input", "Start voice input")}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
        {isListening && (
          <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75" />
        )}
      </button>
      {transcript && (
        <span className="text-sm text-[var(--color-text-secondary)] truncate max-w-[200px]">
          "{transcript}"
        </span>
      )}
    </div>
  );
}
