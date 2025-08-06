import { query } from '@/lib/db';
import moment from 'moment';
import { NextResponse } from 'next/server';

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');

  try {
    const users = await query('SELECT id, name, email, referral_code, role, last_active, schedule, active, waiver_start FROM users WHERE role = $1', [role]);

    const usersWithWaiverStatus = users.rows.map((eachUser) => {
      let hasActiveWaiver = false;
      let waiver_status = 'N/A';

      if (eachUser.role === 'judge' && eachUser.waiver_start) {
        const now = new Date();
        const waiverEnds = new Date(eachUser.waiver_start);
        waiverEnds.setFullYear(waiverEnds.getFullYear() + 1);

        if (now <= waiverEnds) {
          hasActiveWaiver = true;
          waiver_status = `Expiry: ${moment(waiverEnds).format("YYYY-MM-DD")}`;
        } else {
          waiver_status = 'Expired';
        }
      }

      return {
        ...eachUser,
        hasActiveWaiver,
        waiver_status,
      };
    });

    return NextResponse.json(usersWithWaiverStatus, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Error fetching users', error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const { name, email, role, referred_by, schedule, waiver } = await req.json();
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
        return NextResponse.json({ message: 'Error creating user' }, { status: 500 });
      }
    }



    if (referred_by) {
      const referrer = await query(
        'SELECT id FROM users WHERE referral_code = $1',
        [referred_by]
      );

      if (referrer.rows.length > 0) {
        referrer_id = referrer.rows[0].id;
      } else {
        return NextResponse.json({ message: 'Invalid referral code' }, { status: 400 });
      }
    }
    else {
      await query('BEGIN');

      try {

        const lastAssignedResult = await query(
          'SELECT last_assigned_judge_id FROM referral_tracker LIMIT 1'
        );

        let lastAssignedJudgeId = lastAssignedResult.rows.length > 0 ? lastAssignedResult.rows[0].last_assigned_judge_id : null;

        if (lastAssignedJudgeId) {
          const nextJudge = await query(
            'SELECT id, referral_code FROM users WHERE role = $1 AND id > $2 ORDER BY id ASC LIMIT 1',
            ['judge', lastAssignedJudgeId]
          );

          if (nextJudge.rows.length > 0) {
            referrer_id = nextJudge.rows[0].id;
          } else {
            const firstJudge = await query(
              'SELECT id, referral_code FROM users WHERE role = $1 ORDER BY id ASC LIMIT 1',
              ['judge']
            );
            if (firstJudge.rows.length > 0) {
              referrer_id = firstJudge.rows[0].id;
            }

          }

          if (referrer_id) {
            await query(
              'UPDATE referral_tracker SET last_assigned_judge_id = $1',
              [referrer_id]
            );
          }

        } else {
          const firstJudge = await query(
            'SELECT id, referral_code FROM users WHERE role = $1 ORDER BY id ASC LIMIT 1',
            ['judge']
          );
          if (firstJudge.rows.length > 0) {
            referrer_id = firstJudge.rows[0].id;

            await query(
              'INSERT INTO referral_tracker (last_assigned_judge_id) VALUES ($1)',
              [referrer_id]
            );
          }

        }

        await query('COMMIT');

      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }

    }


    let newUser = null
    if (role === "judge" && waiver) {
      newUser = await query(
        'INSERT INTO users (name, email, role, referral_code, schedule, waiver_start) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, email, role, referral_code, schedule, new Date()]
      );
    } else {
      newUser = await query(
        'INSERT INTO users (name, email, role, referral_code, schedule) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, email, role || 'user', referral_code, schedule]
      );
    }


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

    if (waiver) {
      await query(
        'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
        [newUser.rows[0].id, 'Waiver started for judge']
      );
    }

    return NextResponse.json(newUser.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Error creating user', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0; 
