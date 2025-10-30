import { query } from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const userID = searchParams.get(`uid`)
    const gameID = searchParams.get(`gid`)

    if (type == 'elevator') {
        const checkQuery = await query(`SELECT id FROM game_enrollments WHERE user_id = $1 AND game_id = $2 LIMIT 1`, [Number(userID), Number(gameID)])
        const res = checkQuery.rows
        if (res.length > 0) {
            return NextResponse.json({ status: true }, { status: 200 })
        } else {
            return NextResponse.json({ status: false }, { status: 200 })
        }
    } else {
        const checkQuery = await query(`SELECT payment_intent_id FROM trivia_game_enrollment WHERE user_id = $1 AND game_id = $2`, [Number(userID), Number(gameID)])
        const res = checkQuery.rows
        if (res.length > 0 && res?.payment_intent_id) {
            return NextResponse.json({ status: true }, { status: 200 })
        } else {
            return NextResponse.json({ status: false }, { status: 200 })
        }
    }
}