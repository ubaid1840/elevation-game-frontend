import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const referrals = await query('SELECT * FROM referrals WHERE referred_id = $1', [id]);
    return NextResponse.json(referrals.rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching referrals:', error); 
    return NextResponse.json({ message: 'Error fetching referrals', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
