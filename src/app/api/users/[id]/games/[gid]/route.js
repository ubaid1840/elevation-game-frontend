import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id, gid } = params;

  try {
    const enrollmentResult = await query(
      'SELECT * FROM game_enrollments WHERE user_id = $1 AND game_id = $2',
      [id, gid]
    );

    if (enrollmentResult.rows.length === 0) {
      return NextResponse.json({ message: 'No enrollment found for the given user and game IDs.' }, { status: 404 });
    }

    const enrollment = enrollmentResult.rows[0];
    const gameResult = await query(
      'SELECT *, (winner IS NOT NULL) AS Completed FROM games WHERE id = $1',
      [enrollment.game_id]
    );

    const game = gameResult.rows[0];

    
    if (game.winner !== null) {
      const winnerResult = await query(
        'SELECT name FROM users WHERE id = $1',
        [game.winner]
      );
      game.winner = winnerResult.rows[0]?.name || null;
    }

    if (game.winner_2nd !== null) {
      const winnerResult = await query(
        'SELECT name FROM users WHERE id = $1',
        [game.winner_2nd]
      );
      game.winner_2nd = winnerResult.rows[0]?.name || null;
    }

    
    const createdByResult = await query(
      'SELECT name FROM users WHERE id = $1',
      [game.created_by]
    );
    const createdByName = createdByResult.rows[0]?.name || null;
    game.createdby = createdByName;

    game.active = true

    if (game.winner || game.closed_by_admin) {
      game.active = false
    }

    
    if (game.additional_judges && Array.isArray(game.additional_judges)) {
      const judgeIds = game.additional_judges;
      const judgesResult = await query(
        `SELECT id, name FROM users WHERE id = ANY($1::int[])`,
        [judgeIds]
      );
      const judgesMap = Object.fromEntries(judgesResult.rows.map(judge => [judge.id, judge.name]));
      game.judges = judgeIds.map(judgeId => judgesMap[judgeId] || judgeId);
    }

    
    const pitchesResult = await query(
      'SELECT * FROM pitches WHERE user_id = $1 AND game_id = $2 ORDER BY created_at ASC',
      [id, gid]
    );

    const pitches = pitchesResult.rows;
    const pitchesWithComments = await Promise.all(
      pitches.map(async (pitch) => {
        const commentsResult = await query(
          'SELECT * FROM comments WHERE pitch_id = $1',
          [pitch.id]
        );
        return {
          ...pitch,
          comments: commentsResult.rows,
        };
      })
    );

    const response = {
      enrollment,
      game,
      pitches: pitchesWithComments,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ message: 'Error fetching data', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
