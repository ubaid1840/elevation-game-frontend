import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await pool.query('SELECT id, name, tier1, tier2, tier3, role FROM users');
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json({ message: 'Error fetching participants', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
