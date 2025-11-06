// Chat API route for solar panel quotation chatbot
// This file will contain the API endpoint for handling chat messages and generating quotes using Ollama

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Chat message handler - implementation pending
  return NextResponse.json({ message: "Chat endpoint ready" });
}

export async function GET(request: NextRequest) {
  // Health check endpoint
  return NextResponse.json({ status: "ok" });
}
