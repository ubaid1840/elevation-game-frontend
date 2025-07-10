import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const games = await query(
      'SELECT games.*, (games.winner IS NOT NULL) AS Completed FROM games JOIN game_enrollments ON games.id = game_enrollments.game_id WHERE game_enrollments.user_id = $1',
      [id]
    );


    const availableGames = await query(
      `SELECT id, title, total_participants, prize_amount, level, spots_remaining, currentRound, totalRounds, total_spots, deadline, 
       array_length(additional_judges, 1) + 1 as totalJudges 
       FROM games WHERE winner IS NULL AND id NOT IN (SELECT game_id FROM game_enrollments WHERE user_id = $1)`,
      [id]
    );

    const gamesWithEnrollments = await Promise.all(
      availableGames.rows.map(async (game) => {
        const enrollments = await query(
          'SELECT COUNT(*) as totalEnrollments FROM game_enrollments WHERE game_id = $1',
          [game.id]
        );
        const level = game.level
        const totalspots = game.total_spots
        const priceQuery = await query(`SELECT price FROM settings WHERE label = $1`, [level])
        let price = 0
        if (priceQuery.rows.length && priceQuery.rows[0].price) {
          price = Number(priceQuery.rows[0].price)
        }
        const poolPrize = price * Number(totalspots)
        const first = poolPrize * 0.3
        const second = poolPrize * 0.1
        return {
          ...game,
          totalEnrollments: parseInt(enrollments.rows[0].totalenrollments, 10) || 0,
          firstPrize: Number(first.toFixed(2)),
          secondPrize: Number(second.toFixed(2))
        };
      })
    );

    return NextResponse.json({ myGames: games.rows, availableGames: gamesWithEnrollments }, { status: 200 });

  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json({ message: 'Error fetching game', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
