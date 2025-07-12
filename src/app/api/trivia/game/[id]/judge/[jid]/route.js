import pool, { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id, jid } = await params;

  try {
   
  const gameData = await query(
    `
    SELECT 
        tg.*, 
        COALESCE(u1.name, NULL) AS created_by_name
    FROM trivia_game tg
    LEFT JOIN users u1 ON tg.created_by = u1.id
    WHERE tg.id = $1 AND tg.created_by = $2;
    `,
    [id, jid]
  );

  
  const enrollments = await query(
    `
    SELECT 
        tge.*, 
        COALESCE(u2.name, NULL) AS user_name
    FROM trivia_game_enrollment tge
    LEFT JOIN users u2 ON tge.user_id = u2.id
    WHERE tge.game_id = $1;
    `,
    [id]
  );

    return NextResponse.json({game : gameData.rows[0] || {}, enrollments : enrollments.rows || []}, { status: 200 });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json({ message: "Error fetching games", error: error.message }, { status: 500 });
  }
}

export const revalidate = 0
