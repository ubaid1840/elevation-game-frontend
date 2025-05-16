import { query } from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET() {

    try {
        const result = await query(`
            SELECT * FROM trivia_settings
        `);

        return NextResponse.json(result.rows, { status: 200 });
    }
    catch (e) {
        return NextResponse.json({ referral_incentive_percentage: 0 }, { status: 500 });
    }

}

export async function PUT(req) {
    const { id, percentage } = await req.json()

    if (!id || !percentage) {
        return NextResponse.json({ message: "Invalid request" }, { status: 400 })
    }

    try {
        await query(`
            UPDATE trivia_settings 
            SET percentage = $1 
            WHERE id = $2
        `, [percentage, id]);

        return NextResponse.json({ message: "Updated" }, { status: 200 });
    }
    catch (e) {
        return NextResponse.json({ message: "Failed to update" }, { status: 500 });
    }
}

export const revalidate = 0; 