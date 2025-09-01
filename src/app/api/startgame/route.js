// routes.js
import { query } from "@/lib/db";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
    const { game_id, judge_id, deadline } = await req.json();

    if (!game_id || !judge_id) {
        return NextResponse.json({ message: "Missing parameters" }, { status: 400 })
    }

    try {

        const gameQuery = await query(
            `SELECT created_by, additional_judges, judges_count 
       FROM games WHERE id = $1`,
            [game_id]
        );

        if (gameQuery.rowCount === 0) {
            return NextResponse.json({ message: "Game not found" }, { status: 400 })
        }

        const game = gameQuery.rows[0];

        const createdBy = Number(game.created_by);
        const additionalJudges = game.additional_judges || [];
        let judgesCount = game.judges_count || [];

        // 2. Build list of total judges
        const totalJudges = [createdBy, ...additionalJudges];

        // 3. If judge already confirmed, skip duplicate insert
        if (!judgesCount.includes(judge_id)) {
            judgesCount.push(judge_id);

            // 4. Update DB with new judges_count
            await query(
                `UPDATE games SET judges_count = $1 WHERE id = $2`,
                [judgesCount, game_id]
            );
        }

        const requiredJudges =
            totalJudges.length > 3 ? 3 : totalJudges.length;

        if (judgesCount.length >= requiredJudges) {
            await query(
                `UPDATE games 
                       SET currentround = $1, deadline = $2
                       WHERE id = $3 
                       RETURNING *`,
                [1, deadline, game_id]
            );
        }

        if (Number(createdBy) === Number(judge_id)) {
            await query(
                `UPDATE games 
                       SET deadline = $1
                       WHERE id = $2 
                       RETURNING *`,
                [deadline, game_id]
            );
        }

        return NextResponse.json({ message: "Done" }, { status: 200 })
    } catch (err) {
        console.error("Error starting game:", err);
        return NextResponse.json({ message: err?.message || "Server error" }, { status: 500 })
    }
}


export const revalidate = 0
