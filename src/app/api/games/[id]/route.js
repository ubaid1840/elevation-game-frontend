import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const gameResult = await pool.query(
      `SELECT 
        g.created_by AS createdBy, 
        g.additional_judges, 
        g.description,
        g.video_link,
        g.title,
        g.category,
        g.totalrounds,
        g.level,
        g.total_spots,
        g.spots_remaining,
        g.prize_amount,
        g.currentround,
        g.deadline,
        g.pitch_instruction,
        u.id AS participant_id, 
        u.name AS participant_name, 
        p.video_link AS pitch_video_link, 
        p.status AS pitch_status, 
        p.created_at AS pitch_created_at, 
        p.scores AS pitched_scores,
        c.comment_text AS comment, 
        c.created_at AS comment_created_at, 
        c.user_id AS commented_by 
       FROM games g 
       LEFT JOIN users u ON u.id IN (SELECT user_id FROM pitches WHERE game_id = g.id) 
       LEFT JOIN pitches p ON p.user_id = u.id AND p.game_id = g.id 
       LEFT JOIN comments c ON c.pitch_id = p.id 
       WHERE g.id = $1`,
      [id]
    );

    const game = gameResult.rows[0];

    if (!game) {
      return NextResponse.json({ message: "Game not found" }, { status: 404 });
    }

    const creatorResult = await pool.query(`SELECT name FROM users WHERE id = $1`, [game.createdby]);
    const creatorName = creatorResult.rows[0]?.name || null;

    const judgeIds = game.additional_judges || [];
    const judgesResult = await pool.query(`SELECT id, name FROM users WHERE id = ANY($1::int[])`, [judgeIds]);
    const judgeNames = judgesResult.rows.map(judge => judge.name);

    game.createdBy = creatorName;
    game.additional_judges_ids = game.additional_judges || []
    game.additional_judges = judgeNames;

    const priceResult = await pool.query(`SELECT price FROM settings WHERE label = $1`, [game.level]);
    const pricePerSpot = Number(priceResult.rows[0]?.price || 0);

    const prize_amount = pricePerSpot * Number(game.total_spots);
    game.prize_amount = prize_amount;
    game.first_prize = Number((prize_amount * 0.3).toFixed(2))
    game.second_prize = Number((prize_amount * 0.1).toFixed(2))
    game.prize_amount = game.first_prize

    return NextResponse.json(game, { status: 200 });
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json({ message: "Error fetching game", error: error.message }, { status: 500 });
  }
}


export async function PUT(req, { params }) {
  const { id } = await params;
  const { winnerid, roundinstruction, winnerid2nd } = await req.json();

  if (!id) {
    return NextResponse.json({ message: 'Required information missing' }, { status: 404 });
  }

  try {

    if (winnerid) {

      const gameResult = await pool.query(`SELECT * FROM games WHERE id = $1`, [id]);
      const gameData = gameResult.rows[0];
      if (!gameData) {
        return NextResponse.json(
          { message: "Invalid game record" },
          { status: 404 }
        );
      }
      const amountResult = await pool.query(
        `SELECT price FROM settings WHERE label = $1`,
        [gameData.level]
      );

      if (!amountResult.rows.length) {
        return NextResponse.json(
          { message: "Invalid or missing level configuration" },
          { status: 400 }
        );
      }
      const amount = Number(amountResult.rows[0].price || 0);
      const totalSpots = Number(gameData.total_spots);
      const winnerAmount1st = Number((amount * totalSpots * 0.3).toFixed(2));
      const winnerAmount2nd = Number((amount * totalSpots * 0.1).toFixed(2));



      await pool.query(
        `UPDATE users 
           SET winner_earnings = winner_earnings + $1, residual_income = residual_income + $1 
           WHERE users.id = $2`,
        [winnerAmount1st, winnerid]
      );

      await pool.query(
        `INSERT INTO transactions (user_id, amount, game_id, status, game_type, transaction_type) 
         VALUES ($1, $2, $3, 'Completed', 'elevator', 'Elevator game winning')`,
        [winnerid, winnerAmount1st, id]
      );

      if (winnerid2nd) {


        await pool.query(
          `UPDATE users 
           SET winner_earnings = winner_earnings + $1, residual_income = residual_income + $1 
           WHERE users.id = $2`,
          [winnerAmount2nd, winnerid2nd]
        );
        await pool.query(
          `INSERT INTO transactions (user_id, amount, game_id, status, game_type, transaction_type) 
         VALUES ($1, $2, $3, 'Completed', 'elevator', 'Elevator game winning')`,
          [winnerid2nd, winnerAmount2nd, id]
        );

      }

      const updateQuery = winnerid2nd
        ? `UPDATE games SET winner = $1, winner_2nd = $2 WHERE id = $3 RETURNING *`
        : `UPDATE games SET winner = $1 WHERE id = $2 RETURNING *`;

      const updatedGame = await pool.query(
        updateQuery,
        winnerid2nd ? [winnerid, winnerid2nd, id] : [winnerid, id]
      );

      return NextResponse.json(updatedGame.rows[0], { status: 200 });
    }

    if (roundinstruction) {
      const updatedGame = await pool.query(
        `UPDATE games 
         SET roundinstruction = $1 
         WHERE id = $2 
         RETURNING *`,
        [roundinstruction, id]
      );
      return NextResponse.json(updatedGame.rows[0], { status: 200 });
    }

    return NextResponse.json({ message: "Data saved" }, { status: 200 })

  } catch (error) {
    return NextResponse.json({ message: 'Error updating game', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    await pool.query(
      `
      DELETE FROM comments
      WHERE pitch_id IN (
        SELECT id FROM pitches
          WHERE game_id = $1
      )
      `,
      [id]
    );

    await pool.query(
      `
      DELETE FROM pitches
      WHERE game_id = $1
      
      `,
      [id]
    );

    await pool.query(
      `
      DELETE FROM game_enrollments
      WHERE game_id = $1
      `,
      [id]
    );

    await pool.query(
      `
      DELETE FROM testimonials
      WHERE game_id = $1
      `,
      [id]
    );

    await pool.query(
      `
      DELETE FROM games
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

export const revalidate = 0;
