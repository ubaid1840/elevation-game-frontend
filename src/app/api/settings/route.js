import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; 


export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
            // Fetch a specific setting by id
            const result = await query('SELECT * FROM settings WHERE id = $1', [id]);

            if (result.rowCount === 0) {
                return NextResponse.json({
                    message: 'No record found with the provided id'
                }, { status: 404 });
            }

            return NextResponse.json(result.rows[0]);
        } else {
            // Fetch all settings
            const result = await query('SELECT * FROM settings');

            if (result.rowCount === 0) {
                return NextResponse.json({
                    message: 'No records found'
                }, { status: 404 });
            }

            return NextResponse.json(result.rows);
        }
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({
            message: `Internal Server Error: ${error.message}`
        }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        // Parse the request body
        const { id, label, price } = await req.json();

        // Validate input
        if (!id || !label || !price) {
            return NextResponse.json({
                message: 'Missing required fields: id, label, and price'
            }, { status: 400 });
        }

        // Update the record in the settings table
        const result = await query(
            'UPDATE settings SET label = $1, price = $2 WHERE id = $3 RETURNING *',
            [label, price, id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({
                message: 'No record found to update'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            updatedSetting: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({
            message: `Internal Server Error: ${error.message}`
        }, { status: 500 });
    }
}

export const revalidate = 0;