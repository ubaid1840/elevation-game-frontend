import { query } from "@/lib/db";
import { NextResponse } from "next/server";



export async function DELETE(req, {params}) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ message: "Missing ID" }, { status: 400 });
        }
        await query("DELETE FROM categories WHERE id = $1", [id]);

        return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });

    } catch (error) {
        console.log("Error deleting category:", error);
        return NextResponse.json({
            message: `Internal Server Error: ${error.message}`
        }, { status: 500 });
    }
}

export const revalidate = 0