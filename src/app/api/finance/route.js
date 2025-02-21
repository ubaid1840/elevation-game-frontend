import pool, { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch all users
    const usersResult = await query(
      `SELECT id, name, tier1, tier2, tier3, role FROM users`
    );

    const users = usersResult.rows;

    if (users.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Get user IDs
    const userIds = users.map(user => user.id);

    // Fetch total amount from transactions for each user
    const transactionsResult = await query(
      `SELECT user_id, SUM(amount) AS trivia_total 
     FROM transactions 
     GROUP BY user_id`
    );

    // Convert transactions result into a map for easy lookup
    const transactionsMap = Object.fromEntries(
      transactionsResult.rows.map(t => [t.user_id, t.trivia_total || 0])
    );

    // Append `trivia_total` to each user
    const enrichedUsers = users.map(user => ({
      ...user,
      trivia_total: transactionsMap[user.id] || 0,
    }));

    return NextResponse.json(enrichedUsers, { status: 200 });

  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json({ message: 'Error fetching participants', error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
