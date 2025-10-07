import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {

    const { id } = await params
    try {
        const { requested_amount, method, note, cash_app_info } = await req.json();

        if (!requested_amount || !method) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

         if (isNaN(requested_amount) ) {
            return NextResponse.json(
                { message: "Wrong amount" },
                { status: 400 }
            );
        }

        // Minimum $10 check
        if (isNaN(requested_amount) || Number(requested_amount) < 10) {
            return NextResponse.json(
                { message: "Minimum withdraw is $10" },
                { status: 400 }
            );
        }

        // Check residual income
        const { rows } = await query(
            `SELECT residual_income FROM users WHERE id = $1`,
            [id]
        );
        const residualIncome = Number(rows[0]?.residual_income || 0);

        if (requested_amount > residualIncome) {
            return NextResponse.json(
                { message: "Withdraw amount exceeds available income" },
                { status: 400 }
            );
        }

        // Insert request
        await query(
            `INSERT INTO withdraw (user_id, requested_amount, method, note, cash_app_info)
       VALUES ($1, $2, $3, $4, $5)`,
            [id, requested_amount, method, note || null, cash_app_info]
        );

        await query(
            `UPDATE users SET residual_income = residual_income - $1 WHERE id = $2`,
            [Number(requested_amount), id]
        );

        const actionMsg = `Withdrawal request submitted for $${requested_amount}`
        await query(
            'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
            [Number(id), actionMsg]
        );

        return NextResponse.json(
            { message: "Withdrawal request submitted successfully" },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: error.message || "Error processing withdrawal" },
            { status: 500 }
        );
    }
}

export async function GET(req, { params }) {

    const { id } = await params

    try {
        const result = await query(`SELECT * FROM withdraw WHERE user_id = $1`, [id])
        const userResult = await query(`SELECT residual_income FROM users WHERE id = $1`, [id])

        return NextResponse.json({ withdraw: result.rows, residual_income: userResult.rows[0]?.residual_income || 0 }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ message: error?.message || "Error fetching data" }, { status: 500 })
    }


}

export const revalidate = 0