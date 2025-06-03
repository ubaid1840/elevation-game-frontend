import { NextResponse } from "next/server";
import { query } from "@/lib/db"; // PostgreSQL connection

export async function GET() {
  try {
    console.log("Processing expired trivia games...");

    // Step 1: Fetch all expired games
    const expiredGamesResult = await query(
      `SELECT id, title, fee, game_percentage, prize, spots_remaining, winner_id FROM trivia_game 
       WHERE spots_remaining = 0 
       AND winner_id IS NULL`
    );

    const expiredGames = expiredGamesResult.rows;
    if (expiredGames.length === 0) {
      console.log("No expired games to process.");
      return NextResponse.json({ message: "No expired games found" }, { status: 200 });
    }

    for (const game of expiredGames) {
      const { id: gameId, game_percentage, fee, title, prize } = game;

      try {
        const enrollmentsResult = await query(
          `SELECT user_id, progress FROM trivia_game_enrollment WHERE game_id = $1`,
          [gameId]
        );

        if (enrollmentsResult.rows.length === 0) {
          console.log(`No participants found for game ID ${gameId}. Skipping.`);
          continue;
        }


        const userScores = enrollmentsResult.rows.map((enrollment) => {
          const progress = Array.isArray(enrollment.progress) ? enrollment.progress : [];
          const correctAnswers = progress.filter((p) => p.isCorrect).length;
          const totalTime = progress.reduce((acc, p) => acc + (Number(p.time_taken) || 0), 0);

          return { user_id: enrollment.user_id, correctAnswers, totalTime };
        });

        const winner = userScores.sort((a, b) =>
          b.correctAnswers - a.correctAnswers || a.totalTime - b.totalTime
        )[0];

        if (!winner || !winner.user_id) {
          console.log(`No valid winner found for game ID ${gameId}. Skipping.`);
          continue;
        }


        await query("BEGIN");

        await query(`UPDATE trivia_game SET winner_id = $1 WHERE id = $2`, [winner.user_id, gameId]);

       

        await query(
          `INSERT INTO transactions (user_id, amount, transaction_type, game_id, status, game_type)
           VALUES ($1, $2, 'Trivia game winning', $3, 'Completed', 'trivia')`,
          [winner.user_id, prize, gameId]
        );

        const tempStr = `Won game Trivia game - ${title}`
        await query(
          'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
          [winner.user_id, tempStr]
        );

        await query("COMMIT");

        console.log(`Winner updated: User ${winner.user_id} for game ID ${gameId}`);
      } catch (gameError) {
        await query("ROLLBACK");
        console.error(`Error processing game ID ${gameId}:`, gameError);
      }
    }

    console.log("Trivia game processing completed.");
    return NextResponse.json({ message: "Trivia games processed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Critical error in trivia game processing:", error);
    return NextResponse.json({ error: "Failed to process trivia games" }, { status: 500 });
  }
}

export const revalidate = 0;
