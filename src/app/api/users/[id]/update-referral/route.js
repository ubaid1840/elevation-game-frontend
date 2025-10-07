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

        if(Number(referrerId) === Number(id)){
             return NextResponse.json({ message: "Cannot enter same referral code as user" }, { status: 400 })
        }

        const treeCheck = await query(
            `
      WITH RECURSIVE downline AS (
        SELECT referred_id
        FROM referrals
        WHERE referrer_id = $1
        UNION
        SELECT r.referred_id
        FROM referrals r
        INNER JOIN downline d ON r.referrer_id = d.referred_id
      )
      SELECT 1 FROM downline WHERE referred_id = $2 LIMIT 1;
      `,
            [id, referrerId] // id = current user, referrerId = new referrer
        );

        if (treeCheck.rows.length > 0) {
            return NextResponse.json(
                { message: "Invalid referral: circular referral not allowed" },
                { status: 400 }
            );
        }

        const checkAvailable = await query(`SELECT id, referrer_id FROM referrals WHERE referred_id = $1`, [id])

        let previousReferrerId = null;

        if (checkAvailable.rows.length === 0) {
            await query(
                `INSERT INTO referrals (referrer_id, referred_id) VALUES ($1, $2)`,
                [referrerId, id]
            );
        } else {
            previousReferrerId = checkAvailable.rows[0].referrer_id;
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

        if (previousReferrerId) {
            await query(
                `
    UPDATE users u
    SET referral_count = (
      SELECT COUNT(*) FROM referrals r WHERE r.referrer_id = u.id
    )
    WHERE u.id = $1
    `,
                [previousReferrerId]
            );
        }



        const actionMsg = `Referral from updated to ${referral_code} `
        await query(
            'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
            [id, actionMsg]
        );

        return NextResponse.json({ message: "Done" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: error?.message || "Server error" }, { status: 500 })
    }
}

export const revalidate = 0