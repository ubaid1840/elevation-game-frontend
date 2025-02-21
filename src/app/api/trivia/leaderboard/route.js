import pool, { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const gamesResult = await query(`
        SELECT id, title FROM trivia_game 
        ORDER BY id DESC LIMIT 10
    `);
    
    const gameIds = gamesResult.rows.map(game => game.id);
    
    if (gameIds.length === 0) {
        return NextResponse.json([], { status: 200 });
    }
    
    // Fetch enrollments for these games
    const enrollmentsResult = await query(`
        SELECT user_id, game_id, progress FROM trivia_game_enrollment 
        WHERE game_id = ANY($1)
    `, [gameIds]);
    
    // Fetch user details
    const userIds = [...new Set(enrollmentsResult.rows.map(e => e.user_id))];
    
    const usersResult = userIds.length > 0 ? await query(`
        SELECT id, name FROM users 
        WHERE id = ANY($1)
    `, [userIds]) : { rows: [] };
    
    const usersMap = Object.fromEntries(usersResult.rows.map(user => [user.id, user.name || "Unknown User"]));
    
    // Process data
    const leaderboard = gamesResult.rows.map(game => {
        const gameEnrollments = enrollmentsResult.rows.filter(e => e.game_id === game.id);
    
        const processedUsers = gameEnrollments.map(enrollment => {
            const progress = enrollment.progress || [];
            const correctAnswers = progress.filter(p => p.isCorrect).length;
            const totalTime = progress.reduce((acc, p) => acc + (p.timeTaken || 0), 0);
            
            return {
                user_id: enrollment.user_id,
                user_name: usersMap[enrollment.user_id] || "Unknown User",
                correctAnswers,
                totalQuestions: progress.length,
                totalTime
            };
        });
    
        // Find the top user (max correct answers, min time)
        const topUser = processedUsers.sort((a, b) => 
            b.correctAnswers - a.correctAnswers || a.totalTime - b.totalTime
        )[0];
    
        return {
            game_id: game.id,
            game_title: game.title,
            top_user_name: topUser?.user_name || "No Players",
            total_correct_answers: topUser?.correctAnswers || 0,
            total_questions: topUser?.totalQuestions || 0,
            total_time_taken: topUser?.totalTime || 0
        };
    });
    
    return NextResponse.json(leaderboard, { status: 200 });
    
    
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ message: 'Error fetching games', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0