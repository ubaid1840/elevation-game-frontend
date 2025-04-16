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
      let gameData = null;
      let referralUser = null;

      if (tx.game_type === 'elevator' && tx.game_id) {
        const gameRes = await query(`SELECT * FROM games WHERE id = $1`, [tx.game_id]);
        gameData = gameRes.rows[0];

        const enrollRes = await query(`SELECT * FROM game_enrollments WHERE game_id = $1`, [tx.game_id]);
        const enrollments = await Promise.all(enrollRes.rows.map(async (enrollment) => {
          const pitchRes = await query(`SELECT * FROM pitches WHERE enrollment_id = $1`, [enrollment.id]);
          return {
            ...enrollment,
            pitches: pitchRes.rows
          };
        }));

        gameData.enrollments = enrollments;
      }

      if (tx.game_type === 'trivia' && tx.game_id) {
        const triviaGameRes = await query(`SELECT * FROM trivia_game WHERE id = $1`, [tx.game_id]);
        gameData = triviaGameRes.rows[0];

        const triviaEnrollRes = await query(`SELECT * FROM trivia_game_enrollment WHERE game_id = $1`, [tx.game_id]);
        gameData.enrollments = triviaEnrollRes.rows;
      }

      if (tx.reference_id) {
        const refUserRes = await query(
          `SELECT id, name, email, referral_code, package FROM users WHERE id = $1`,
          [tx.reference_id]
        );
        referralUser = refUserRes.rows[0];
      }

      return {
        ...tx,
        game_data: gameData,
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