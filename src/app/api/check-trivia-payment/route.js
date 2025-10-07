import { query } from "@/lib/db"
import { NextResponse } from "next/server"


export async function GET(req) {
    const searchParams = req.nextUrl.searchParams
    const userID = searchParams.get('user')
    const gameID = searchParams.get("game")

    try {
        const checkQuery = await query(`SELECT id FROM transactions WHERE user_id = $1 AND game_id = $2`, [Number(userID), Number(gameID)])

        if (checkQuery.rows.length > 0) {
            return NextResponse.json({ status: true }, { status: 200 })
        }
        return NextResponse.json({ status: false }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: error?.message || "Server error" }, { status: 500 })
    }


}