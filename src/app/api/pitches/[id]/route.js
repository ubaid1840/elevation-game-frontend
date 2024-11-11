import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  const { id } = params;

  try {
    const { score, status } = await req.json();

    let result;
    if (score !== undefined) {
      // Update score if score is provided
      result = await query(
        'UPDATE pitches SET score = $1 WHERE id = $2 RETURNING *',
        [score, id]
      );
    } else if (status !== undefined) {
      // Update status if status is provided
      result = await query(
        'UPDATE pitches SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );
    } else {
      // No valid parameter provided
      return NextResponse.json({ message: 'No valid parameter provided for update' }, { status: 400 });
    }

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Pitch not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error updating pitch:', error); // Log the error for debugging
    return NextResponse.json({ message: 'Error updating pitch', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
