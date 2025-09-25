import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const fetchChildrenOnly = searchParams.get("children") === "true";

  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    if (fetchChildrenOnly) {
      // Fetch only direct children
      const referralQuery = `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.referral_count AS referrals
        FROM referrals r
        JOIN users u ON u.id = r.referred_id
        WHERE r.referrer_id = $1
      `;
      const { rows } = await query(referralQuery, [id]);

      const children = rows.map(user => ({
        id: user.id,
        name: user.name,
        attributes: {
          email: user.email,
          referrals: user.referrals ?? 0,
        },
        children: [], // will load lazily on expand
      }));

      return NextResponse.json(children);
    } else {
      // Root + immediate children
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
        SELECT 
          u.id,
          u.name,
          u.email,
          u.referral_count AS referrals
        FROM referrals r
        JOIN users u ON u.id = r.referred_id
        WHERE r.referrer_id = $1
      `;
      const { rows: referralRows } = await query(referralQuery, [id]);

      const tree = {
        id: rootUser.id,
        name: rootUser.name || "You",
        attributes: {
          email: rootUser.email || "",
          referrals: rootUser.referrals ?? 0,
        },
        children: referralRows.map(user => ({
          id: user.id,
          name: user.name,
          attributes: {
            email: user.email,
            referrals: user.referrals ?? 0,
          },
          children: [], // will be loaded on expand
        })),
      };
     
      return NextResponse.json(tree, {status : 200});
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const revalidate = 0;
