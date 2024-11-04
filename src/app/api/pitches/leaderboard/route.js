import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Retrieve top 10 pitches with user names
    const result = await query(
      'SELECT pitches.*, users.name FROM pitches JOIN users ON pitches.user_id = users.id ORDER BY pitches.score DESC LIMIT 10'
    );

    // Return the pitches data
    return NextResponse.json({ pitches: result.rows }, { status: 201 });
  } catch (error) {
    console.error('Error fetching pitches:', error); // Log the error for debugging
    return NextResponse.json({ message: 'Error fetching pitches', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
