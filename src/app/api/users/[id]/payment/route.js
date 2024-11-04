import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
    const { subscription, expiry, paymentIntentId } = await req.json();
    const { id } = params;

    try {
        // Fetch the user from the users table
        const userResult = await query('SELECT * FROM users WHERE id = $1', [id]);
        const user = userResult.rows[0];

        if (!user) {
            return NextResponse.json({ message: 'User not found', success: false }, { status: 404 });
        }

        // Check if the package_intent_id is null or not
        if (user.package_intent_id) {
            // Compare the current paymentIntentId with the one in the database
            if (user.package_intent_id === paymentIntentId) {
                return NextResponse.json({ message: 'PaymentIntentId already processed', success: false });
            }
        }

        // Update user with new subscription details
        const updatedUser = await query(
            'UPDATE users SET package = $1, package_expiry = $2, last_active = $3, package_intent_id = $4 WHERE id = $5 RETURNING *',
            [subscription, expiry, new Date(), paymentIntentId, id]
        );

        // Insert log entry for the action
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
