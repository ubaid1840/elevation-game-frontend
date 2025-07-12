import { NextResponse } from 'next/server';
import { query } from '@/lib/db';


export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
            
            const result = await query('SELECT * FROM settings WHERE id = $1', [id]);

            if (result.rowCount === 0) {
                return NextResponse.json({
                    message: 'No record found with the provided id'
                }, { status: 404 });
            }

            return NextResponse.json(result.rows[0]);
        } else {
            
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
        
        const { id, label, price } = await req.json();

        
        if (!id || !label || !price) {
            return NextResponse.json({
                message: 'Missing required fields: id, label, and price'
            }, { status: 400 });
        }

        
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

export async function POST(req) {
    try {
        const { label, price } = await req.json();
        if (!label || !price) {
            return NextResponse.json({
                message: 'Missing required fields: label and price'
            }, { status: 400 });
        }
        const checkExisting = await query(
            'SELECT * FROM settings WHERE label = $1',
            [label]
        );

        if (checkExisting.rowCount > 0) {
            return NextResponse.json({
                message: 'Package already exists'
            }, { status: 400 });
        }

        const result = await query(
            'INSERT INTO settings (label, price) VALUES ($1, $2) RETURNING *',
            [label, price]
        );

        return NextResponse.json({
            success: true,
            newSetting: result.rows[0]
        });
    } catch (error) {
        console.error('Error adding new setting:', error);
        return NextResponse.json({
            message: `Internal Server Error: ${error.message}`
        }, { status: 500 });
    }
}


export const revalidate = 0;
