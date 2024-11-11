import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Parse the incoming request body
    const { booked_by, booked_for, booking_date } = await req.json();

    // Validate required fields
    if (!booked_by || !booked_for || !booking_date) {
      return NextResponse.json(
        { message: 'booked_by and booked_for are required' },
        { status: 400 }
      );
    }

    // Query to insert a new booking
    const insertBookingQuery = `
      INSERT INTO bookings (booked_by, booked_for, booking_date)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const { rows: newBooking } = await query(insertBookingQuery, [
      booked_by,
      booked_for,
      booking_date,
    ]);

    await query(
      'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
      [booked_by, `User Booked a session with Judge`]
    );

    return NextResponse.json(newBooking[0], { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { message: 'Error creating booking', error: error.message },
      { status: 500 }
    );
  }
}


export const revalidate = 0;
