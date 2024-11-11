import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
    const { id, round } = await req.json();

    try {
        const updatedGame = await pool.query(
            `UPDATE games 
         SET currentround = $1 
         WHERE id = $2 
         RETURNING *`,
            [round, id]
        );

        return NextResponse.json(updatedGame.rows[0], { status: 200 });
    } catch (error) {
        console.error('Error updating game:', error);
        return NextResponse.json({ message: 'Error updating game', error: error.message }, { status: 500 });
    }
}