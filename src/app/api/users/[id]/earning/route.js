import { query } from "@/lib/db";
import { NextResponse } from "next/server";



export async function GET(req, { params }) {
    const { id } = await params;

    try {
        const transactions = await query(`
            SELECT t.*, 
                   COALESCE(tg.title, NULL) AS game_title
            FROM transactions t
            LEFT JOIN games tg ON t.game_id = tg.id
            WHERE t.user_id = $1 
              AND t.game_type <> 'trivia'
            ORDER BY t.created_at DESC
        `, [id]);

        return NextResponse.json(transactions.rows, { status: 200 });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ message: 'Error fetching transactions', error: error.message }, { status: 500 });
    }

}

export const revalidate = 0