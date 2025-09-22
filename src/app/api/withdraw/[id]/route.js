import { query } from "@/lib/db"
import { sendSingleEmail } from "@/lib/notificationService";
import { NextResponse } from "next/server"


export async function GET(req, { params }) {

    const { id } = await params

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
  WHERE w.id = $1
  ORDER BY w.created_at DESC
`, [id]);

        const data = result.rows[0] || {}

        return NextResponse.json(data, { status: 200 })

    } catch (error) {
        return NextResponse.json({ message: error?.message || "Error occues" }, { status: 500 })
    }
}


export async function PUT(req, { params }) {
    const { admin_note, status, user_id } = await req.json()
    const { id } = await params

    try {
        if (!status || !user_id) {
            return NextResponse.json({ message: "Parameters missing" }, { status: 400 })
        }

        await query(`UPDATE withdraw SET status = $1, admin_note = $2 WHERE id = $3`, [status, admin_note || "", id])


        if (status === 'Rejected') {
            const rowData = await query(`SELECT requested_amount FROM withdraw WHERE id = $1`, [id])
            await query(`UPDATE users SET residual_income = residual_income + $1 WHERE id = $2`, [rowData.rows[0]?.requested_amount || 0, user_id])
        }

        sendSingleEmail(`Your withdrawal request is ${status}`, `Request ${status}`, user_id)



        return NextResponse.json({ message: "Data updated" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: error?.message || "Server error" }, { status: 500 })
    } finally {
        sendSingleEmail(`Your withdrawal request is ${status}`, `Request ${status}`, user_id)
    }


}