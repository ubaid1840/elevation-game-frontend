import { query } from "@/lib/db"
import { NextResponse } from "next/server"


export async function PUT(req, { params }) {

    const { id } = await params

    try {

        const { user_id } = await req.json()

        if (!user_id) {
            return NextResponse.json({ message: "User missing" }, { status: 400 })
        }

        const existing = await query(`SELECT users FROM bookings WHERE id = $1`, [id])
        if (existing.rows.length === 0) {
            return NextResponse.json({ message: "No bookings found" }, { status: 400 })
        }
        const existingUsers = existing.rows[0].users || []

        const updatedUser = existingUsers.filter((item) => item !== user_id)

        await query(`UPDATE bookings SET users = $1 WHERE id = $2`, [updatedUser, id])

        return NextResponse.json({ message: "Done" }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ message: error?.message || "Server error" }, { status: 500 })
    }

}