import { query } from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(req, { params }) {
    try {
      const { id, gid } = await params;
  
      if (!id || !gid) {
        return NextResponse.json({ message: "Game ID and User ID are required" }, { status: 400 });
      }
  
      
      const gameResult = await query(
        "SELECT * FROM trivia_game_enrollment WHERE game_id = $1 AND user_id = $2",
        [gid, id]
      );
  
      if (gameResult.rows.length === 0) {
        return NextResponse.json({ message: "Game not found" }, { status: 404 });
      }
  
      const gameDetails = gameResult.rows[0];
  
      
      const questionsResult = await query(
        "SELECT * FROM trivia_questions WHERE game_id = $1",
        [gid]
      );
  
      if (questionsResult.rows.length === 0) {
        return NextResponse.json({ message: "No questions found for this game" }, { status: 404 });
      }

      const questions = questionsResult.rows;
  
  
      return NextResponse.json({
       
        gameDetails,
        questions,
      });
    } catch (error) {
      console.error("Error fetching game details:", error);
      return NextResponse.json(
        { message: "Error fetching game details", error: error.message },
        { status: 500 }
      );
    }
  }

  
  export const revalidate = 0