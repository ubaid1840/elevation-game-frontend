import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: 'Meeting ID is required' },
        { status: 400 }
      );
    }

    const updateStatusQuery = `
      UPDATE meetings
      SET status = false
      WHERE id = $1
      RETURNING *;
    `;

    const { rows: updatedMeeting } = await query(updateStatusQuery, [id]);

    if (updatedMeeting.length === 0) {
      return NextResponse.json(
        { message: 'Meeting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedMeeting[0], { status: 200 });
  } catch (error) {
    console.error('Error ending meeting:', error);
    return NextResponse.json(
      { message: 'Error ending meeting', error: error.message },
      { status: 500 }
    );
  }
}

export const revalidate = 0;
