"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useStreamChat } from "@/lib/useStreamChat";
import { WebGLShader } from "@/components/ui/web-gl-shader";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Paperclip, ArrowUpIcon, Send } from "lucide-react";

interface AutoResizeProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: AutoResizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`; // reset first
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Infinity),
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight],
  );

  useEffect(() => {
    if (textareaRef.current)
      textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

export default function ChatbotPage() {
  const { messages, sendMessage, loading, error } = useStreamChat();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 150,
  });

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending message
  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const messageToSend = message.trim();
    setMessage("");
    adjustHeight(true);

    await sendMessage(messageToSend);
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* WebGL Shader Background */}
      <WebGLShader />

      {/* Chat Container */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-semibold text-white drop-shadow-sm">
              Assitech AI
            </h1>
            <p className="mt-2 text-neutral-200">
              Il tuo assistente intelligente per preventivi di pannelli solari
            </p>
          </div>
        </div>

        {/* Messages Display Area */}
        <div className="flex-1 w-full max-w-4xl mx-auto px-4 mb-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-neutral-300 mt-8">
                <p>
                  Inizia una conversazione descrivendo la tua casa o azienda per
                  ricevere un preventivo personalizzato.
                </p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] px-4 py-3 rounded-xl backdrop-blur-md border",
                    msg.role === "user"
                      ? "bg-blue-600/80 border-blue-500/50 text-white"
                      : "bg-black/60 border-neutral-700 text-neutral-100",
                  )}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {msg.content}
                  </div>
                  {msg.timestamp && (
                    <div
                      className={cn(
                        "text-xs mt-2 opacity-70",
                        msg.role === "user"
                          ? "text-blue-200"
                          : "text-neutral-400",
                      )}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-black/60 backdrop-blur-md border border-neutral-700 text-neutral-100 px-4 py-3 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-neutral-400">
                      Assistente sta scrivendo...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex justify-center">
                <div className="bg-red-600/80 backdrop-blur-md border border-red-500/50 text-white px-4 py-3 rounded-xl max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-300 rounded-full"></div>
                    <span className="text-sm">Errore: {error}</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="w-full max-w-3xl mx-auto px-4 pb-8">
          <div className="relative bg-black/60 backdrop-blur-md rounded-xl border border-neutral-700">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyPress}
              placeholder="Descrivi la tua casa o azienda per ricevere un preventivo personalizzato..."
              className={cn(
                "w-full px-4 py-3 resize-none border-none",
                "bg-transparent text-white text-sm",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-neutral-400 min-h-[48px]",
              )}
              style={{ overflow: "hidden" }}
              disabled={loading}
            />

            {/* Footer Buttons */}
            <div className="flex items-center justify-between p-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-neutral-700"
                disabled={loading}
              >
                <Paperclip className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || loading}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                    !message.trim() || loading
                      ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white",
                  )}
                >
                  <Send className="w-4 h-4" />
                  <span className="sr-only">Invia</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
