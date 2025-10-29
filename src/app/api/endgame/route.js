import { NextResponse } from 'next/server';
import pool, { query } from '@/lib/db'

export async function POST(req) {
    const { type, game_id, reason } = await req.json();
    console.log(type)

    if (!type || !game_id || !reason) {
        return NextResponse.json({ message: "Missing parameters" }, { status: 400 });
    }

    try {
        if (type === 'elevator') {
            const enrollments = await pool.query(
                'SELECT id, user_id FROM game_enrollments WHERE game_id = $1 ORDER BY id ASC ',
                [game_id]
            );

            const totalEnrollments = enrollments.rows;

            if (totalEnrollments.length === 0) {
                await pool.query(
                    `UPDATE games SET closed_by_admin = $1, close_reason = $2, spots_remaining = $3, total_spots = $4 WHERE id = $5`,
                    [true, reason, 0, totalEnrollments.length, game_id]
                );
                return NextResponse.json({ message: "No enrollments found, game closed" }, { status: 200 });
            }

            const winningUser = totalEnrollments[0];
            const winnerid = winningUser.user_id;

            const gameResult = await pool.query(`SELECT id, level FROM games WHERE id = $1`, [game_id]);
            if (gameResult.rows.length === 0) {
                return NextResponse.json({ message: 'Invalid game' }, { status: 400 });
            }

            const gameData = gameResult.rows[0];
            const amountQuery = await pool.query(`SELECT price FROM settings WHERE label = $1`, [gameData.level]);

            if (amountQuery.rows.length === 0) {
                return NextResponse.json({ message: 'Amount data not found' }, { status: 400 });
            }

            const amount = Number(amountQuery.rows[0].price);
            const winnerAmount1st = Number((amount * totalEnrollments.length * 0.3).toFixed(2));

            await pool.query(`BEGIN`);

            await pool.query(
                `UPDATE users SET winner_earnings = winner_earnings + $1 WHERE id = $2`,
                [winnerAmount1st, winnerid]
            );

            await pool.query(
                `INSERT INTO transactions (user_id, amount, game_id, status, game_type, transaction_type) 
         VALUES ($1, $2, $3, 'Completed', 'elevator', 'Elevator game winning')`,
                [winnerid, winnerAmount1st, game_id]
            );

            await pool.query(
                `UPDATE games SET winner = $1, closed_by_admin = $2, close_reason = $3, spots_remaining = $4, total_spots = $5 WHERE id = $6`,
                [winnerid, true, reason, 0, totalEnrollments.length, game_id]
            );

            await pool.query(`COMMIT`);

            return NextResponse.json({ notification: winnerid }, { status: 200 });
        } else if (type === 'trivia') {
            const response = await ProcessTriviaGameResult(game_id)
            let localReason = reason

            if (response?.message) {
                localReason = `${reason}, ${response.message}`
            }

            await pool.query(
                `UPDATE trivia_game SET closed_by_admin = $1, close_reason = $2, spots_remaining = $3, total_spots = total_participants WHERE id = $4`,
                [true, localReason, 0, game_id]
            );

            return NextResponse.json({ message: "Done" }, { status: 200 });

        }

        return NextResponse.json({ message: "Invalid game type" }, { status: 400 });

    } catch (error) {
        await pool.query(`ROLLBACK`);
        return NextResponse.json({ message: error?.message || "Server error" }, { status: 500 });
    }
}


async function ProcessTriviaGameResult(gid) {
    if (!gid) return;

    try {
        const expiredGamesResult = await query(
            `SELECT id, title, fee, game_percentage, prize, spots_remaining, winner_id 
       FROM trivia_game
       WHERE id = $1`,
            [gid]
        );

        const expiredGames = expiredGamesResult.rows;
        if (expiredGames.length === 0) {
            return;
        }

        const game = expiredGames[0];
        const { id: gameId, title, prize, fee, game_percentage } = game;

        const questionCountResult = await query(
            `SELECT COUNT(*) AS total_questions FROM trivia_questions WHERE game_id = $1`,
            [gameId]
        );
        const totalQuestions = Number(questionCountResult.rows[0].total_questions || 0);

        if (totalQuestions === 0) {
            console.log(`No questions found for game ID ${gameId}. Skipping.`);
            return
        }

        const enrollmentsResult = await query(
            `SELECT user_id, progress FROM trivia_game_enrollment WHERE game_id = $1`,
            [gameId]
        );

        if (enrollmentsResult.rows.length === 0) {
            console.log(`No participants found for game ID ${gameId}. Skipping.`);
            return
        }

        let winner = null

        if (enrollmentsResult.rows.length === 1) {
            winner = enrollmentsResult.rows[0]
        } else {
            const userScores = enrollmentsResult.rows.map((enrollment) => {
                const progress = Array.isArray(enrollment.progress) ? enrollment.progress : [];
                const correctAnswers = progress.filter((p) => p.isCorrect).length;
                const totalTime = progress.reduce((acc, p) => acc + (Number(p.time_taken) || 0), 0);
                return { user_id: enrollment.user_id, correctAnswers, totalTime };
            });

            const highestScore = Math.max(...userScores.map(u => u.correctAnswers));

            if (highestScore === 0) {
                return { message: 'No player answered any question correctly' };
            }

            winner = userScores.sort(
                (a, b) => b.correctAnswers - a.correctAnswers || a.totalTime - b.totalTime
            )[0];
        }

        if (!winner || !winner.user_id) {
            console.log(`No valid winner found for game ID ${gameId}.`);
            return;
        }

        const prize_amount = Number(fee) * Number(enrollmentsResult.rows.length) * (Number(game_percentage) / 100);

        await query("BEGIN");

        await query(`UPDATE trivia_game SET winner_id = $1, prize = $2 WHERE id = $3`, [
            winner.user_id,
            prize_amount,
            gameId,
        ]);

        await query(
            `INSERT INTO transactions (user_id, amount, transaction_type, game_id, status, game_type)
       VALUES ($1, $2, 'Trivia game winning', $3, 'Completed', 'trivia')`,
            [winner.user_id, prize_amount, gameId]
        );

        const tempStr = `Won game Trivia game - ${title}`;
        await query(`INSERT INTO logs (user_id, action) VALUES ($1, $2)`, [
            winner.user_id,
            tempStr,
        ]);

        await query("COMMIT");

    } catch (error) {
        console.log("Critical error in trivia game processing:", error);
        await query("ROLLBACK");
    }
}
