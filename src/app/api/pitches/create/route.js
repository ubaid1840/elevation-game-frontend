import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { user_id, game_id, video_link, status, round } = await req.json();

  try {
    const result = await query(
      `INSERT INTO pitches (user_id, game_id, video_link, status, round) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, game_id, video_link, status, round]
    );

    await query(
      `UPDATE users SET last_active = $1 WHERE id = $2`, [new Date(), user_id]
    );

    await query(
      'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
      [user_id, `User created a pitch for game ID ${game_id}`]
    );

    return NextResponse.json({ pitch: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error saving pitch:', error);
    return NextResponse.json({ message: 'Error saving pitch', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
