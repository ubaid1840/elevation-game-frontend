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
        bookings.booked_by = $1
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
  const { meeting_link } = await req.json();

  if (!meeting_link) {
    return NextResponse.json({ message: 'Meeting link is required' }, { status: 400 });
  }

  const today = moment().format('YYYY-MM-DD');

  try {
    const bookingsResult = await query(
      `
      SELECT * FROM bookings
      WHERE status = 'Not started' AND booked_for = $1;
      `,
      [id]
    );

    if (bookingsResult.rowCount === 0) {
      return NextResponse.json({ message: 'No bookings found for the given ID' }, { status: 404 });
    }

    const updatedBookings = [];

    for (const booking of bookingsResult.rows) {
      const bookingDate = moment(parseInt(booking.booking_date)).format('YYYY-MM-DD');
      if (bookingDate === today) {
      
        const updateResult = await query(
          `
          UPDATE bookings
          SET meeting_link = $1, status = 'Started'
          WHERE id = $2
          RETURNING *;
          `,
          [meeting_link, booking.id]
        );

        updatedBookings.push(updateResult.rows[0]); 
      }
    }

    if (updatedBookings.length === 0) {
      return NextResponse.json({ message: 'No bookings updated' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Meeting link and status updated successfully',
      updatedBookings: updatedBookings,
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
      SET meeting_link = $1, status = $2
      WHERE booked_for = $3 AND status = 'Started'
      RETURNING *
      `,
      ["", status, id]
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
