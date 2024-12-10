import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
    const { subscription, expiry, paymentIntentId } = await req.json();
    const { id } = params;

    try {
        const userResult = await query('SELECT * FROM users WHERE id = $1', [id]);
        const user = userResult.rows[0];

        if (!user) {
            return NextResponse.json({ message: 'User not found', success: false }, { status: 404 });
        }
        if (user.package_intent_id) {
            if (user.package_intent_id === paymentIntentId) {
                return NextResponse.json({ message: 'PaymentIntentId already processed', success: false });
            }
        }

        const updatedUser = await query(
            'UPDATE users SET package = $1, package_expiry = $2, last_active = $3, package_intent_id = $4 WHERE id = $5 RETURNING *',
            [subscription, expiry, new Date(), paymentIntentId, id]
        );

        if (!user.package_intent_id) {
            const silverReferrer = await query(
                'SELECT referrer_id FROM referrals WHERE referred_id = $1 LIMIT 1',
                [id]
            );

            if (silverReferrer.rows.length !== 0) {
                const referrer_id = silverReferrer.rows[0].referrer_id;
                if (referrer_id) {
                    const referrerInfo = await query (
                        'SELECT package FROM users WHERE id = $1',
                        [referrer_id]
                    )
                    if(referrerInfo.rows[0].package && referrerInfo.rows[0].package == 'Silver'){
                        const planResult = await query(
                            'SELECT price FROM settings WHERE label = $1 LIMIT 1',
                            [subscription]
                        );
                        const amount = Number(planResult.rows[0].price);
                        await query(
                            'UPDATE users SET direct_referral = direct_referral + ($1 * 0.3) WHERE id = $2',
                            [amount, referrer_id]
                        );
                    }
                   
                }
            }

        }

        await query(
            'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
            [id, `Subscription changed to ${subscription}`]
        );

        return NextResponse.json({ success: true, user: updatedUser.rows[0] });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: 'Error updating user', error: error.message }, { status: 500 });
    }
}

export const revalidate = 0;
