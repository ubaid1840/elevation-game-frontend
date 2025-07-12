import pool, { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        
        const gamesResult = await query(`
            SELECT id, title, winner_id, game_percentage, fee, total_spots, prize FROM trivia_game 
            ORDER BY id DESC
        `);

        if (gamesResult.rows.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        const gameIds = gamesResult.rows.map(game => game.id);

        
        const enrollmentsResult = await query(`
            SELECT user_id, game_id, progress FROM trivia_game_enrollment 
            WHERE game_id = ANY($1)
        `, [gameIds]);

        
        const userIds = [...new Set(enrollmentsResult.rows.map(e => e.user_id))];

        const usersResult = userIds.length > 0 ? await query(`
            SELECT id, name, email FROM users 
            WHERE id = ANY($1)
        `, [userIds]) : { rows: [] };

        
        const usersMap = Object.fromEntries(usersResult.rows.map(user => [
            user.id, { name: user.name || "Unknown User", email: user.email || "No Email" }
        ]));

        
        const transactionsResult = await query(`
            SELECT user_id, game_id, transaction_type, amount 
            FROM transactions 
            WHERE game_type = 'trivia' AND game_id = ANY($1)
        `, [gameIds]);

        
        const leaderboard = [];

        for (const game of gamesResult.rows) {
            
            const gameEnrollments = enrollmentsResult.rows.filter(e => e.game_id === game.id);

            
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

            
            const rankedUsers = processedUsers.sort((a, b) =>
                b.correctAnswers - a.correctAnswers || a.totalTime - b.totalTime
            ).map((user, index) => ({ ...user, rank: index + 1 }));

            
            rankedUsers.forEach(user => {
                
                const userTransactions = transactionsResult.rows.filter(t => t.game_id === game.id && t.user_id === user.user_id);

                
                const totalReferrals = userTransactions
                    .filter(t => t.transaction_type.includes("referral"))
                    .reduce((sum, t) => sum + Number(t.amount), 0);

                
                let winnerStatus = "TBD";
                if (game.winner_id) {
                    winnerStatus = (game.winner_id === user.user_id) ? "Won" : "Lost";
                }

               

                
                leaderboard.push({
                    game_id: game.id,
                    game_title: game.title,
                    game_prize: game.prize,
                    game_fee: game.fee,
                    user_id: user.user_id,
                    user_name: user.user_name,
                    user_email: user.user_email,
                    rank: user.rank,
                    correctAnswers: user.correctAnswers,
                    totalQuestions: user.totalQuestions,
                    total_referrals: totalReferrals,
                    winner_status: winnerStatus
                });
            });
        }

        return NextResponse.json(leaderboard, { status: 200 });

    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }


}

export const revalidate = 0