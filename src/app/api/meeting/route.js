import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {

        const { meeting_link, created_by, created_at, status } = await req.json();


        if (!meeting_link || !created_by) {
            return NextResponse.json(
                { message: 'meeting_link and created_by are required' },
                { status: 400 }
            );
        }


        const insertMeetingQuery = `
      INSERT INTO meetings (meeting_link, created_by, created_at, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;


        const { rows: newMeeting } = await query(insertMeetingQuery, [
            meeting_link,
            created_by,
            created_at || new Date(),
            status || false,
        ]);


        return NextResponse.json(newMeeting[0], { status: 201 });
    } catch (error) {
        console.error('Error creating meeting:', error);
        return NextResponse.json(
            { message: 'Error creating meeting', error: error.message },
            { status: 500 }
        );
    }
}

export const revalidate = 0;
