import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const referralsQuery = `
    SELECT 
  u.name,
  u.package,
  SUM(u.tier1 + u.tier2 + u.tier3) AS earnings
FROM users u
JOIN referrals r ON u.id = r.referred_id
WHERE r.referrer_id = $1
GROUP BY u.id;
    `;

    const { rows: referrals } = await query(referralsQuery, [id]);
    const topTeamMembersQuery = `
      SELECT 
        u.name,
        p.score
      FROM users u
      JOIN pitches p ON u.id = p.user_id
      WHERE p.user_id IN (SELECT referred_id FROM referrals WHERE referrer_id = $1)
      ORDER BY p.score DESC
      LIMIT 10;
    `;

    const { rows: topTeamMembers } = await query(topTeamMembersQuery, [id]);
    const earningsQuery = `
      SELECT tier1, tier2, tier3
      FROM users
      WHERE id = $1;
    `;

    const { rows: [earnings] } = await query(earningsQuery, [id]);
    const response = {
      referrals: referrals.map(referral => ({
        name: referral.name,
        package : referral.package,
        earning: referral.earnings,
      })),
      topTeamMembers: topTeamMembers.map(member => ({
        name: member.name,
        score: member.score,
      })),
      earnings: {
        tier1: earnings.tier1 || 0,
        tier2: earnings.tier2 || 0,
        tier3: earnings.tier3 || 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const revalidate = 0;
