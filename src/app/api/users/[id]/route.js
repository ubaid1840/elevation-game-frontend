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
  const { id } = await params;
  const { name, phone, status, role, referral_code } = await req.json();
  const searchParams = req.nextUrl.searchParams
  const checkwaiver = searchParams.get('checkwaiver')


  try {

    if (role) {
      const updatedUser = await query(
        'UPDATE users SET role = $1, last_active = $2 WHERE id = $3 RETURNING *',
        [role, new Date(), id]
      );
      const action = `User role changed to ${role}`
      await query(
        'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
        [id, action]
      );

      if (role === 'judge' && checkwaiver) {
        const checkwaiverQuery = await query(
          `SELECT waiver_start FROM users WHERE id = $1`, [id]
        )
        if (checkwaiverQuery.rows.length > 0) {
          if (checkwaiverQuery.rows[0].waiver_start === null) {
            await query(
              `UPDATE users SET waiver_start = $1 WHERE id = $2`, [new Date(), id]
            )
          }
        }
      }

      return NextResponse.json(updatedUser.rows[0], { status: 200 });
    }

    if (status !== undefined) {
      const updatedUser = await query(
        'UPDATE users SET active = $1, last_active = $2 WHERE id = $3 RETURNING *',
        [status, new Date(), id]
      );
      let action = ""
      if (status) {
        action = "User account activated"
      } else {
        action = "User account suspended"
      }
      await query(
        'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
        [id, action]
      );

      return NextResponse.json(updatedUser.rows[0], { status: 200 });
    }

    if (name && phone) {
      const updatedUser = await query(
        'UPDATE users SET name = $1, phone = $2, last_active = $3 WHERE id = $4 RETURNING *',
        [name, phone, new Date(), id]
      );

      await query(
        'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
        [id, 'User Credentials Updated']
      );

      return NextResponse.json(updatedUser.rows[0], { status: 200 });
    }


  } catch (error) {
    console.log('Error updating user:', error);
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
    return NextResponse.json(null, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Error deleting user', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
