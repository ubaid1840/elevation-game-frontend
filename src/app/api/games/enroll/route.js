import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Parse request body
    const { userId, gameId, entryLevel } = await req.json();

    // Check spots remaining in the game
    const game = await pool.query('SELECT spots_remaining FROM games WHERE id = $1', [gameId]);
    if (game.rows[0].spots_remaining > 0) {
      // Enroll the user in the game
      const enrollment = await pool.query(
        'INSERT INTO game_enrollments (user_id, game_id, status, created_at) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, gameId, entryLevel, new Date()]
      );

      // Decrease spots in the game
      await pool.query('UPDATE games SET spots_remaining = spots_remaining - 1 WHERE id = $1', [gameId]);

      // Update the user's last active time
      await pool.query('UPDATE users SET last_active = $1 WHERE id = $2', [new Date(), userId]);

      // Log the enrollment action
      await pool.query('INSERT INTO logs (user_id, action) VALUES ($1, $2)', [userId, `enrolled in game ${gameId}`]);

      // Respond with the enrollment data
      return NextResponse.json(enrollment.rows[0], { status: 201 });
    } else {
      // No spots remaining, send an error response
      return NextResponse.json({ message: 'No spots remaining' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error enrolling in game:', error);
    return NextResponse.json({ message: 'Error enrolling in game', error: error.message }, { status: 500 });
  }
}


export const revalidate = 0;
