import { query } from "@/lib/db"
import { NextResponse } from "next/server"


export async function PUT(req, { params }) {

    const { id } = await params

    const { referral_code } = await req.json()

    try {
        if (!referral_code || !referral_code.trim()) {
            return NextResponse.json({ message: "Missing parameters" }, { status: 400 })
        }

        const userQuery = await query(`SELECT id FROM users WHERE referral_code = $1 LIMIT 1`, [referral_code])
        if (userQuery.rows.length === 0) {
            return NextResponse.json({ message: "Invalid referral code" }, { status: 400 })
        }

        const referrerId = userQuery.rows[0].id;

        const checkAvailable = await query(`SELECT id FROM referrals WHERE referred_id = $1`, [id])

        if (checkAvailable.rows.length === 0) {
            await query(
                `INSERT INTO referrals (referrer_id, referred_id) VALUES ($1, $2)`,
                [referrerId, id]
            );
        } else {
            await query(
                `UPDATE referrals SET referrer_id = $1 WHERE referred_id = $2`,
                [referrerId, id]
            );
        }

        await query(`
            UPDATE users u
            SET referral_count = (
            SELECT COUNT(*)
            FROM referrals r
            WHERE r.referrer_id = u.id
            )
            WHERE u.id = $1`, [referrerId])

        await query(`
            UPDATE users u
            SET referral_count = (
            SELECT COUNT(*)
            FROM referrals r
            WHERE r.referrer_id = u.id
            )
            WHERE u.id = $1`, [id])

        const actionMsg = `Referral code updated to ${referral_code} `
        await query(
            'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
            [id, actionMsg]
        );

        return NextResponse.json({ message: "Done" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: error?.message || "Server error" }, { status: 500 })
    }
}