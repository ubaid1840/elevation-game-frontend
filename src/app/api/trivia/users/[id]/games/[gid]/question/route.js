import { query } from "@/lib/db";
import { NextResponse } from "next/server";



export async function GET(req, { params }) {
  const { id, gid } = params;

  try {

    const enrollmentResult = await query(
      "SELECT progress FROM trivia_game_enrollment WHERE user_id = $1 AND game_id = $2",
      [id, gid]
    );

    if (enrollmentResult.rows.length === 0) {
      return NextResponse.json(
        { message: "No enrollment found for the given user and game IDs." },
        { status: 404 }
      );
    }

    let progress = enrollmentResult.rows[0].progress || [];


    if (typeof progress === "string") {
      progress = JSON.parse(progress);
    }


    let ongoingQuestion = progress.find((p) => p.time_taken === null);

    if (ongoingQuestion) {

      const questionResult = await query(
        "SELECT id, text, options, time FROM trivia_questions WHERE id = $1",
        [ongoingQuestion.question_id]
      );

      if (questionResult.rows.length > 0) {
        const question = questionResult.rows[0];


        const startTime = new Date(ongoingQuestion.start_time).getTime();
        const currentTime = new Date().getTime();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000);
        const remainingTime = question.time - elapsedTime;

        if (remainingTime > 0) {

          return NextResponse.json({
            message: "Continuing existing question",
            question: question.text,
            time: remainingTime,
            question_id: question.id,
            options: question.options,
          });
        } else {

          ongoingQuestion.time_taken = question.time;
          ongoingQuestion.isCorrect = false;


          await query(
            "UPDATE trivia_game_enrollment SET progress = $1 WHERE user_id = $2 AND game_id = $3",
            [JSON.stringify(progress), id, gid]
          );
        }
      }
    }


    const questionsResult = await query(
      "SELECT id, text, options, time FROM trivia_questions WHERE game_id = $1",
      [gid]
    );

    if (questionsResult.rows.length === 0) {
      return NextResponse.json(
        { message: "No questions found for this game." },
        { status: 404 }
      );
    }


    const remainingQuestions = questionsResult.rows.filter(
      (q) => !progress.some((p) => p.question_id === q.id)
    );

    if (remainingQuestions.length === 0) {
      await ProcessTriviaGameResult(gid)
      return NextResponse.json(
        { message: "All questions have been attempted." },
        { status: 200 }
      );
    }


    const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
    const selectedQuestion = remainingQuestions[randomIndex];


    progress.push({
      question_id: selectedQuestion.id,
      start_time: new Date().toISOString(),
      selected_option: null,
      isCorrect: null,
      time_taken: null,
    });


    await query(
      "UPDATE trivia_game_enrollment SET progress = $1 WHERE user_id = $2 AND game_id = $3",
      [JSON.stringify(progress), id, gid]
    );

    return NextResponse.json({
      question: selectedQuestion.text,
      time: selectedQuestion.time,
      question_id: selectedQuestion.id,
      options: selectedQuestion.options,
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { message: "Error fetching question", error: error.message },
      { status: 500 }
    );
  }
}


export async function POST(req, { params }) {
  try {
    const { question_id, selected_option } = await req.json();
    const { id, gid } = params;


    if (!id || !gid || !question_id) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }


    const questionResult = await query(
      "SELECT correct, time FROM trivia_questions WHERE id = $1 AND game_id = $2",
      [question_id, gid]
    );

    if (questionResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Question not found or does not belong to this game." },
        { status: 404 }
      );
    }

    const { correct: correctAnswer, time: fullTime } = questionResult.rows[0];
    const isCorrect = selected_option === correctAnswer;


    const enrollmentResult = await query(
      "SELECT progress FROM trivia_game_enrollment WHERE user_id = $1 AND game_id = $2",
      [id, gid]
    );

    if (enrollmentResult.rows.length === 0) {
      return NextResponse.json(
        { message: "User not enrolled in the game." },
        { status: 404 }
      );
    }

    let progress = enrollmentResult.rows[0].progress || [];


    if (typeof progress === "string") {
      progress = JSON.parse(progress);
    }


    const questionProgress = progress.find((p) => p.question_id === question_id);

    if (!questionProgress) {
      return NextResponse.json(
        { message: "Question not found in progress. Please request a new question first." },
        { status: 400 }
      );
    }


    const startTime = new Date(questionProgress.start_time);
    const endTime = new Date();
    let timeTaken = (endTime - startTime) / 1000;
    timeTaken = timeTaken < 0 ? 0 : parseFloat(timeTaken.toFixed(2));


    if (selected_option === null) {
      questionProgress.isCorrect = false;
      questionProgress.time_taken = fullTime;
    } else {

      questionProgress.selected_option = selected_option;
      questionProgress.isCorrect = isCorrect;
      questionProgress.time_taken = timeTaken;
    }


    await query(
      "UPDATE trivia_game_enrollment SET progress = $1 WHERE user_id = $2 AND game_id = $3",
      [JSON.stringify(progress), id, gid]
    );

    return NextResponse.json({
      message: "Answer recorded",
      isCorrect: questionProgress.isCorrect,
      time_taken: questionProgress.time_taken,
      correct_answer: correctAnswer,
      progress,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json(
      { message: "Error submitting answer", error: error.message },
      { status: 500 }
    );
  }
}

async function ProcessTriviaGameResult(gid) {
  if (!gid) return;

  try {
    const expiredGamesResult = await query(
      `SELECT id, title, fee, game_percentage, prize, spots_remaining, winner_id 
       FROM trivia_game 
       WHERE spots_remaining = 0 
       AND winner_id IS NULL 
       AND id = $1`,
      [gid]
    );

    const expiredGames = expiredGamesResult.rows;
    if (expiredGames.length === 0) {
      return;
    }

    const game = expiredGames[0];
    const { id: gameId, game_percentage, fee, title, prize } = game;

    const questionCountResult = await query(
      `SELECT COUNT(*) AS total_questions FROM trivia_questions WHERE game_id = $1`,
      [gameId]
    );
    const totalQuestions = Number(questionCountResult.rows[0].total_questions || 0);

    if (totalQuestions === 0) {
      console.log(`No questions found for game ID ${gameId}. Skipping.`);
      return;
    }

    const enrollmentsResult = await query(
      `SELECT user_id, progress FROM trivia_game_enrollment WHERE game_id = $1`,
      [gameId]
    );

    if (enrollmentsResult.rows.length === 0) {
      console.log(`No participants found for game ID ${gameId}. Skipping.`);
      return;
    }

    for (const enrollment of enrollmentsResult.rows) {
      const progress = Array.isArray(enrollment.progress) ? enrollment.progress : [];
      const answeredQuestions = progress.length;

      if (answeredQuestions < totalQuestions) {
        console.log(
          `User ${enrollment.user_id} has not answered all questions. Stopping winner selection.`
        );
        return;
      }
    }

    // Compute user scores
    const userScores = enrollmentsResult.rows.map((enrollment) => {
      const progress = Array.isArray(enrollment.progress) ? enrollment.progress : [];
      const correctAnswers = progress.filter((p) => p.isCorrect).length;
      const totalTime = progress.reduce((acc, p) => acc + (Number(p.time_taken) || 0), 0);
      return { user_id: enrollment.user_id, correctAnswers, totalTime };
    });

    const highestScore = Math.max(...userScores.map(u => u.correctAnswers));

    if (highestScore === 0) {
      await query("BEGIN");
      await query(
        `UPDATE trivia_game SET closed_by_admin = TRUE, close_reason = 'No one answered any question correctly' WHERE id = $1`,
        [gameId]
      );
      await query("COMMIT");    
      return;
    }

    // Determine winner
    const winner = userScores.sort(
      (a, b) => b.correctAnswers - a.correctAnswers || a.totalTime - b.totalTime
    )[0];

    if (!winner || !winner.user_id) {
      console.log(`No valid winner found for game ID ${gameId}.`);
      return;
    }

    await query("BEGIN");

    await query(`UPDATE trivia_game SET winner_id = $1 WHERE id = $2`, [
      winner.user_id,
      gameId,
    ]);

    await query(
      `INSERT INTO transactions (user_id, amount, transaction_type, game_id, status, game_type)
       VALUES ($1, $2, 'Trivia game winning', $3, 'Completed', 'trivia')`,
      [winner.user_id, prize, gameId]
    );

    const tempStr = `Won game Trivia game - ${title}`;
    await query(`INSERT INTO logs (user_id, action) VALUES ($1, $2)`, [
      winner.user_id,
      tempStr,
    ]);

    await query("COMMIT");

    console.log(`Winner updated: User ${winner.user_id} for game ID ${gameId}`);

  } catch (error) {
    console.log("Critical error in trivia game processing:", error);
    await query("ROLLBACK");
  }
}






export const revalidate = 0;