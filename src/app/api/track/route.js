import { query } from "@/lib/db";
import { NextResponse } from "next/server";



export async function POST(req) {
    return NextResponse.json({ message: "Visit logged successfully" }, { status: 201 });
    try {
        const { pathname, userAgent, ipAddress } = await req.json();
        if(pathname.includes(".png") || pathname.includes(".jpg") || pathname.includes(".jpeg")){
            return NextResponse.json({ message: "Visit logged successfully" }, { status: 201 });
        }
        // Insert data into your database
        await query(`
        INSERT INTO traffic_logs (page, user_agent, ip_address, created_at) 
        VALUES ($1, $2, $3, NOW())
      `, [pathname, userAgent, ipAddress]);

        return NextResponse.json({ message: "Visit logged successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error logging visit:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const result = await query(`
            SELECT page, COUNT(*) AS visits, MAX(created_at) AS last_visited 
            FROM traffic_logs 
            GROUP BY page 
            ORDER BY last_visited DESC
          `);

        return NextResponse.json(result.rows, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "Error" }, { status: 500 })
    }


}



export const revalidate = 0
