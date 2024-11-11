import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Retrieve top 10 pitches with user names and game titles
    const result = await query(
      `SELECT pitches.*, users.name, games.title AS game_title 
       FROM pitches 
       JOIN users ON pitches.user_id = users.id 
       JOIN games ON pitches.game_id = games.id
       ORDER BY pitches.score DESC 
       LIMIT 10`
    );

    // Return the pitches data, including user name and game title
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching pitches:', error);
    return NextResponse.json({ message: 'Error fetching pitches', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
