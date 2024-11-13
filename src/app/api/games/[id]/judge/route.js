import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    // Fetch the game by its game_id
    const gameResult = await pool.query(
      `SELECT 
        g.id,
        g.title,
        g.currentround, 
        g.totalrounds, 
        g.level, 
        g.prize_amount, 
        g.winner, 
        g.created_by, 
        g.additional_judges
       FROM games g 
       WHERE g.id = $1`,
      [id]
    );

    const game = gameResult.rows[0];

    if (!game) {
      return NextResponse.json({ message: "Game not found" }, { status: 404 });
    }

    // Replace created_by (user_id) with the user's name
    const creatorResult = await pool.query(
      `SELECT name FROM users WHERE id = $1`,
      [game.created_by]
    );
    game.created_by_name = creatorResult.rows[0]?.name || 'Unknown';

    // Replace additional_judges (array of IDs) with names
    const judgeNames = [];
    for (const judgeId of game.additional_judges) {
      const judgeResult = await pool.query(
        `SELECT name FROM users WHERE id = $1`,
        [parseInt(judgeId)] // Ensure ID is an integer
      );
      judgeNames.push(judgeResult.rows[0]?.name || 'Unknown');
    }
    game.additional_judges_names = judgeNames;

    // Check if there is a winner and replace winner ID with winner's name
    if (game.winner) {
      const winnerResult = await pool.query(
        `SELECT name FROM users WHERE id = $1`,
        [game.winner]
      );
      game.winner_name = winnerResult.rows[0]?.name || 'Unknown';
    }

    // Fetch game_enrollments for the current game
    const enrollmentsResult = await pool.query(
      `SELECT ge.user_id, ge.status
       FROM game_enrollments ge
       WHERE ge.game_id = $1`,
      [game.id]
    );

    const enrollments = enrollmentsResult.rows;

    // Replace user_id in enrollments with user names
    for (const enrollment of enrollments) {
      const userResult = await pool.query(
        `SELECT name FROM users WHERE id = $1`,
        [enrollment.user_id]
      );
      const user = userResult.rows[0];
      enrollment.user_name = user?.name || 'Unknown';

      // Fetch pitches associated with this user
      const pitchResult = await pool.query(
        `SELECT p.id AS pitch_id, p.user_id AS pitch_user_id, p.status AS pitch_status, p.video_link, p.score, p.round
         FROM pitches p
         WHERE p.game_id = $1 AND p.user_id = $2`,
        [game.id, enrollment.user_id]
      );

      const pitches = pitchResult.rows;

      // For each pitch, fetch associated comments
      for (const pitch of pitches) {
        const commentResult = await pool.query(
          `SELECT c.comment_text, c.created_at, c.user_id AS commented_by
           FROM comments c
           WHERE c.pitch_id = $1`,
          [pitch.pitch_id]
        );

        const comments = commentResult.rows;

        // Replace user_id in comments with user names
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

      // Attach pitches to the enrollment object
      enrollment.pitches = pitches;
    }

    // Attach the enrollments data to the game object
    game.enrollments = enrollments;

    return NextResponse.json(game, { status: 200 });
  } catch (error) {
    console.error("Error fetching game data:", error);
    return NextResponse.json({ message: "Error fetching game data", error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
