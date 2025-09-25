import { query } from "@/lib/db";
import { NextResponse } from "next/server";



export async function GET(req, { params }) {
  const { id } = await params;


  try {
    const transactionsResult = await query(`
            SELECT * FROM transactions 
            WHERE user_id = $1 
            ORDER BY created_at DESC
          `, [id]);

    const transactions = transactionsResult.rows;

    const enrichedTransactions = await Promise.all(transactions.map(async (tx) => {
      let referralUser = null;
      if (tx.reference_id) {
        const refUserRes = await query(
          `SELECT id, name, email, referral_code, package FROM users WHERE id = $1`,
          [tx.reference_id]
        );
        referralUser = refUserRes.rows[0];
      }

      return {
        ...tx,
        referral_user: referralUser,
      };
    }));

    return NextResponse.json(enrichedTransactions, { status: 200 });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ message: 'Error fetching transactions', error: error.message }, { status: 500 });
  }

}

export const revalidate = 0