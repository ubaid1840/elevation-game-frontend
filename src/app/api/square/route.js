import client from "@/lib/squareClient";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { SquareError } from "square";


export async function POST(req) {

    try {
        const { token, note, amount } = await req.json()

        if (!token || !amount) {
            return NextResponse.json({ message: "Parameters missing" }, { status: 400 })
        }

        const localAmount = Number(amount)

        const result = await client.payments.create({
            idempotencyKey: randomUUID(),
            sourceId: token,
            amountMoney: {
                currency: 'USD',
                amount: BigInt(localAmount)
            },
            note: note,
        })

        return NextResponse.json({ message: "Payment done", paymentId: result?.payment?.id }, { status: 200 })
    } catch (error) {
        console.log(error)
        if (error instanceof SquareError) {
            return NextResponse.json({ message: error?.body?.errors[0]?.category || "Something went wrong" }, { status: 500 })
        } else {
            return NextResponse.json({ message: error?.message || "Something went wrong" }, { status: 500 })
        }

    }


} 