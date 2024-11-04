import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  const { id } = params;

  try {
    const { score } = await req.json();

    const result = await query(
      'UPDATE pitches SET score = $1 WHERE id = $2 RETURNING *',
      [score, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Pitch not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error updating score:', error); // Log the error for debugging
    return NextResponse.json({ message: 'Error updating score', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
