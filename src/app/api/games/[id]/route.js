import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const game = await pool.query(
      `SELECT 
        g.created_by AS createdBy, 
        g.additional_judges, 
        u.id AS participant_id, 
        u.name AS participant_name, 
        p.video_link AS pitch_video_link, 
        p.status AS pitch_status, 
        p.created_at AS pitch_created_at, 
        c.comment_text AS comment, 
        c.created_at AS comment_created_at, 
        c.user_id AS commented_by 
       FROM games g 
       LEFT JOIN users u ON u.id IN (SELECT user_id FROM pitches WHERE game_id = g.id) 
       LEFT JOIN pitches p ON p.user_id = u.id AND p.game_id = g.id 
       LEFT JOIN comments c ON c.pitch_id = p.id 
       WHERE g.id = $1`,
      [id]
    );
    return NextResponse.json(game.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json({ message: 'Error fetching game', error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  const { title, description, totalRounds, category, currentRound, spotsRemaining, judges, winnerid } = await req.json();

  try {
    if (winnerid) {
      await pool.query(
        `UPDATE users 
         SET winner_earnings = winner_earnings + (SELECT prize_amount FROM games WHERE games.id = $1) 
         WHERE users.id = $2`,
        [id, winnerid]
      );
    }

    const updatedGame = await pool.query(
      `UPDATE games 
       SET title = $1, description = $2, totalRounds = $3, category = $4, 
           spots_remaining = $5, judges = $6, currentRound = $7, winner = $8 
       WHERE id = $9 
       RETURNING *`,
      [title, description, totalRounds, category, spotsRemaining, judges, currentRound, winnerid, id]
    );

    return NextResponse.json(updatedGame.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json({ message: 'Error updating game', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    await pool.query('DELETE FROM games WHERE id = $1', [id]);
    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ message: 'Error deleting game', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
