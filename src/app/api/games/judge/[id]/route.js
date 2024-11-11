import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    // Fetch games where the provided 'id' matches either 'created_by' or exists in 'additional_judges'
    const gameResult = await pool.query(
      `SELECT DISTINCT ON (g.id) 
        g.id,
        g.title,
        g.currentround, 
        g.totalrounds, 
        g.level, 
        g.prize_amount, 
        g.winner, 
        g.additional_judges
       FROM games g 
       WHERE g.created_by = $1 OR $1::text = ANY(g.additional_judges::text[])`,
      [id]
    );

    const games = gameResult.rows;

    if (games.length === 0) {
      return NextResponse.json({ message: "No games found for the given user" }, { status: 404 });
    }

    // Process each game and fetch related game_enrollments data
    const processedGames = [];

    for (const game of games) {
      // Fetch game_enrollments data for the current game
      const enrollmentsResult = await pool.query(
        `SELECT ge.user_id, ge.status
         FROM game_enrollments ge
         WHERE ge.game_id = $1`,
        [game.id]
      );

      const enrollments = enrollmentsResult.rows;

      // Attach the enrollments data to the game data
      game.enrollments = enrollments;

      processedGames.push(game);
    }

    return NextResponse.json(processedGames, { status: 200 });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json({ message: "Error fetching games", error: error.message }, { status: 500 });
  }
}
