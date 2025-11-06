"use client";

import { useState, useCallback, useRef } from "react";

// Type definitions
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface UseStreamChatReturn {
  messages: ChatMessage[];
  sendMessage: (message: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Hook for managing streaming chat
export function useStreamChat(): UseStreamChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Send message function
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || loading) return;

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      // Add user message to chat immediately
      const userMessage: ChatMessage = {
        role: "user",
        content: message.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        // Prepare conversation history (exclude the current message for now)
        const conversationHistory = messages;

        // Make request to streaming API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message.trim(),
            conversationHistory: conversationHistory,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        // Set up streaming
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let assistantMessage: ChatMessage = {
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
        };

        // Add initial empty assistant message to show streaming
        setMessages((prev) => [...prev, assistantMessage]);

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((line) => line.trim());

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6)); // Remove 'data: ' prefix

                switch (data.type) {
                  case "chunk":
                    // Update the last message (assistant) with streaming content
                    setMessages((prev) => {
                      const updated = [...prev];
                      const lastIndex = updated.length - 1;

                      if (
                        updated[lastIndex] &&
                        updated[lastIndex].role === "assistant"
                      ) {
                        updated[lastIndex] = {
                          ...updated[lastIndex],
                          content: data.fullResponse,
                        };
                      }

                      return updated;
                    });
                    break;

                  case "complete":
                    // Replace the last message with the final complete message
                    setMessages((prev) => {
                      const updated = [...prev];
                      const lastIndex = updated.length - 1;

                      if (
                        updated[lastIndex] &&
                        updated[lastIndex].role === "assistant"
                      ) {
                        updated[lastIndex] = data.message;
                      }

                      return updated;
                    });
                    break;

                  case "user_message":
                    // The user message was already added, but this ensures it's in the final history
                    break;

                  case "error":
                    throw new Error(data.error || "Stream error");
                }
              } catch (parseError) {
                console.warn("Failed to parse SSE data:", parseError);
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Request was cancelled, don't show error
          return;
        }

        console.error("Chat error:", error);
        setError(
          error instanceof Error ? error.message : "Failed to send message",
        );

        // Remove the placeholder assistant message on error
        setMessages((prev) => {
          const updated = [...prev];
          if (
            updated.length > 0 &&
            updated[updated.length - 1].role === "assistant"
          ) {
            // If the last message is empty or has minimal content, remove it
            const lastMessage = updated[updated.length - 1];
            if (!lastMessage.content || lastMessage.content.trim() === "") {
              updated.pop();
            }
          }
          return updated;
        });
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, loading],
  );

  // Cleanup function to abort any ongoing requests
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Return the hook interface
  return {
    messages,
    sendMessage,
    loading,
    error,
  };
}
