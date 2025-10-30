import { query } from "@/lib/db";
import client from "@/lib/squareClient";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { SquareError } from "square";


export async function POST(req) {

    try {
        const { token, note, amount, gid, uid } = await req.json()

        if (!token || !amount) {
            return NextResponse.json({ message: "Parameters missing" }, { status: 400 })
        }

        if (note === 'elevator') {
            const checkQuery = await query(`SELECT id FROM game_enrollments WHERE user_id = $1 AND game_id = $2`, [Number(uid), Number(gid)])
            if (checkQuery.rows.length > 0) {
                return NextResponse.json({ alreadyPaid: true }, { status: 200 })
            }
        }

        if (note === 'trivia') {
            const checkQuery = await query(`SELECT payment_intent_id FROM trivia_game_enrollment WHERE user_id = $1 AND game_id = $2`, [Number(uid), Number(gid)])
            if (checkQuery.rows.length > 0 && checkQuery.rows[0]?.payment_intent_id) {
                return NextResponse.json({ alreadyPaid: true }, { status: 200 })
            }
        }

        const localAmount = Number(amount)

        const result = await client.payments.create({
            idempotencyKey: randomUUID(),
            sourceId: token,
            locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
            amountMoney: {
                currency: 'USD',
                amount: BigInt(localAmount * 100)
            },
            note: note,
        })

        return NextResponse.json({ message: "Payment done", paymentId: result?.payment?.id }, { status: 200 })
    } catch (error) {
        console.log(error)

        if (error instanceof SquareError) {
            await query(
                `INSERT INTO error_logs (message, type) VALUES ($1, $2)`,
                [JSON.stringify(error), "payment"]
            );
            return NextResponse.json({ message: error?.body?.errors[0]?.category || "Something went wrong" }, { status: 500 })
        } else {
            return NextResponse.json({ message: error?.message || "Something went wrong" }, { status: 500 })
        }

    }


}

export const revalidate = 0