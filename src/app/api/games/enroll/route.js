import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { userId, gameId, entryLevel, paymentIntent, price } = await req.json();

    if (!userId || !gameId) {
      return NextResponse.json({ message: "Parameters missing" }, { status: 404 })
    }

    const game = await pool.query('SELECT spots_remaining FROM games WHERE id = $1', [gameId]);
    if (game.rows.length === 0) {
      return NextResponse.json({ message: 'Game not found' }, { status: 404 });
    }
    const spotsRemaining = game.rows[0].spots_remaining;

    if (paymentIntent && price) {
      if (spotsRemaining > 0) {
        const enrollment = await pool.query(
          'INSERT INTO game_enrollments (user_id, game_id, status, created_at, payment_intent) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [userId, gameId, entryLevel, new Date(), paymentIntent]
        );

        await pool.query('UPDATE games SET spots_remaining = spots_remaining - 1 WHERE id = $1', [gameId]);

        await pool.query('UPDATE users SET last_active = $1 WHERE id = $2', [new Date(), userId]);

        await pool.query('INSERT INTO logs (user_id, action) VALUES ($1, $2)', [userId, `enrolled in game ${gameId}`]);

        await pool.query(
          `INSERT INTO transactions (user_id, amount, transaction_type, game_id, status, game_type)
                    VALUES ($1, $2, 'Elevator subscription payment', $3, 'Completed', 'elevator')`,
          [userId, price, gameId]
        );

        await pool.query('INSERT INTO logs (user_id, action) VALUES ($1, $2)', [userId, `Elevator game subscription payment`]);

        return NextResponse.json(enrollment.rows[0], { status: 200 });
      } else {
        return NextResponse.json({ message: 'No spots remaining' }, { status: 400 });
      }
    } else {
      const checkQuery = `
      SELECT 1
      FROM game_enrollments ge
      JOIN games g ON ge.game_id = g.id
      WHERE ge.user_id = $1
        AND ge.game_id != $2
        AND g.winner IS NULL
      LIMIT 1;
    `;

      const { rows } = await pool.query(checkQuery, [userId, gameId]);

      const alreadyEnrolled = rows.length > 0;

      if (alreadyEnrolled) {
        const levelQuery = await pool.query(`SELECT level FROM games WHERE id  = $1`, [gameId])
        const level = levelQuery.rows[0].level
        const priceQuery = await pool.query(`SELECT price FROM settings WHERE label = $1`, [level])
        const price = priceQuery.rows[0].price
        return NextResponse.json({ alreadyEnrolled, price }, { status: 200 });
      } else {
        if (spotsRemaining > 0) {
          const enrollment = await pool.query(
            'INSERT INTO game_enrollments (user_id, game_id, status, created_at) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, gameId, entryLevel, new Date()]
          );

          await pool.query('UPDATE games SET spots_remaining = spots_remaining - 1 WHERE id = $1', [gameId]);

          await pool.query('UPDATE users SET last_active = $1 WHERE id = $2', [new Date(), userId]);

          await pool.query('INSERT INTO logs (user_id, action) VALUES ($1, $2)', [userId, `enrolled in game ${gameId}`]);

          return NextResponse.json(enrollment.rows[0], { status: 201 });
        } else {
          return NextResponse.json({ message: 'No spots remaining' }, { status: 400 });
        }
      }




    }


  } catch (error) {
    return NextResponse.json({ message: 'Error enrolling in game', error: error.message }, { status: 500 });
  }
}


export const revalidate = 0;
