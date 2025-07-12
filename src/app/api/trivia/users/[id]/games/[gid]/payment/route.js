import { query } from '@/lib/db';
import { NextResponse } from 'next/server';


export async function PUT(req, { params }) {
    const { id, gid } = await params;
    const { payment_intent_id } = await req.json()

    try {

        
        const existingPayment = await query(
            "SELECT 1 FROM trivia_game_enrollment WHERE user_id = $1 AND game_id = $2 AND payment_intent_id = $3",
            [id, gid, payment_intent_id]
        );

        
        if (existingPayment.rows.length > 0) {
            return NextResponse.json({ message: "Payment already recorded" }, { status: 200 });
        }

        await query(
            "UPDATE trivia_game_enrollment SET payment_intent_id = $1, payment_date = $2 WHERE user_id = $3 AND game_id = $4",
            [payment_intent_id, new Date(), id, gid]
        );



        await query(
            `INSERT INTO transactions (user_id, amount, transaction_type, game_id, status, game_type)
             SELECT $1, fee, 'Trivia game entry fee', id, 'Completed', 'trivia'
             FROM trivia_game WHERE id = $2`,
            [id, gid]
        );

        const result = await query(`SELECT percentage FROM trivia_settings WHERE id = 1`);
        const percentage = result.rows[0].percentage;
        const referrerResult = await query(
            "SELECT referrer_id FROM referrals WHERE referred_id = $1",
            [id]
        );

        if (referrerResult.rows.length > 0) {
            const referrer_id = referrerResult.rows[0].referrer_id;


            const gameResult = await query(
                "SELECT fee, title FROM trivia_game WHERE id = $1",
                [gid]
            );

            if (gameResult.rows.length > 0) {
                const fee = gameResult.rows[0].fee;
                const title = gameResult.rows[0].title
                const commission = (Number(percentage) / 100) * Number(fee);


                await query(
                    `INSERT INTO transactions (user_id, amount, game_id, status, game_type, transaction_type, reference_id) 
                 VALUES ($1, $2, $3, 'Completed', 'trivia', 'Trivia game referral earning', $4)`,
                    [referrer_id, commission, gid, id]
                );
                const tempStr = `Made payment of $${fee || ""} for trivia game - ${title || ""}`
                await query(
                    'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
                    [id, tempStr]
                );
            }


        }

        return NextResponse.json({ message: "Payment successful" }, { status: 200 });
    } catch (error) {
        console.error('Error saving payment', error);
        return NextResponse.json({ message: 'Error saving payment', error: error.message }, { status: 500 });
    }
}

export const revalidate = 0;
