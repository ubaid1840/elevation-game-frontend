import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req, { params }) {
    try {
        const { email } = params;
     
        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const data = await pool.query(
            ` SELECT *
        FROM users
        WHERE email = $1`,
            [email]
        );


        if (data.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }



        // Send the role as the response
        return NextResponse.json(data.rows[0]);
    } catch (error) {
        console.error('Error fetching role:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const revalidate = 0;
