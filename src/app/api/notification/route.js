import { sendBulkNotifications, sendSingleEmail, sendSingleSMS } from "@/lib/notificationService";
import { NextResponse } from "next/server";
 

export async function POST(req) {
    const { msg, type, ids } = await req.json();
    const searchParams = req.nextUrl.searchParams
    const filter = searchParams.get('filter')
    if (!msg) {
        return NextResponse.json({ message: 'Cannot send empty notification' }, { status: 404 });
    }
    try {
        if (filter) {
            Array.isArray(ids) && ids.forEach((id) => {
                if (type === 'email') {
                    sendSingleEmail(msg, "Notification", id)
                } else {
                    sendSingleSMS(msg, id)
                }

            })

        } else {
            sendBulkNotifications(msg, "Notification", type)

        }

        return NextResponse.json({ message: "Notifications sent" }, { status: 200 });

    } catch (error) {
          await query(
                `INSERT INTO error_logs (message, type) VALUES ($1, $2)`,
                [JSON.stringify(error), "notification route"]
            );
        return NextResponse.json({ message: 'Error occured', error: error.message }, { status: 500 });
    }


}

export const revalidate = 0