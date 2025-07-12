import pool, { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');

        if (!type || !['user', 'game'].includes(type)) {
            return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
        }

        const gamesResult = await query(`
            SELECT id, title, level, total_spots , winner, winner_2nd 
            FROM games
            ORDER BY id DESC
        `);

        if (gamesResult.rows.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        const gameIds = gamesResult.rows.map(game => game.id);

        const enrollmentsResult = await query(`
            SELECT user_id, game_id 
            FROM game_enrollments 
            WHERE game_id = ANY($1)
        `, [gameIds]);

        const pitchesResult = await query(`
            SELECT user_id, game_id, scores 
            FROM pitches 
            WHERE game_id = ANY($1)
        `, [gameIds]);

        const userIds = [...new Set(enrollmentsResult.rows.map(e => e.user_id))];
        const usersResult = userIds.length > 0 ? await query(`
            SELECT id, name, email 
            FROM users 
            WHERE id = ANY($1)
        `, [userIds]) : { rows: [] };

        const usersMap = Object.fromEntries(usersResult.rows.map(user => [
            user.id, { name: user.name || "Unknown User", email: user.email || "No Email" }
        ]));

        let responseData = [];

        for (const game of gamesResult.rows) {
            const gameEnrollments = enrollmentsResult.rows.filter(e => e.game_id === game.id);
            const totalEnrollments = gameEnrollments.length;

            const userScores = gameEnrollments.map(enrollment => {
                const userPitches = pitchesResult.rows.filter(p => p.game_id === game.id && p.user_id === enrollment.user_id);

                const totalScore = userPitches.reduce((sum, pitch) => {
                    const scores = Object.values(pitch.scores || {});
                    return sum + scores.reduce((acc, s) => acc + Number(s), 0);
                }, 0);

                return {
                    user_id: enrollment.user_id,
                    user_name: usersMap[enrollment.user_id]?.name || "Unknown User",
                    user_email: usersMap[enrollment.user_id]?.email || "No Email",
                    totalScore
                };
            });

            const rankedUsers = userScores.sort((a, b) => b.totalScore - a.totalScore)
                .map((user, index) => ({ ...user, rank: index + 1 }));

            const level = game.level;
            const totalSpots = Number(game?.total_spots || 0);

            const priceResult = await query(`SELECT price FROM settings WHERE label = $1`, [level]);
            const pricePerSpot = Number(priceResult.rows[0]?.price || 0);

            const prize_amount = pricePerSpot * totalSpots * 0.30;



            if (type === 'user') {

                const userData = rankedUsers.map(async user => {
                    let winnerStatus = "TBD";
                    if (game.winner) {
                        winnerStatus = (game.winner === user.user_id) ? "Won 1st prize" : "Lost";
                    }
                    if (game.winner_2nd) {
                        winnerStatus = (game.winner_2nd === user.user_id) ? "Won 2nd prize" : "Lost";
                    }

                    responseData.push({
                        game_id: game.id,
                        game_title: game.title,
                        prize_amount: prize_amount,
                        user_id: user.user_id,
                        user_name: user.user_name,
                        user_email: user.user_email,
                        rank: user.rank,
                        totalScore: user.totalScore,
                        winner_status: winnerStatus,
                        revenue_generated: prize_amount * totalEnrollments
                    })
                });




            }

            if (type === 'game') {
                const topPlayer = rankedUsers[0] || null;

                let winnerStatus = "TBD";
                let winnerName = "No Winner Yet";

                if (game.winner) {
                    winnerName = usersMap[game.winner]?.name || "Unknown Winner";
                    winnerStatus = (topPlayer?.user_id === game.winner) ? "Won" : "Lost";
                }



                responseData.push({
                    game_id: game.id,
                    game_title: game.title,
                    prize_amount: prize_amount,
                    top_player: topPlayer ? {
                        user_id: topPlayer.user_id,
                        user_name: topPlayer.user_name,
                        user_email: topPlayer.user_email,
                        totalScore: topPlayer.totalScore,
                        winner_status: winnerStatus
                    } : null,
                    total_enrollments: totalEnrollments,
                    winner_name: winnerName,
                    revenue_generated: prize_amount * totalEnrollments
                });
            }
        }

        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        console.error("Error fetching game data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export const revalidate = 0;
