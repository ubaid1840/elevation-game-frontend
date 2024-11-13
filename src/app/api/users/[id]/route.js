import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const user = await query('SELECT * FROM users WHERE id = $1', [id]);
    return NextResponse.json(user.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Error fetching user', error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  const { name, phone } = await req.json();

  try {
  
    const updatedUser = await query(
      'UPDATE users SET name = $1, phone = $2, last_active = $3 WHERE id = $4 RETURNING *',
      [name, phone, new Date(), id]
    );

    await query(
      'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
      [id, 'User Credentials Updated']
    );

    return NextResponse.json(updatedUser.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Error updating user', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    await query('DELETE FROM users WHERE id = $1', [id]);
    await query(
      'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
      [id, 'User Deleted']
    );
    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Error deleting user', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
