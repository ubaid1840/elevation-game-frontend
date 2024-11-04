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
  const { name, email, role, schedule } = await req.json();

  try {
    if (role === 'judge') {
      const referralResult = await query(
        'SELECT referral_count FROM users WHERE id = $1',
        [id]
      );

      const referral_count = referralResult.rows[0]?.referral_count;

      if (referral_count < 200) {
        return NextResponse.json({ message: 'Sorry, you are not eligible yet' }, { status: 400 });
      }
    }

    const updatedUser = await query(
      'UPDATE users SET name = $1, email = $2, role = $3, last_active = $4, schedule = $5 WHERE id = $6 RETURNING *',
      [name, email, role, new Date(), schedule, id]
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
