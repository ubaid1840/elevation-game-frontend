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
        fee ,
        prize ,
        title ,
        questions ,
        created_by,
        start_date,
        category,
        description,
        spots_remaining,
    } = await req.json();

    if (!deadline || !fee || !prize || !title || !questions || !created_by || !start_date || !category  || !description || !spots_remaining) {
        return NextResponse.json({ message: "All fields are required" }, { status: 400 });
      }

      const localQuestions = questions.map((item, index)=> ({...item, id : index}))

    const newGame = await pool.query(
      `INSERT INTO trivia_game (deadline, fee, prize, title, questions, created_by, start_date, description, category, spots_remaining) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        deadline,
        fee ,
        prize ,
        title ,
        localQuestions ,
        created_by,
        start_date,
        description,
        category,
        Number(spots_remaining)
      ]
    );

    const tempStr = `Created new trivia game - ${title}`
    await query(
      'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
      [Number(created_by), tempStr]
    );

    return NextResponse.json({message : "Game created"}, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ message: 'Error creating game', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
