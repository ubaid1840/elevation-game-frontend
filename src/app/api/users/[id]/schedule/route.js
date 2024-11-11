import { query } from '@/lib/db';
import { NextResponse } from 'next/server';


export async function PUT(req, { params }) {
  const { id } = params;
  const { schedule } = await req.json();

  try {
    const updatedUser = await query(
      'UPDATE users SET schedule = $1,last_active = $2 WHERE id = $3 RETURNING *',
      [ schedule, new Date(), id]
    );

    await query(
      'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
      [id, 'Booking Schedule updated']
    );

    return NextResponse.json(updatedUser.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Error updating user', error: error.message }, { status: 500 });
  }
}


export const revalidate = 0;
