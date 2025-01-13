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
        return {
          ...game,
          totalEnrollments: parseInt(enrollments.rows[0].totalenrollments, 10) || 0,
        };
      })
    );

    // return NextResponse.json(gamesWithEnrollments, { status: 200 });

    return NextResponse.json({ myGames: games.rows, availableGames: gamesWithEnrollments }, { status: 200 });

    // return NextResponse.json(games.rows);
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json({ message: 'Error fetching game', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
