import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    const { id } = params;

    try {
        const referralsResult = await query('SELECT * FROM referrals WHERE referrer_id = $1', [id]);
        if (referralsResult.rows.length >= 50) {
            const userIds = referralsResult.rows.map(referral => referral.referrer_id); 
            const usersResult = await query('SELECT package FROM users WHERE id = ANY($1)', [userIds]);
            const platinumCount = usersResult.rows.filter(user => user.package === 'Platinum').length;
            if (platinumCount >= 50) {
                return NextResponse.json({ message: 'Eligible' });
            } else {
                return NextResponse.json({ error: 'Not Eligible' });
            }
        } else {
            return NextResponse.json({ error: 'Not Eligible' });
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ message: 'Error fetching user', error: error.message }, { status: 500 });
    }
}

export const revalidate = 0;
