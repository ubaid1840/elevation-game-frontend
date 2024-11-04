import { NextResponse } from "next/server"
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {

    try {
        const { paymentIntentId } = await req.json()
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status === 'succeeded') {
            return NextResponse.json({ success: true, plan: paymentIntent.metadata.note })
        } else {
            return NextResponse.json({
                message: `Payment not verified`
            }, { status: 500 })
        }
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            message: `Internal Server Error ${error}`
        }, { status: 500 })

    }
}

export const revalidate = 0;
