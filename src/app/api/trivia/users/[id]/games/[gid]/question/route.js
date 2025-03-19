import { query } from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(req, { params }) {
  const { id, gid } = params;

  try {
    // Check if the user is enrolled in the game
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

    // Ensure progress is an array (handle JSONB string case)
    if (typeof progress === "string") {
      progress = JSON.parse(progress);
    }

    // Check for an ongoing question (where time_taken is null)
    let ongoingQuestion = progress.find((p) => p.time_taken === null);

    if (ongoingQuestion) {
      // Fetch the original question details
      const questionResult = await query(
        "SELECT id, text, options, time FROM trivia_questions WHERE id = $1",
        [ongoingQuestion.question_id]
      );

      if (questionResult.rows.length > 0) {
        const question = questionResult.rows[0];

        // Calculate remaining time
        const startTime = new Date(ongoingQuestion.start_time).getTime();
        const currentTime = new Date().getTime();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000); // in seconds
        const remainingTime = question.time - elapsedTime;

        if (remainingTime > 0) {
          // Return same question with updated time
          return NextResponse.json({
            message: "Continuing existing question",
            question: question.text,
            time: remainingTime,
            question_id: question.id,
            options: question.options,
          });
        } else {
          // If time has expired, update progress with time_taken
          ongoingQuestion.time_taken = question.time; // Mark full time spent
          ongoingQuestion.isCorrect = false; // Assume incorrect since time ran out

          // Update progress in the database
          await query(
            "UPDATE trivia_game_enrollment SET progress = $1 WHERE user_id = $2 AND game_id = $3",
            [JSON.stringify(progress), id, gid]
          );
        }
      }
    }

    // Fetch all questions for the game
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

    // Filter out attempted questions
    const remainingQuestions = questionsResult.rows.filter(
      (q) => !progress.some((p) => p.question_id === q.id)
    );

    if (remainingQuestions.length === 0) {
      return NextResponse.json(
        { message: "All questions have been attempted." },
        { status: 200 }
      );
    }

    // Shuffle and pick a new question
    const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
    const selectedQuestion = remainingQuestions[randomIndex];

    // Store new question attempt with `start_time`
    progress.push({
      question_id: selectedQuestion.id,
      start_time: new Date().toISOString(),
      selected_option: null,
      isCorrect: null,
      time_taken: null,
    });

    // Update progress in the database
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

    console.log(question_id, selected_option, id, gid);

    if (!id || !gid || !question_id) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Fetch the correct answer and question time
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

    // Fetch current progress
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

    // Ensure progress is parsed correctly if stored as a string
    if (typeof progress === "string") {
      progress = JSON.parse(progress);
    }

    // Find the existing question attempt in progress
    const questionProgress = progress.find((p) => p.question_id === question_id);

    if (!questionProgress) {
      return NextResponse.json(
        { message: "Question not found in progress. Please request a new question first." },
        { status: 400 }
      );
    }

    // Calculate time difference in seconds
    const startTime = new Date(questionProgress.start_time);
    const endTime = new Date();
    let timeTaken = (endTime - startTime) / 1000; // Convert milliseconds to seconds
    timeTaken = timeTaken < 0 ? 0 : parseFloat(timeTaken.toFixed(2)); // Ensure two decimal places

    // ✅ If no answer was selected within the time, mark as incorrect
    if (selected_option === null) {
      questionProgress.isCorrect = false; // Assume incorrect since no answer was chosen
      questionProgress.time_taken = fullTime; // Assign full question time
    } else {
      // ✅ Update progress with the actual answer and time taken
      questionProgress.selected_option = selected_option;
      questionProgress.isCorrect = isCorrect;
      questionProgress.time_taken = timeTaken;
    }

    // Save updated progress to the database
    await query(
      "UPDATE trivia_game_enrollment SET progress = $1 WHERE user_id = $2 AND game_id = $3",
      [JSON.stringify(progress), id, gid] // ✅ Ensure JSONB compatibility
    );

    return NextResponse.json({
      message: "Answer recorded",
      isCorrect: questionProgress.isCorrect,
      time_taken: questionProgress.time_taken,
      correct_answer: correctAnswer, // ✅ Return correct answer
      progress, // Send updated progress back
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json(
      { message: "Error submitting answer", error: error.message },
      { status: 500 }
    );
  }
}





export const revalidate = 0;