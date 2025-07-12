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





export const revalidate = 0;