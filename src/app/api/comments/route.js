import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { pitch_id, comment_text, user_id } = await req.json();

    if (!pitch_id || !comment_text || !user_id) {
      return NextResponse.json(
        { message: 'pitch_id, comment_text, and user_id are required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO comments (pitch_id, comment_text, user_id, created_at)
       VALUES ($1, $2, $3, NOW()) RETURNING id`,
      [pitch_id, comment_text, user_id]
    );

    return NextResponse.json(
      { message: 'Comment added successfully', commentId: result.rows[0].id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { message: 'Error adding comment', error: error.message },
      { status: 500 }
    );
  }
}
