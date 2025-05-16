import pool, { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const usersResult = await query(
      `SELECT id, name, role FROM users`
    );

    const users = usersResult.rows;

    if (users.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Fetch elevator winnings per user
    const elevatorResult = await query(
      `SELECT user_id, SUM(amount) AS elevator_winning
     FROM transactions
     WHERE transaction_type = 'Elevator game winning'
     GROUP BY user_id`
    );

    const elevatorMap = Object.fromEntries(
      elevatorResult.rows.map(row => [row.user_id, parseFloat(row.elevator_winning) || 0])
    );

    // Fetch trivia winnings per user
    const triviaResult = await query(
      `SELECT user_id, SUM(amount) AS trivia_total
     FROM transactions
     WHERE transaction_type = 'Trivia game winning'
     GROUP BY user_id`
    );

    const triviaMap = Object.fromEntries(
      triviaResult.rows.map(row => [row.user_id, parseFloat(row.trivia_total) || 0])
    );

    // Append elevator and trivia winnings to each user
    const enrichedUsers = users.map(user => ({
      ...user,
      elevator_winning: elevatorMap[user.id] || 0,
      trivia_total: triviaMap[user.id] || 0,
    }));

    return NextResponse.json(enrichedUsers, { status: 200 });

  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json({ message: 'Error fetching participants', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
