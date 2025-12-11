import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    // Create participants table
    await sql`
      CREATE TABLE IF NOT EXISTS participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        photo_url VARCHAR(500),
        artist_1 VARCHAR(255) NOT NULL,
        artist_2 VARCHAR(255) NOT NULL,
        artist_3 VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create game_sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player_id UUID REFERENCES participants(id) ON DELETE CASCADE,
        card_order JSONB NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(player_id)
      )
    `;

    // Create guesses table
    await sql`
      CREATE TABLE IF NOT EXISTS guesses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
        card_participant_id UUID REFERENCES participants(id),
        guessed_participant_id UUID REFERENCES participants(id),
        card_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(session_id, card_participant_id)
      )
    `;

    return NextResponse.json({
      success: true,
      message: "Base de dados inicializada com sucesso!"
    });
  } catch (error) {
    console.error("Init error:", error);
    return NextResponse.json(
      { error: "Erro ao inicializar base de dados", details: String(error) },
      { status: 500 }
    );
  }
}
