import pool, { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = await params;

  try {
    const games = await query(
      `
      SELECT tg.*, 
             COALESCE(te.total_enrollments, 0) AS total_enrollments
      FROM trivia_game tg
      LEFT JOIN (
          SELECT game_id, COUNT(*) AS total_enrollments
          FROM trivia_game_enrollment
          GROUP BY game_id
      ) te ON tg.id = te.game_id
      WHERE tg.created_by = $1
      `,
      [id]
    );

    return NextResponse.json(games.rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json({ message: "Error fetching games", error: error.message }, { status: 500 });
  }
}

export const revalidate = 0
