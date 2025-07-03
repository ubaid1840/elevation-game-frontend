import { query } from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(req) {

    try {
        const result = await query(`SELECT * FROM page_settings`);
        if (result.rows.length > 0) {
            return NextResponse.json(result.rows[0], { status: 200 })
        } else {
            return NextResponse.json({}, { status: 200 })
        }
    } catch (error) {
        return NextResponse.json({ message: "Server error" }, { status: 500 })
    }
}

export async function PUT(req) {

    const { id, privacy, terms, about } = await req.json();

    try {
        const result = await query(`UPDATE page_settings SET privacy = $1, terms = $2, about = $3 WHERE id = $4`, [privacy, terms, about, id]);
        return NextResponse.json({ message: "Page settings updated successfully" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "Server error" }, { status: 500 })
    }

}

export const revalidate = 0