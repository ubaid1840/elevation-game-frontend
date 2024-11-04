import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const game = await query(
      'SELECT games.*, (games.winner IS NOT NULL) AS Completed FROM games JOIN game_enrollments ON games.id = game_enrollments.game_id WHERE game_enrollments.user_id = $1',
      [id]
    );

    return NextResponse.json(game.rows);
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json({ message: 'Error fetching game', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
