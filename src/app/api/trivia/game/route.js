import pool, { query } from '@/lib/db';
import { NextResponse } from 'next/server';


export async function POST(req) {
  try {
    const {
      deadline,
      fee,
      title,
      questions,
      created_by,
      start_date,
      category,
      description,
      spots_remaining,
      total_spots
    } = await req.json();

    if (!deadline || !fee  || !title || !questions || !created_by || !start_date || !category || !description || !spots_remaining) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const result = await query(`SELECT percentage FROM trivia_settings WHERE id = 1`);
    const gameResult = await query(`SELECT percentage FROM trivia_settings WHERE id = 2`);
    const percentage = result.rows[0].percentage;
    const gamePercentage = gameResult.rows[0].percentage;

    const prize_amount = Number(fee) * Number(total_spots) * (Number(gamePercentage) / 100);

    
    const newGame = await pool.query(
      `INSERT INTO trivia_game (deadline, fee, title, created_by, start_date, description, category, spots_remaining, percentage, game_percentage, total_spots, prize) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING id`,
      [
        deadline,
        fee,
        title,
        created_by,
        start_date,
        description,
        category,
        Number(spots_remaining),
        percentage,
        gamePercentage,
        total_spots,
        prize_amount
      ]
    );

    const gameId = newGame.rows[0].id; 

    
    for (const question of questions) {
      await pool.query(
        `INSERT INTO trivia_questions (game_id, text, options, correct, time) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          gameId,
          question.text,
          JSON.stringify(question.options), 
          question.correct,
          question.time
        ]
      );
    }

    
    const tempStr = `Created new trivia game - ${title}`;
    await query(
      'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
      [Number(created_by), tempStr]
    );

    return NextResponse.json({ message: "Game created successfully", gameId }, { status: 201 });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json({ message: "Error creating game", error: error.message }, { status: 500 });
  }
}


export const revalidate = 0;
