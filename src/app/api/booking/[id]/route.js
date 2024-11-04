import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const bookings = await query(
      'SELECT * FROM bookings WHERE booked_by = $1',
      [id]
    );

    return NextResponse.json(bookings.rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ message: 'Error fetching bookings', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
