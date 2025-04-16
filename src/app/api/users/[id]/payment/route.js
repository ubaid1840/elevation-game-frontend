import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
    const { subscription, expiry, paymentIntentId } = await req.json();
    const { id } = params;

    try {

        if (subscription === 'Promotion') {
            const userResult = await query('SELECT * FROM users WHERE id = $1', [id]);
            const user = userResult.rows[0];

            if (!user) {
                return NextResponse.json({ message: 'User not found', success: false }, { status: 404 });
            }

            await query(
                'UPDATE users SET role = $1, annual_package = $2, annual_package_expiry = $3, annual_package_intent_id = $4, last_active = $5 WHERE id = $6',
                ["judge", subscription, expiry, paymentIntentId, new Date(), id]
            );

            const promotionAmount = 750

            await query(
                `INSERT INTO transactions (user_id, amount,  status, transaction_type, game_type) 
             VALUES ($1, $2, 'Completed', 'Promoted to judge', 'elevator')`,
                [id, promotionAmount]
            );

            await query(
                'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
                [id, `User promoted to judge`]
            );

            return NextResponse.json({ success: true }, { status: 200 });

        } else {
            const userResult = await query('SELECT * FROM users WHERE id = $1', [id]);
            const user = userResult.rows[0];

            if (!user) {
                return NextResponse.json({ message: 'User not found', success: false }, { status: 404 });
            }
            if (user.package_intent_id) {
                if (user.package_intent_id === paymentIntentId) {
                    return NextResponse.json({ message: 'PaymentIntentId already processed', success: false }, { status: 200 });
                }
            }

            const updatedUser = await query(
                'UPDATE users SET package = $1, package_expiry = $2, last_active = $3, package_intent_id = $4 WHERE id = $5 RETURNING *',
                [subscription, expiry, new Date(), paymentIntentId, id]
            );

            const userPlan = await query(
                'SELECT price FROM settings WHERE label = $1 LIMIT 1',
                [subscription]
            )

            const amountToSave = Number(userPlan.rows[0].price)

            await query(
                `INSERT INTO transactions (user_id, amount,  status, transaction_type, game_type) 
             VALUES ($1, $2, 'Completed', 'Subscription payment', 'elevator')`,
                [id, amountToSave]
            );


            const firstReferrerResult = await query(
                'SELECT referrer_id FROM referrals WHERE referred_id = $1 LIMIT 1',
                [id]
            );

            if (firstReferrerResult.rows.length === 0) {
                return NextResponse.json({ message: 'No referrer found for the user' }, { status: 200 });
            }

            const referrer_id = firstReferrerResult.rows[0].referrer_id;
            let referrer2_id = null;
            if (referrer_id) {
                const secondReferrerResult = await query(
                    'SELECT referrer_id FROM referrals WHERE referred_id = $1 LIMIT 1',
                    [referrer_id]
                );
                if (secondReferrerResult.rows.length > 0) {
                    referrer2_id = secondReferrerResult.rows[0].referrer_id;
                }
            }
            let referrer3_id = null;
            if (referrer2_id) {
                const thirdReferrerResult = await query(
                    'SELECT referrer_id FROM referrals WHERE referred_id = $1 LIMIT 1',
                    [referrer2_id]
                );
                if (thirdReferrerResult.rows.length > 0) {
                    referrer3_id = thirdReferrerResult.rows[0].referrer_id;
                }
            }
            if (referrer_id) {
                const checkPlan = await query(
                    'SELECT package FROM users WHERE id = $1 LIMIT 1',
                    [referrer_id]
                );
                if (checkPlan === 'Silver') {
                    await query(
                        'UPDATE users SET direct_referral = direct_referral + ($1 * 0.03) WHERE id = $2',
                        [amountToSave, referrer_id]
                    );
                    await query(
                        `INSERT INTO transactions (user_id, amount,  status, transaction_type, game_type, reference_id) 
                     VALUES ($1, ($2 * 0.03), 'Completed', 'Silver subscription referral earning', 'elevator', $3)`,
                        [referrer_id, amountToSave, id]
                    );
                } else {
                    if(checkPlan === 'Platinum'){
                        await query(
                            'UPDATE users SET tier1 = tier1 + ($1 * 0.2) WHERE id = $2',
                            [amountToSave, referrer_id]
                        );
    
                        await query(
                            `INSERT INTO transactions (user_id, amount,  status, transaction_type, game_type, reference_id) 
                         VALUES ($1, ($2 * 0.2), 'Completed', 'Tier1 20% subscription referral earning', 'elevator', $3)`,
                            [referrer_id, amountToSave, id]
                        );
                    } else if(checkPlan === 'Gold'){

                        await query(
                            'UPDATE users SET tier2 = tier2 + ($1 * 0.1) WHERE id = $2',
                            [amountToSave, referrer_id]
                        );
    
                        await query(
                            `INSERT INTO transactions (user_id, amount,  status, transaction_type, game_type, reference_id) 
                         VALUES ($1, ($2 * 0.1), 'Completed', 'Tier2 10% subscription referral earning', 'elevator', $3)`,
                            [referrer_id, amountToSave, id]
                        );

                    } else if(checkPlan === 'Iridium'){
                        await query(
                            'UPDATE users SET tier3 = tier3 + ($1 * 0.05) WHERE id = $2',
                            [amountToSave, referrer_id]
                        );
    
                        await query(
                            `INSERT INTO transactions (user_id, amount,  status, transaction_type, game_type, reference_id) 
                         VALUES ($1, ($2 * 0.05), 'Completed', 'Tier3 5% subscription referral earning', 'elevator', $3)`,
                            [referrer_id, amountToSave, id]
                        );
                    }
                   
                }

            }
            if (referrer2_id) {
                const checkPlan = await query(
                    'SELECT package FROM users WHERE id = $1 LIMIT 1',
                    [referrer2_id]
                );
                if (checkPlan !== 'Silver') {

                    if(checkPlan === 'Platinum'){
                        await query(
                            'UPDATE users SET tier1 = tier1 + ($1 * 0.1) WHERE id = $2',
                            [amountToSave, referrer2_id]
                        );
    
                        await query(
                            `INSERT INTO transactions (user_id, amount,  status, transaction_type, game_type, reference_id) 
                         VALUES ($1, ($2 * 0.1), 'Completed', 'Tier1 10% subscription referral earning', 'elevator', $3)`,
                            [referrer2_id, amountToSave, id]
                        );
                    } else if(checkPlan === 'Gold'){

                        await query(
                            'UPDATE users SET tier2 = tier2 + ($1 * 0.05) WHERE id = $2',
                            [amountToSave, referrer2_id]
                        );
    
                        await query(
                            `INSERT INTO transactions (user_id, amount,  status, transaction_type, game_type, reference_id) 
                         VALUES ($1, ($2 * 0.05), 'Completed', 'Tier2 5% subscription referral earning', 'elevator', $3)`,
                            [referrer2_id, amountToSave, id]
                        );

                    } else if(checkPlan === 'Iridium'){
                        await query(
                            'UPDATE users SET tier3 = tier3 + ($1 * 0.025) WHERE id = $2',
                            [amountToSave, referrer2_id]
                        );
    
                        await query(
                            `INSERT INTO transactions (user_id, amount,  status, transaction_type, game_type, reference_id) 
                         VALUES ($1, ($2 * 0.025), 'Completed', 'Tier3 2.5% subscription referral earning', 'elevator', $3)`,
                            [referrer2_id, amountToSave, id]
                        );
                    }
                }
            }

            if (referrer3_id) {
                const checkPlan = await query(
                    'SELECT package FROM users WHERE id = $1 LIMIT 1',
                    [referrer3_id]
                );
                if (checkPlan !== 'Silver') {
                    if(checkPlan === 'Platinum'){
                        await query(
                            'UPDATE users SET tier1 = tier1 + ($1 * 0.05) WHERE id = $2',
                            [amountToSave, referrer3_id]
                        );
    
                        await query(
                            `INSERT INTO transactions (user_id, amount,  status, transaction_type, game_type, reference_id) 
                         VALUES ($1, ($2 * 0.05), 'Completed', 'Tier1 5% subscription referral earning', 'elevator', $3)`,
                            [referrer3_id, amountToSave, id]
                        );
                    } else if(checkPlan === 'Gold'){

                        await query(
                            'UPDATE users SET tier2 = tier2 + ($1 * 0.025) WHERE id = $2',
                            [amountToSave, referrer3_id]
                        );
    
                        await query(
                            `INSERT INTO transactions (user_id, amount,  status, transaction_type, game_type, reference_id) 
                         VALUES ($1, ($2 * 0.025), 'Completed', 'Tier2 2.5% subscription referral earning', 'elevator', $3)`,
                            [referrer3_id, amountToSave, id]
                        );

                    } else if(checkPlan === 'Iridium'){
                        await query(
                            'UPDATE users SET tier3 = tier3 + ($1 * 0.0125) WHERE id = $2',
                            [amountToSave, referrer3_id]
                        );
    
                        await query(
                            `INSERT INTO transactions (user_id, amount,  status, transaction_type, game_type, reference_id) 
                         VALUES ($1, ($2 * 0.0125), 'Completed', 'Tier3 1.25% subscription referral earning', 'elevator', $3)`,
                            [referrer3_id, amountToSave, id]
                        );
                    }
                }
            }


            //// related to code above first ReferralResult

            // const referrer = await query(
            //     'SELECT referrer_id FROM referrals WHERE referred_id = $1 LIMIT 1',
            //     [id]
            // )

            // if (referrer.rows.length != 0) {
            //     const referrer_id = referrer.rows[0].referrer_id
            //     if (referrer_id) {
            //         const referrerInfo = await query(
            //             'SELECT package FROM users WHERE id = $1 LIMIT 1',
            //             [referrer_id]
            //         )
            //         if (referrerInfo.rows[0].package) {
            //             if (referrerInfo.rows[0].package === 'Silver') {
            //                 await query(
            //                     'UPDATE users SET direct_referral = direct_referral + ($1 * 0.03) WHERE id = $2',
            //                     [amountToSave, referrer_id]
            //                 );

            //             } else if (referrerInfo.rows[0].package === 'Platinum') {
            //                 await query(
            //                     'UPDATE users SET tier1 = tier1 + ($1 * 0.2) WHERE id = $2',
            //                     [amountToSave, referrer_id]
            //                 );
            //             } else if (referrerInfo.rows[0].package === 'Gold') {
            //                 await query(
            //                     'UPDATE users SET tier2 = tier2 + ($1 * 0.1) WHERE id = $2',
            //                     [amountToSave, referrer_id]
            //                 );
            //             } else if (referrerInfo.rows[0].package === 'Iridium') {
            //                 await query(
            //                     'UPDATE users SET tier3 = tier3 + ($1 * 0.05) WHERE id = $2',
            //                     [amountToSave, referrer_id]
            //                 );
            //             }
            //         }
            //     }
            // }

            //// related to code above first ReferralResult ends here

            ///// Old work below keep it for safety

            // if (!user.package_intent_id) {
            //     const silverReferrer = await query(
            //         'SELECT referrer_id FROM referrals WHERE referred_id = $1 LIMIT 1',
            //         [id]
            //     );

            //     if (silverReferrer.rows.length !== 0) {
            //         const referrer_id = silverReferrer.rows[0].referrer_id;
            //         if (referrer_id) {
            //             const referrerInfo = await query (
            //                 'SELECT package FROM users WHERE id = $1',
            //                 [referrer_id]
            //             )
            //             if(referrerInfo.rows[0].package && referrerInfo.rows[0].package == 'Silver'){
            //                 const planResult = await query(
            //                     'SELECT price FROM settings WHERE label = $1 LIMIT 1',
            //                     [subscription]
            //                 );
            //                 const amount = Number(planResult.rows[0].price);
            //                 await query(
            //                     'UPDATE users SET direct_referral = direct_referral + ($1 * 0.3) WHERE id = $2',
            //                     [amount, referrer_id]
            //                 );
            //             }

            //         }
            //     }

            // }

            //// old work ends here

            await query(
                'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
                [id, `Subscription changed to ${subscription}`]
            );

            return NextResponse.json({ success: true, user: updatedUser.rows[0] }, { status: 200 });
        }

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: 'Error updating user', error: error.message }, { status: 500 });
    }
}

export const revalidate = 0;
