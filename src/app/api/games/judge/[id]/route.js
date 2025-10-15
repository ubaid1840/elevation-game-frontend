import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const gameResult = await pool.query(
      `SELECT DISTINCT ON (g.id) 
        g.id,
        g.title,
        g.currentround, 
        g.totalrounds, 
        g.level, 
        g.prize_amount, 
        g.winner,
        g.closed_by_admin,
        g.close_reason, 
        g.additional_judges
       FROM games g 
       WHERE g.created_by = $1 OR $1::text = ANY(g.additional_judges::text[])`,
      [id]
    );

    const games = gameResult.rows;

    if (games.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const processedGames = [];

    for (const game of games) {
      const enrollmentsResult = await pool.query(
        `SELECT ge.user_id, ge.status
         FROM game_enrollments ge
         WHERE ge.game_id = $1`,
        [game.id]
      );

      const enrollments = enrollmentsResult.rows;

      game.enrollments = enrollments;
 
      processedGames.push(game);
    }

    return NextResponse.json(processedGames, { status: 200 });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json({ message: "Error fetching games", error: error.message }, { status: 500 });
  }
}
