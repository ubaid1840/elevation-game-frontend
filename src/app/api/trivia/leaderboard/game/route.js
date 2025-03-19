import pool, { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Fetch all games
        const gamesResult = await query(`
            SELECT id, title, winner_id, prize 
            FROM trivia_game 
            ORDER BY id DESC
        `);

        if (gamesResult.rows.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        const gameIds = gamesResult.rows.map(game => game.id);

        // Fetch all enrollments for these games
        const enrollmentsResult = await query(`
            SELECT user_id, game_id, progress 
            FROM trivia_game_enrollment 
            WHERE game_id = ANY($1)
        `, [gameIds]);

        // Fetch user details (name, email)
        const userIds = [...new Set(enrollmentsResult.rows.map(e => e.user_id))];

        const usersResult = userIds.length > 0 ? await query(`
            SELECT id, name, email 
            FROM users 
            WHERE id = ANY($1)
        `, [userIds]) : { rows: [] };

        // Create a user mapping { user_id -> { name, email } }
        const usersMap = Object.fromEntries(usersResult.rows.map(user => [
            user.id, { name: user.name || "Unknown User", email: user.email || "No Email" }
        ]));

        // Fetch transactions where game_type = 'trivia'
        const transactionsResult = await query(`
            SELECT user_id, game_id, transaction_type, amount 
            FROM transactions 
            WHERE game_type = 'trivia' AND game_id = ANY($1)
        `, [gameIds]);

        // Process data
        const leaderboard = [];

        for (const game of gamesResult.rows) {
            // Filter enrollments for this game
            const gameEnrollments = enrollmentsResult.rows.filter(e => e.game_id === game.id);

            // Total enrolled players
            const totalEnrollments = gameEnrollments.length;

            if (totalEnrollments === 0) {
                leaderboard.push({
                    game_id: game.id,
                    game_title: game.title,
                    game_prize: game.prize,
                    total_enrollments: 0,
                    top_player: null
                });
                continue;
            }

            // Process user rankings
            const processedUsers = gameEnrollments.map(enrollment => {
                const progress = enrollment.progress || [];
                const correctAnswers = progress.filter(p => p.isCorrect).length;
                const totalTime = progress.reduce((acc, p) => acc + (Number(p.time_taken || 0)), 0);

                return {
                    user_id: enrollment.user_id,
                    user_name: usersMap[enrollment.user_id]?.name || "Unknown User",
                    user_email: usersMap[enrollment.user_id]?.email || "No Email",
                    correctAnswers,
                    totalQuestions: progress.length,
                    totalTime
                };
            });

            // Rank users (max correctAnswers first, min totalTime next)
            const rankedUsers = processedUsers.sort((a, b) =>
                b.correctAnswers - a.correctAnswers || a.totalTime - b.totalTime
            ).map((user, index) => ({ ...user, rank: index + 1 }));

            // Get the top player (Rank 1)
            const topPlayer = rankedUsers[0];

            if (!topPlayer) {
                leaderboard.push({
                    game_id: game.id,
                    game_title: game.title,
                    game_prize: game.prize,
                    total_enrollments: totalEnrollments,
                    top_player: null
                });
                continue;
            }

            // Get transactions for this game and top user
            const topUserTransactions = transactionsResult.rows.filter(
                t => t.game_id === game.id && t.user_id === topPlayer.user_id
            );

            // Calculate total referral earnings
            const totalReferrals = topUserTransactions
                .filter(t => t.transaction_type.includes("referral"))
                .reduce((sum, t) => sum + Number(t.amount), 0);

            // Determine winner status
            let winnerStatus = "TBD";
            if (game.winner_id) {
                winnerStatus = (game.winner_id === topPlayer.user_id) ? "Won" : "Lost";
            }

            // Push final structured data
            leaderboard.push({
                game_id: game.id,
                game_title: game.title,
                game_prize: game.prize,
                total_enrollments: totalEnrollments,
                top_player: {
                    user_id: topPlayer.user_id,
                    user_name: topPlayer.user_name,
                    user_email: topPlayer.user_email,
                    rank: topPlayer.rank,
                    correctAnswers: topPlayer.correctAnswers,
                    totalQuestions: topPlayer.totalQuestions,
                    total_referrals: totalReferrals,
                    winner_status: winnerStatus
                }
            });
        }

        return NextResponse.json(leaderboard, { status: 200 });

    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export const revalidate = 0;
