import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id, gid } = params;

  try {
    const enrollmentResult = await query(
      'SELECT * FROM trivia_game_enrollment WHERE user_id = $1 AND game_id = $2',
      [id, gid]
    );

    if (enrollmentResult.rows.length === 0) {
      return NextResponse.json({ message: 'No enrollment found for the given user and game IDs.' }, { status: 404 });
    }

    const enrollment = enrollmentResult.rows[0];
    const gameResult = await query(
      'SELECT *, (winner_id IS NOT NULL) AS Completed FROM trivia_game WHERE id = $1',
      [enrollment.game_id]
    );

    const game = gameResult.rows[0];

    // Check if the winner is not null, and fetch the winner's name
    if (game.winner_id !== null) {
      const winnerResult = await query(
        'SELECT name FROM users WHERE id = $1',
        [game.winner_id]
      );
      game.winner = winnerResult.rows[0]?.name || null;
    }

    // Fetch the createdBy name
    const createdByResult = await query(
      'SELECT name FROM users WHERE id = $1',
      [game.created_by]
    );
    const createdByName = createdByResult.rows[0]?.name || null;
    game.createdby = createdByName;

    // Fetch additional judges if available


    const response = {
      enrollment,
      game,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ message: 'Error fetching data', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
