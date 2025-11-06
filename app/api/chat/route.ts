import { NextRequest } from "next/server";

// Type definitions for the request and message structure
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface ChatRequest {
  message: string;
  conversationHistory: ChatMessage[];
}

// Ollama API client
const OLLAMA_BASE_URL = "http://localhost:11434";
const OLLAMA_MODEL = "gpt-oss:20b-cloud";

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory }: ChatRequest = await request.json();

    if (!message || typeof message !== "string") {
      return new Response("Invalid message", { status: 400 });
    }

    // Prepare the conversation for Ollama
    const messages = [
      ...(conversationHistory || []),
      { role: "user", content: message },
    ];

    // Create a ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial connection event
          controller.enqueue(
            new TextEncoder().encode(
              'data: {"type":"connection","status":"connected"}\n\n',
            ),
          );

          // Stream the response from Ollama
          const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: OLLAMA_MODEL,
              messages: messages,
              stream: true,
              options: {
                temperature: 0.7,
                top_k: 50,
                top_p: 0.9,
              },
            }),
          });

          if (!response.ok) {
            throw new Error(
              `Ollama API error: ${response.status} ${response.statusText}`,
            );
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("No response body from Ollama");
          }

          let fullResponse = "";

          // Read the stream from Ollama
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            // Parse the streaming response from Ollama
            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split("\n").filter((line) => line.trim());

            for (const line of lines) {
              try {
                const data = JSON.parse(line);

                if (data.message && data.message.content) {
                  const content = data.message.content;
                  fullResponse += content;

                  // Send the chunk to the client
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({
                        type: "chunk",
                        content: content,
                        fullResponse: fullResponse,
                      })}\n\n`,
                    ),
                  );
                }

                // Check if the response is complete
                if (data.done) {
                  const finalMessage: ChatMessage = {
                    role: "assistant",
                    content: fullResponse,
                    timestamp: new Date().toISOString(),
                  };

                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({
                        type: "complete",
                        message: finalMessage,
                      })}\n\n`,
                    ),
                  );
                  break;
                }
              } catch (parseError) {
                // Skip malformed JSON lines
                continue;
              }
            }
          }

          // Send the final user message as well
          const userMessage: ChatMessage = {
            role: "user",
            content: message,
            timestamp: new Date().toISOString(),
          };

          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({
                type: "user_message",
                message: userMessage,
              })}\n\n`,
            ),
          );
        } catch (error) {
          console.error("Streaming error:", error);

          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({
                type: "error",
                error:
                  error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
              })}\n\n`,
            ),
          );
        } finally {
          controller.close();
        }
      },
    });

    // Return the stream with proper SSE headers
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
