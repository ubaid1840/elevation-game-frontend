import client from "@/lib/squareClient";
import { NextResponse } from "next/server";
import { SquareClient, SquareError } from "square";




export async function POST(req) {

    try {
        const { paymentId } = await req.json()
        const result = await client.payments.get({
            paymentId: paymentId,
        });

        return NextResponse.json({ response: result?.payment?.status, plan : result?.payment?.note }, { status: 200 })
    } catch (error) {
        if (error instanceof SquareError) {
            return NextResponse.json({ message: error?.body?.errors[0]?.category }, { status: 500 })
        } else {
            return NextResponse.json({ message: error?.message || "Something went wrong" }, { status: 500 })
        }

    }
}