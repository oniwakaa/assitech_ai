// Leads API route for solar panel quotation chatbot
// This file will contain the API endpoints for handling lead data and conversation history storage in Supabase

import { NextRequest, NextResponse } from "next/server";

// Basic API route structure - minimal implementation to satisfy Next.js requirements
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Leads API endpoint" });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "POST method available" });
}
