import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { user_id, game_id, video_link, status } = await req.json();

  try {
    // Insert pitch into database
    const result = await query(
      `INSERT INTO pitches (user_id, game_id, video_link, status) VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, game_id, video_link, status]
    );

    // Update user's last active time
    await query(
      `UPDATE users SET last_active = $1 WHERE id = $2`, [new Date(), user_id]
    );

    // Log the action
    await query(
      'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
      [user_id, `User created a pitch for game ID ${game_id}`]
    );

    // Return the created pitch
    return NextResponse.json({ pitch: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error saving pitch:', error); // Log the error for debugging
    return NextResponse.json({ message: 'Error saving pitch', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
