import { query } from '@/lib/db';
import moment from 'moment';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    const { jid } = params;
  
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
          bookings.booked_for = $1
        `,
        [jid]
      );
  
      return NextResponse.json(bookings.rows);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json({ message: 'Error fetching bookings', error: error.message }, { status: 500 });
    }
  }