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
        const tierPriceQuery = await query(`SELECT price FROM settings WHERE label = $1`, [game.level])
        const prize_amount = Number(tierPriceQuery.rows[0].price) * 0.3 * Number(game.total_spots)
        return {
          ...game,
          totalEnrollments: parseInt(enrollments.rows[0].totalenrollments, 10) || 0,
          prize_amount : prize_amount
        };
      })
    );

    return NextResponse.json(gamesWithEnrollments, { status: 200 });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ message: 'Error fetching games', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
