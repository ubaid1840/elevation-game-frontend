import { query } from '@/lib/db';
import moment from 'moment';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = await params;

  try {
    // Get the user's package and expiry
    const userResult = await query(
      'SELECT package, package_expiry FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 200 });
    }

    const { package: userPackage, package_expiry } = userResult.rows[0];

    // Ensure package is Platinum and not expired
    if (
      userPackage !== 'Platinum' ||
      moment().isAfter(moment(package_expiry), 'day')
    ) {
      return NextResponse.json({ error: 'Not Eligible' }, { status: 200 });
    }

    // Fetch all referred users
    const referralsResult = await query(
      'SELECT referred_id FROM referrals WHERE referrer_id = $1',
      [id]
    );

    // At least 50 referrals needed
    if (referralsResult.rows.length < 50) {
      return NextResponse.json({ error: 'Not Eligible' }, { status: 200 });
    }

    // Get user IDs of referred users
    const referredUserIds = referralsResult.rows.map(
      (ref) => ref.referred_id
    );

    // Check how many of them have Platinum package
    const usersResult = await query(
      'SELECT package FROM users WHERE id = ANY($1::int[])',
      [referredUserIds]
    );

    const platinumCount = usersResult.rows.filter(
      (user) => user.package === 'Platinum'
    ).length;

    if (platinumCount >= 50) {
      return NextResponse.json({ message: 'Eligible' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Not Eligible' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error checking eligibility:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

export const revalidate = 0;
