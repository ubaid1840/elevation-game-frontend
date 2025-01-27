import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {

  try {
    const { booked_by, booked_for, booking_date, booking_time } = await req.json();
    console.log(booked_by, booked_for, booking_date, booking_time)

    if (!booked_by || !booked_for || !booking_date || !booking_time) {
      return NextResponse.json(
        { message: 'Parameters missing' },
        { status: 400 }
      );
    }

    const checkBookingQuery = `
      SELECT * FROM bookings
      WHERE booking_date = $1 AND booking_time = $2
      ORDER BY booking_date DESC, booking_time DESC
      LIMIT 1;
    `;

    const { rows: existingBooking } = await query(checkBookingQuery, [
      booking_date,
      booking_time
    ]);

    if (existingBooking.length > 0) {
      const booking = existingBooking[0];


      if (booking.users.includes(Number(booked_by))) {
        if (booking.status !== "Ended") {
          return NextResponse.json(
            { message: 'Meeting already scheduled.' },
            { status: 400 }
          );
        } else {
          const insertBookingQuery = `
            INSERT INTO bookings (booked_for, booking_date, booking_time, users)
            VALUES ($1, $2, $3, ARRAY[$4]::integer[])
            RETURNING *;
          `;
          const { rows: newBooking } = await query(insertBookingQuery, [
            booked_for,
            booking_date,
            booking_time,
            Number(booked_by)
          ]);
        }
      } else {
        const updateBookingQuery = `
          UPDATE bookings
          SET users = array_append(users, $1)
          WHERE id = $2
          RETURNING *;
        `;
        const { rows: updatedBooking } = await query(updateBookingQuery, [
          Number(booked_by),
          booking.id
        ]);
        return NextResponse.json(updatedBooking[0]);
      }
    } else {
      console.log("here")
      const insertBookingQuery = `
        INSERT INTO bookings (booked_for, booking_date, booking_time, users)
        VALUES ($1, $2, $3, ARRAY[$4]::integer[])
        RETURNING *;
      `;
      const { rows: newBooking } = await query(insertBookingQuery, [
        booked_for,
        booking_date,
        booking_time,
        Number(booked_by)
      ]);
    }

    await query(
      'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
      [Number(booked_by), `User Booked a session with Judge`]
    );

    return NextResponse.json({message : "Booking successfull"}, { status: 200 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { message: 'Error creating booking', error: error.message },
      { status: 500 }
    );
  }
}


export const revalidate = 0;
