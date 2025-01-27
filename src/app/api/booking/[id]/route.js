import { query } from '@/lib/db';
import moment from 'moment';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const bookings = await query(
      `
      SELECT 
        bookings.*, 
        users.name AS booked_for_name
      FROM 
        bookings
      JOIN 
        users ON bookings.booked_for = users.id
      WHERE 
        $1 = ANY(bookings.users)
      `,
      [id]
    );

    return NextResponse.json(bookings.rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ message: 'Error fetching bookings', error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  const { meeting_link, status } = await req.json();

  if (!status) {
    return NextResponse.json({ message: 'Status is required' }, { status: 400 });
  }

  try {
    const updateResult = await query(
      `
      UPDATE bookings
      SET meeting_link = $1, status = $2
      WHERE id = $3
      RETURNING *;
      `,
      [meeting_link, status, id]
    );

    if (updateResult.rowCount === 0) {
      return NextResponse.json({ message: 'No matching booking found or already started' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Meeting link and status updated successfully',
      updatedBooking: updateResult.rows[0],
    });
  } catch (error) {
    console.error('Error updating meeting link:', error);
    return NextResponse.json({ message: 'Error updating meeting link', error: error.message }, { status: 500 });
  }
}



export async function POST(req, { params }) {
  const { id } = params;
  const { status } = await req.json();

  if (!status) {
    return NextResponse.json({ message: 'Status is required' }, { status: 400 });
  }

  try {
    const result = await query(
      `
      UPDATE bookings
      SET meeting_link = $1, status = 'Ended'
      WHERE id = $2
      RETURNING *
      `,
      ["", id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No bookings found to update' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Bookings updated successfully',
      updatedBookings: result.rows,
    });
  } catch (error) {
    console.error('Error updating bookings:', error);
    return NextResponse.json({ message: 'Error updating bookings', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
