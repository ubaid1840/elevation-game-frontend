import { NextResponse } from "next/server"

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {

    try {
        const { amount, plan } = await req.json()
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "usd",
            automatic_payment_methods: { enabled: true },
            metadata: {
                note: plan
            }
        })

        return NextResponse.json({ clientSecret: paymentIntent.client_secret })
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            message: `Internal Server Error ${error}`
        }, { status: 500 })

    }

} 