import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { game_id, user_id, content, rating } = await req.json();

  try {
    
    const result = await query(
      `INSERT INTO testimonials (game_id, user_id, content, rating) VALUES ($1, $2, $3, $4) RETURNING *`,
      [game_id, user_id, content, rating]
    );

    
    await query(
      `UPDATE users SET last_active = $1 WHERE id = $2`,
      [new Date(), user_id]
    );

    
    await query(
      'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
      [user_id, `User created testimonial for game ID ${game_id}`]
    );

    
    return NextResponse.json({ testimonial: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error saving testimonial:', error); 
    return NextResponse.json({ message: 'Error saving testimonial', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
