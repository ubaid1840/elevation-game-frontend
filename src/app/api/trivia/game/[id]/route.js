import pool, { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
  const { id } = params;

  try {

    await pool.query(
      `
      DELETE FROM trivia_game_enrollment
      WHERE game_id = $1
      `,
      [id]
    );



    await pool.query(
      `
      DELETE FROM trivia_game
      WHERE id = $1
      `,
      [id]
    );

    return NextResponse.json({ message: "Game deleted" }, { status: 200 });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ message: 'Error deleting game', error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = await params;
  const { user_id } = await req.json()

  try {

    if (!user_id) {
      return NextResponse.json({ message: "Parameners missing" }, { status: 404 });
    }

    const game = await pool.query(`
      SELECT title, spots_remaining from trivia_game WHERE id = $1`, [id])

    if (game.rows[0].spots_remaining > 0) {
      const insertNewEntry = `
            INSERT INTO trivia_game_enrollment (user_id, game_id)
            VALUES ($1, $2)
            RETURNING *;
          `;
      await query(insertNewEntry, [
        Number(user_id),
        id
      ]);

      await pool.query('UPDATE trivia_game SET spots_remaining = spots_remaining - 1, total_participants = total_participants + 1 WHERE id = $1', [id]);

      await pool.query('UPDATE users SET last_active = $1 WHERE id = $2', [new Date(), Number(user_id)]);

      const tempStr = `Enrolled in trivia game - ${game.rows.length > 0 ? game.rows[0].title : ""}`
      await query(
        'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
        [Number(user_id), tempStr]
      );


      return NextResponse.json({ message: "Enrollment successful" }, { status: 200 });

    } else {
      // No spots remaining, send an error response
      return NextResponse.json({ message: 'No spots remaining' }, { status: 400 });
    }


  } catch (error) {
    console.error('Error', error);
    return NextResponse.json({ message: 'Error Enrollment', error: error.message }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  const { id } = await params;

  try {
    // Fetch game data
    const gameData = await query(
      `
      SELECT 
          tg.*, 
          COALESCE(u1.name, NULL) AS created_by_name,
          COALESCE(u3.name, NULL) AS winner_name
      FROM trivia_game tg
      LEFT JOIN users u1 ON tg.created_by = u1.id
      LEFT JOIN users u3 ON tg.winner_id = u3.id
      WHERE tg.id = $1;
      `,
      [id]
    );
  
    // Fetch enrollments
    const enrollments = await query(
      `
      SELECT 
          tge.*, 
          COALESCE(u2.name, NULL) AS user_name
      FROM trivia_game_enrollment tge
      LEFT JOIN users u2 ON tge.user_id = u2.id
      WHERE tge.game_id = $1;
      `,
      [id]
    );
  
    return NextResponse.json(
      {
        game: gameData.rows[0] || {},
        enrollments: enrollments.rows || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json({ message: "Error fetching games", error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
