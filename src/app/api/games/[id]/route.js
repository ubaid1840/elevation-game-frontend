import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    // Fetch the main game details along with participants and pitches
    const gameResult = await pool.query(
      `SELECT 
        g.created_by AS createdBy, 
        g.additional_judges, 
        g.description,
        g.video_link,
        g.title,
        g.category,
        g.totalrounds,
        g.level,
        g.total_spots,
        g.spots_remaining,
        g.prize_amount,
        g.currentround,
        g.deadline,
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

    const game = gameResult.rows[0];

    if (!game) {
      return NextResponse.json({ message: "Game not found" }, { status: 404 });
    }

    // Fetch the name of the creator
    const creatorResult = await pool.query(`SELECT name FROM users WHERE id = $1`, [game.createdby]);
    const creatorName = creatorResult.rows[0]?.name || null;

    // Fetch the names of additional judges
    const judgeIds = game.additional_judges || [];
    const judgesResult = await pool.query(`SELECT id, name FROM users WHERE id = ANY($1::int[])`, [judgeIds]);
    const judgeNames = judgesResult.rows.map(judge => judge.name);

    // Replace the IDs with names
    game.createdBy = creatorName;
    game.additional_judges = judgeNames;

    return NextResponse.json(game, { status: 200 });
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json({ message: "Error fetching game", error: error.message }, { status: 500 });
  }
}


export async function PUT(req, { params }) {
  const { id } = params;
  const { winnerid } = await req.json();

  if (!winnerid || !id) {
    return NextResponse.json({ message: 'Required information missing' }, { status: 404 });
  }

  try {

    await pool.query(
      `UPDATE users 
         SET winner_earnings = winner_earnings + (SELECT prize_amount FROM games WHERE games.id = $1) 
         WHERE users.id = $2`,
      [id, winnerid]
    );

    const updatedGame = await pool.query(
      `UPDATE games 
       SET winner = $1 
       WHERE id = $2 
       RETURNING *`,
      [winnerid, id]
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
