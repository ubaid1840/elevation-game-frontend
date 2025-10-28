import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
    const { round, deadline } = await req.json();
    const { id } = await params

    try {

        const totalEnrollmentsQuery = await pool.query(
            `SELECT COUNT(*) AS total_enrollments FROM game_enrollments WHERE game_id = $1`,
            [id]
        );

        const totalEnrollments = Number(totalEnrollmentsQuery.rows[0].total_enrollments || 0);

        const updatedGame = await pool.query(
            `UPDATE games 
             SET currentround = $1, deadline = $2, spots_remaining = $3, total_spots = $4
             WHERE id = $5 
             RETURNING *`,
            [round, deadline, 0, totalEnrollments, id]
        );

        return NextResponse.json(updatedGame.rows[0], { status: 200 });
    } catch (error) {
        console.error('Error updating game:', error);
        return NextResponse.json({ message: 'Error updating game', error: error.message }, { status: 500 });
    }
}

export const revalidate = 0