import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import moment from 'moment';

export async function GET(req, { params }) {
    try {

        const { email } = await params;

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        const data = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        if (data.rows.length === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const user = data.rows[0];

        



        let hasActiveWaiver = false;
        let monthlySubscriptionStatus = true
        let annualSubscriptionStatus = true
        let navigationAllowed = true


        if (!user.package_expiry || moment().isAfter(moment(user.package_expiry, "YYYY-MM-DD"), "day")) {
            monthlySubscriptionStatus = false
            navigationAllowed = false
        }

        if (user.role === 'judge') {
            if (!user.annual_package_expiry || moment().isAfter(moment(user.annual_package_expiry, "YYYY-MM-DD"), "day")) {
                annualSubscriptionStatus = false
                navigationAllowed = false
            }
        }

        if (user.role === 'judge' && user.waiver_start) {
            const now = new Date();
            const waiverEnds = new Date(user.waiver_start);
            waiverEnds.setFullYear(waiverEnds.getFullYear() + 1);

            if (now <= waiverEnds) {
                hasActiveWaiver = true;
                navigationAllowed = true
            } else {
                const updatedUser = await pool.query(
                    `UPDATE users SET role = 'user' WHERE email = $1 RETURNING *`,
                    [email]
                );

                return NextResponse.json({ ...updatedUser.rows[0], hasActiveWaiver, downgraded: true, monthlySubscriptionStatus, annualSubscriptionStatus, navigationAllowed }, { status: 200 });
            }
        }

        return NextResponse.json({ ...user, hasActiveWaiver, monthlySubscriptionStatus, annualSubscriptionStatus, navigationAllowed, }, { status: 200 });

    } catch (error) {
        console.error('Error fetching role:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export const revalidate = 0;
