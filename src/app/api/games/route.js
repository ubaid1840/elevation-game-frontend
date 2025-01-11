import pool, { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const games = await query(
      `SELECT id, title, total_participants, prize_amount, level, spots_remaining, currentRound, totalRounds, total_spots, deadline, 
       array_length(additional_judges, 1) + 1 as totalJudges 
       FROM games WHERE winner IS NULL`
    );

    const gamesWithEnrollments = await Promise.all(
      games.rows.map(async (game) => {
        const enrollments = await query(
          'SELECT COUNT(*) as totalEnrollments FROM game_enrollments WHERE game_id = $1',
          [game.id]
        );
        return {
          ...game,
          totalEnrollments: parseInt(enrollments.rows[0].totalenrollments, 10) || 0,
        };
      })
    );

    return NextResponse.json(gamesWithEnrollments, { status: 200 });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ message: 'Error fetching games', error: error.message }, { status: 500 });
  }
}


export async function POST(req) {
  try {
    const {
      title,
      description,
      totalRounds,
      category,
      spotsRemaining,
      additional_judges,
      total_spots,
      video_link,
      creator_id,
      prize_amount,
      deadline,
      currentround,
      level,
      pitch_instruction
    } = await req.json();

    const newGame = await pool.query(
      `INSERT INTO games 
       (title, description, totalRounds, category, spots_remaining, created_at, 
        additional_judges, total_spots, video_link, created_by, prize_amount, deadline, currentround, level, pitch_instruction) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
       RETURNING *`,
      [
        title,
        description,
        totalRounds,
        category,
        spotsRemaining,
        new Date(),
        additional_judges,
        total_spots,
        video_link,
        creator_id,
        prize_amount,
        deadline,
        currentround,
        level,
        pitch_instruction
      ]
    );

    return NextResponse.json(newGame.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ message: 'Error creating game', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
