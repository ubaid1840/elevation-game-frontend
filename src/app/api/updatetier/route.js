import {query} from '@/lib/db'; // Assuming you have this query helper
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { user_id, plan } = await req.json();
    if (!user_id || !plan) {
      return NextResponse.json({ error: 'user_id and plan are required' }, { status: 400 });
    }
    const planResult = await query(
      'SELECT price FROM settings WHERE label = $1 LIMIT 1',
      [plan]
    );

    if (planResult.rows.length === 0) {
      return NextResponse.json({ error: 'Plan not found in settings' }, { status: 404 });
    }

    const amount = Number(planResult.rows[0].price);
    const firstReferrerResult = await query(
      'SELECT referrer_id FROM referrals WHERE referred_id = $1 LIMIT 1',
      [user_id]
    );

    if (firstReferrerResult.rows.length === 0) {
      return NextResponse.json({ message: 'No referrer found for the user' }, { status: 200 });
    }

    const referrer_id = firstReferrerResult.rows[0].referrer_id;
    let referrer2_id = null;
    if (referrer_id) {
      const secondReferrerResult = await query(
        'SELECT referrer_id FROM referrals WHERE referred_id = $1 LIMIT 1',
        [referrer_id]
      );
      if (secondReferrerResult.rows.length > 0) {
        referrer2_id = secondReferrerResult.rows[0].referrer_id;
      }
    }
    let referrer3_id = null;
    if (referrer2_id) {
      const thirdReferrerResult = await query(
        'SELECT referrer_id FROM referrals WHERE referred_id = $1 LIMIT 1',
        [referrer2_id]
      );
      if (thirdReferrerResult.rows.length > 0) {
        referrer3_id = thirdReferrerResult.rows[0].referrer_id;
      }
    }
    if (referrer_id) {
      await query(
        'UPDATE users SET tier1 = tier1 + ($1 * 0.2) WHERE id = $2',
        [amount, referrer_id]
      );
    }
    if (referrer2_id) {
      await query(
        'UPDATE users SET tier2 = tier2 + ($1 * 0.1) WHERE id = $2',
        [amount, referrer2_id]
      );
    }
    if (referrer3_id) {
      await query(
        'UPDATE users SET tier3 = tier3 + ($1 * 0.05) WHERE id = $2',
        [amount, referrer3_id]
      );
    }
    return NextResponse.json({ message: 'Referral earnings updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating referral earnings:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
