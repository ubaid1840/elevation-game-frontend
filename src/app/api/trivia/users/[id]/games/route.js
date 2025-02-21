import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const games = await query(
      'SELECT trivia_game.*, (trivia_game.winner_id IS NOT NULL) AS Completed FROM trivia_game JOIN trivia_game_enrollment ON trivia_game.id = trivia_game_enrollment.game_id WHERE trivia_game_enrollment.user_id = $1',
      [id]
    );

    
    const availableGames = await query(
      `SELECT * FROM trivia_game WHERE winner_id IS NULL AND id NOT IN (SELECT game_id FROM trivia_game_enrollment WHERE user_id = $1)`,
       [id]
    );


    return NextResponse.json({ myGames: games.rows, availableGames: availableGames.rows }, { status: 200 });

  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json({ message: 'Error fetching game', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
