import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(req) {
  try {
    // Parse the incoming request body to get the meeting ID
    const { id } = await req.json();

    // Validate the provided meeting ID
    if (!id) {
      return NextResponse.json(
        { message: 'Meeting ID is required' },
        { status: 400 }
      );
    }

    // Query to update the meeting status to false
    const updateStatusQuery = `
      UPDATE meetings
      SET status = false
      WHERE id = $1
      RETURNING *;
    `;

    // Execute the update query
    const { rows: updatedMeeting } = await query(updateStatusQuery, [id]);

    // Check if the meeting was found and updated
    if (updatedMeeting.length === 0) {
      return NextResponse.json(
        { message: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Return the updated meeting
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
