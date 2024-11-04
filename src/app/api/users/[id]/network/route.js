import query from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    // Query to get referral hierarchy for a given user
    const referralQuery = `
      WITH RECURSIVE referral_tree AS (
        SELECT 
          u.id,
          u.name,
          u.referral_count AS referrals,
          r.referrer_id,
          r.referred_id,
          1 AS level
        FROM users u
        LEFT JOIN referrals r ON u.id = r.referred_id
        WHERE u.id = $1  -- Start with the given user ID

        UNION ALL

        SELECT 
          u.id,
          u.name,
          u.referral_count AS referrals,
          r.referrer_id,
          r.referred_id,
          referral_tree.level + 1 AS level
        FROM users u
        JOIN referrals r ON u.id = r.referred_id
        JOIN referral_tree ON r.referrer_id = referral_tree.id
      )
      SELECT id, name, referrals, level FROM referral_tree ORDER BY level, id;
    `;

    // Run query
    const { rows: referralData } = await query(referralQuery, [id]);

    // Helper function to build the tree structure
    const buildTree = (data) => {
      const root = { name: data[0].name, children: [] };
      const refMap = { 1: root };

      data.slice(1).forEach((item) => {
        const node = {
          name: item.name,
          attributes: { referrals: item.referrals },
          children: [],
        };
        refMap[item.level - 1].children.push(node);
        refMap[item.level] = node;
      });

      return root;
    };

    // Build JSON structure
    const jsonStructure = buildTree(referralData);

    // Send response
    return NextResponse.json(jsonStructure);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const revalidate = 0;
