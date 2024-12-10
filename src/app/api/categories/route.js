import { NextResponse } from 'next/server';
import { query } from '@/lib/db';


export async function GET(req) {
    try {
        const result = await query('SELECT * FROM categories');
        if (result.rows.length == 0) {
            return NextResponse.json([], { status: 200 })
        }
        return NextResponse.json(result.rows, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            message: `Internal Server Error: ${error.message}`
        }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { value } = await req.json()

        if (!value) {
            return NextResponse.json({ message: "Value field missing" }, { status: 400 })
        }
        const result = await query(
            'INSERT INTO categories (value) VALUES ($1)',
            [value]
        );
        return NextResponse.json({ message: "New category added" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            message: `Internal Server Error: ${error.message}`
        }, { status: 500 });
    }
}

export const revalidate = 0