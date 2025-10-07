import { query } from "@/lib/db"
import { NextResponse } from "next/server"


export async function GET() {

    try {
        const result = await query(`
 SELECT 
    w.*, 
    u.name AS user_name,
    u.id AS user_id,
    u.email AS user_email,
    u.role AS user_role,
    u.referral_code AS user_referral_code,
    u.package AS user_package,
    u.residual_income AS user_residual_income,
    r.referrer_id,
    ru.name AS referrer_name
  FROM withdraw w
  LEFT JOIN users u ON w.user_id = u.id
  LEFT JOIN referrals r ON u.id = r.referred_id
  LEFT JOIN users ru ON r.referrer_id = ru.id
  ORDER BY w.created_at DESC
`);



        return NextResponse.json(result.rows, { status: 200 })

    } catch (error) {
        return NextResponse.json({ message: error?.message || "Error occues" }, { status: 500 })
    }
}

export const revalidate = 0