import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  const { id } = params;

  try {
    const { score, by, status } = await req.json();

    let result;
    if (score !== undefined) {

      result = await query(
        `
        UPDATE pitches
        SET scores = jsonb_set(
          scores, 
          $1, 
          $2, 
          true 
        )
        WHERE id = $3
        RETURNING *;
        `,
        [`{${by}}`, JSON.stringify(score), id]
      );
    } else if (status !== undefined) {
      
      result = await query(
        'UPDATE pitches SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );
    } else {
      
      return NextResponse.json({ message: 'No valid parameter provided for update' }, { status: 400 });
    }

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Pitch not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error updating pitch:', error); 
    return NextResponse.json({ message: 'Error updating pitch', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
