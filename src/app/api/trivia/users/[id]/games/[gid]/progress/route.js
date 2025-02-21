import { query } from '@/lib/db';
import { NextResponse } from 'next/server';


export async function PUT(req, { params }) {
    const { id, gid } = await params;
    const { progress } = await req.json()

    try {
        await query(
            'UPDATE trivia_game_enrollment SET progress = $1 WHERE user_id = $2 AND game_id = $3',
            [progress, id, gid]
        );

        return NextResponse.json({ message: "Progress Saved" }, { status: 200 });
    } catch (error) {
        console.error('Error saving payment', error);
        return NextResponse.json({ message: 'Error saving progress', error: error.message }, { status: 500 });
    }
}

export const revalidate = 0;
