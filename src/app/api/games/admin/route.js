import pool, { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const games = await query(
      `SELECT id, title, total_participants, prize_amount, level, spots_remaining, currentRound, totalRounds, total_spots, 
       array_length(additional_judges, 1) + 1 as totalJudges 
       FROM games`
    );

    // Add total enrollments count to each game
    const gamesWithEnrollments = await Promise.all(
      games.rows.map(async (game) => {
        const enrollments = await query(
          'SELECT COUNT(*) as totalEnrollments FROM game_enrollments WHERE game_id = $1',
          [game.id]
        );
        return {
          ...game,
          totalEnrollments: parseInt(enrollments.rows[0].totalenrollments, 10) || 0,
        };
      })
    );

    return NextResponse.json(gamesWithEnrollments, { status: 200 });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ message: 'Error fetching games', error: error.message }, { status: 500 });
  }
}
