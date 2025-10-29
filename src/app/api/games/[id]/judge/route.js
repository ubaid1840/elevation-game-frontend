import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const gameResult = await pool.query(
      `SELECT 
        g.id,
        g.title,
        g.currentround, 
        g.totalrounds, 
        g.closed_by_admin,
        g.close_reason,
        g.level, 
        g.deadline,
        g.winner,
        g.winner_2nd, 
        g.created_by, 
        g.roundinstruction,
        g.spots_remaining,
        g.additional_judges,
        g.judges_count
       FROM games g 
       WHERE g.id = $1`,
      [id]
    );

    const game = gameResult.rows[0];

    if (!game) {
      return NextResponse.json({}, { status: 200 });
    }

    const creatorResult = await pool.query(
      `SELECT name FROM users WHERE id = $1`,
      [game.created_by]
    );
    game.created_by_name = creatorResult.rows[0]?.name || 'Unknown';

    const judgeNames = [];
    for (const judgeId of game.additional_judges) {
      const judgeResult = await pool.query(
        `SELECT name FROM users WHERE id = $1`,
        [parseInt(judgeId)]
      );
      judgeNames.push(judgeResult.rows[0]?.name || 'Unknown');
    }
    game.additional_judges_names = judgeNames;

    if (game.winner) {
      const winnerResult = await pool.query(
        `SELECT name FROM users WHERE id = $1`,
        [game.winner]
      );
      game.winner_name = winnerResult.rows[0]?.name || 'Unknown';
    }

    if (game.winner_2nd) {
      const winnerResult = await pool.query(
        `SELECT name FROM users WHERE id = $1`,
        [game.winner_2nd]
      );
      game.winner_2nd_name = winnerResult.rows[0]?.name || 'Unknown';
    }

    const enrollmentsResult = await pool.query(
      `SELECT ge.user_id, ge.status
       FROM game_enrollments ge
       WHERE ge.game_id = $1`,
      [game.id]
    );

    const enrollments = enrollmentsResult.rows;

    for (const enrollment of enrollments) {
      const userResult = await pool.query(
        `SELECT name, email FROM users WHERE id = $1`,
        [enrollment.user_id]
      );
      const user = userResult.rows[0];
      enrollment.user_name = user?.name || 'Unknown';
      enrollment.user_email = user?.email || "Unknown"

      const pitchResult = await pool.query(
        `SELECT p.id AS pitch_id, p.user_id AS pitch_user_id, p.status AS pitch_status, p.video_link, p.score, p.round, p.scores
         FROM pitches p
         WHERE p.game_id = $1 AND p.user_id = $2
         ORDER BY p.created_at ASC`,
        [game.id, enrollment.user_id]
      );

      const pitches = pitchResult.rows;

      for (const pitch of pitches) {
        const commentResult = await pool.query(
          `SELECT c.comment_text, c.created_at, c.user_id AS commented_by
           FROM comments c
           WHERE c.pitch_id = $1`,
          [pitch.pitch_id]
        );

        const comments = commentResult.rows;

        for (const comment of comments) {
          const userResult = await pool.query(
            `SELECT name FROM users WHERE id = $1`,
            [comment.commented_by]
          );
          const user = userResult.rows[0];
          comment.commented_by_name = user?.name || 'Unknown';
        }

        pitch.comments = comments;
      }

      enrollment.pitches = pitches;
    }

    game.enrollments = enrollments;

    game.active = true

    if (game.winner || game.closed_by_admin) {
      game.active = false
    }

    return NextResponse.json(game, { status: 200 });
  } catch (error) {
    console.error("Error fetching game data:", error);
    return NextResponse.json({ message: "Error fetching game data", error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
