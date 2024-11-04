import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    const { id } = params;
  
    try {
      const user = await query('SELECT * FROM logs WHERE user_id = $1', [id]);
      return NextResponse.json(user.rows);
    } catch (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json({ message: 'Error fetching user', error: error.message }, { status: 500 });
    }
  }