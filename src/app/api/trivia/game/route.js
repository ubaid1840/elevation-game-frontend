import pool, { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// export async function GET() {
//   try {
//     const games = await query(
//       `SELECT id, title, total_participants, prize_amount, level, spots_remaining, currentRound, totalRounds, total_spots, deadline, 
//        array_length(additional_judges, 1) + 1 as totalJudges 
//        FROM games WHERE winner IS NULL`
//     );

//     const gamesWithEnrollments = await Promise.all(
//       games.rows.map(async (game) => {
//         const enrollments = await query(
//           'SELECT COUNT(*) as totalEnrollments FROM game_enrollments WHERE game_id = $1',
//           [game.id]
//         );
//         return {
//           ...game,
//           totalEnrollments: parseInt(enrollments.rows[0].totalenrollments, 10) || 0,
//         };
//       })
//     );

//     return NextResponse.json(gamesWithEnrollments, { status: 200 });
//   } catch (error) {
//     console.error('Error fetching games:', error);
//     return NextResponse.json({ message: 'Error fetching games', error: error.message }, { status: 500 });
//   }
// }


export async function POST(req) {
  try {
    const {
      deadline,
      fee,
      prize,
      title,
      questions,
      created_by,
      start_date,
      category,
      description,
      spots_remaining,
    } = await req.json();

    if (!deadline || !fee || !prize || !title || !questions || !created_by || !start_date || !category || !description || !spots_remaining) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const result = await query(`SELECT percentage FROM trivia_settings`);
    const percentage = result.rows[0].percentage;

    // Step 1: Insert into `trivia_game` table
    const newGame = await pool.query(
      `INSERT INTO trivia_game (deadline, fee, prize, title, created_by, start_date, description, category, spots_remaining, percentage) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id`, // Get the game_id after insertion
      [
        deadline,
        fee,
        prize,
        title,
        created_by,
        start_date,
        description,
        category,
        Number(spots_remaining),
        percentage
      ]
    );

    const gameId = newGame.rows[0].id; // Retrieve the inserted game ID

    // Step 2: Insert questions into `trivia_questions` table
    for (const question of questions) {
      await pool.query(
        `INSERT INTO trivia_questions (game_id, text, options, correct, time) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          gameId,
          question.text,
          JSON.stringify(question.options), // Save options as JSON
          question.correct,
          question.time
        ]
      );
    }

    // Step 3: Log the action
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
