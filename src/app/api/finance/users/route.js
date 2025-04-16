import { query } from "@/lib/db";
import moment from "moment";
import { NextResponse } from "next/server";


export async function GET(req) {

    try {
        const usersRes = await query(`SELECT id, name, package, email FROM users WHERE role = 'user'`);
        const users = usersRes.rows;

        const finalData = [];

        for (const user of users) {
            const { id: userId, name, package: userPackage, email } = user;

            // 2. Get transactions for this user
            const transactionsRes = await query(
                `SELECT amount, transaction_type, game_type, game_id, created_at FROM transactions WHERE user_id = $1`,
                [userId]
            );
            const transactions = transactionsRes.rows;

            // Calculate totals and latest date
            let total_elevator = 0;
            let total_trivia = 0;
            let latestDate = null;

            transactions.forEach((tx) => {
                if (tx.game_type === 'elevator' && tx.game_id && tx.transaction_type.includes('winning')) total_elevator += parseFloat(tx.amount);
                if (tx.game_type === 'trivia' && tx.game_id && tx.transaction_type.includes('winning')) total_trivia += parseFloat(tx.amount);
                if (!latestDate || new Date(tx.created_at) > new Date(latestDate)) {
                    latestDate = moment(tx.created_at).format("DD/MM/YYYY");
                }
            });

            // 3. Get referral information
            const referralRes = await query(
                `SELECT referrer_id FROM referrals WHERE referred_id = $1`,
                [userId]
            );
            const referrerId = referralRes.rows[0]?.referrer_id || null;

            let referralCode = null;
            if (referrerId) {
                const refUserRes = await query(`SELECT referral_code FROM users WHERE id = $1`, [referrerId]);
                referralCode = refUserRes.rows[0]?.referral_code || null;
            }

            // 4. Get package price from settings
            const priceRes = await query(`SELECT price FROM settings WHERE label = $1`, [userPackage]);
            const purchase = priceRes.rows[0]?.price || null;

            // 5. Tier and Percentage
            let tier = null;
            let percentage = null;

            if (userPackage === 'Platinum') {
                tier = 'Tier1';
                percentage = '20%, 10%, 5%';
            } else if (userPackage === 'Gold') {
                tier = 'Tier2';
                percentage = '10%, 5%, 2.5%';
            } else if (userPackage === 'Iridium') {
                tier = 'Tier3';
                percentage = '5%, 2.5%, 1.25%';
            }

            finalData.push({
                user_name: name,
                referral_from: referralCode,
                package: userPackage,
                tier,
                email,
                purchase,
                percentage,
                total_elevator,
                total_trivia,
                date: latestDate,
                id : userId
            });
        }
        return NextResponse.json(finalData, { status: 200 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Error" }, { status: 200 });
    }



}