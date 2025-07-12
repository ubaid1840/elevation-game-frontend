import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const rootQuery = `
      SELECT id, name, email, referral_count AS referrals
      FROM users
      WHERE id = $1
      LIMIT 1
    `;
    const { rows: rootRows } = await query(rootQuery, [id]);
    if (rootRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const rootUser = rootRows[0];

    
    const referralQuery = `
      WITH RECURSIVE referral_tree AS (
        SELECT 
          u.id,
          u.name,
          u.email,
          u.referral_count AS referrals,
          r.referrer_id,
          r.referred_id,
          1 AS level
        FROM referrals r
        JOIN users u ON u.id = r.referred_id
        WHERE r.referrer_id = $1

        UNION ALL

        SELECT 
          u.id,
          u.name,
          u.email,
          u.referral_count AS referrals,
          r.referrer_id,
          r.referred_id,
          rt.level + 1
        FROM referrals r
        JOIN users u ON u.id = r.referred_id
        JOIN referral_tree rt ON r.referrer_id = rt.id
      )
      SELECT * FROM referral_tree;
    `;
    const { rows: referralRows } = await query(referralQuery, [id]);

    
    const buildReferralTree = (data, rootId, rootInfo) => {
      const nodes = {};
      const tree = {
        name: rootInfo.name || "You",
        attributes: {
          email: rootInfo.email || "",
          referrals: rootInfo.referrals ?? 0, 
        },
        children: [],
      };

      
      data.forEach(user => {
        nodes[user.id] = {
          name: user.name,
          attributes: {
            email: user.email,
            referrals: user.referrals ?? 0, 
          },
          children: [],
        };
      });

      
      data.forEach(user => {
        if (user.referrer_id === Number(rootId)) {
          tree.children.push(nodes[user.id]);
        } else if (nodes[user.referrer_id]) {
          nodes[user.referrer_id].children.push(nodes[user.id]);
        }
      });

      return tree;
    };

    const tree = buildReferralTree(referralRows, id, rootUser);

    return NextResponse.json(tree);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const revalidate = 0;
