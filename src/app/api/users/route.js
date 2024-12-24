import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');

  try {
    const users = await query('SELECT id, name, email, role, last_active, schedule, active FROM users WHERE role = $1', [role]);
    return NextResponse.json(users.rows );
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Error fetching users', error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const { name, email, role, refered_by, schedule } = await req.json();
  const referral_code = generateReferralCode();
  let referrer_id = null;

  try {
    const existingUser = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      if (existingUser.rows[0].role === 'user') {
        return NextResponse.json({ message: 'User already signed up' }, { status: 400 });
      } else if (existingUser.rows[0].role === 'judge') {
        const updatedUser = await query(
          'UPDATE users SET name = $1 WHERE email = $2 RETURNING *',
          [name, email]
        );
        return NextResponse.json(updatedUser.rows[0], { status: 200 });
      } else {
        return NextResponse.json({ message: 'Error creating user'}, { status: 500 });
      }
    }

    if (refered_by) {
      const referrer = await query(
        'SELECT id FROM users WHERE referral_code = $1',
        [refered_by]
      );

      if (referrer.rows.length > 0) {
        referrer_id = referrer.rows[0].id;
      } else {
        return NextResponse.json({ message: 'Invalid referral code' }, { status: 400 });
      }
    }

    const newUser = await query(
      'INSERT INTO users (name, email, role, referral_code, schedule) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, role || 'user', referral_code, schedule]
    );

    if (referrer_id) {
      const referred_id = newUser.rows[0].id;

      await query(
        'INSERT INTO referrals (referrer_id, referred_id) VALUES ($1, $2)',
        [referrer_id, referred_id]
      );

      await query(
        'UPDATE users SET referral_count = COALESCE(referral_count, 0) + 1 WHERE id = $1',
        [referrer_id]
      );
    }

    await query(
      'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
      [newUser.rows[0].id, 'New User Created']
    );

    return NextResponse.json(newUser.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Error creating user', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
