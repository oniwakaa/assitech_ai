import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Leads API endpoint" });
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { name, email } = body;

    // Validate inputs
    if (!name || !email) {
      return NextResponse.json(
        { error: "Nome e email sono richiesti" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Inserisci un indirizzo email valido" },
        { status: 400 },
      );
    }

    // Insert into Supabase leads table
    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Errore durante il salvataggio dei dati" },
        { status: 500 },
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Lead salvato con successo",
        data: data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 },
    );
  }
}
