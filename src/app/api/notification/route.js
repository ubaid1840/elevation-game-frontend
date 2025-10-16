import { query } from "@/lib/db";
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
            addInOverallLogs({}, "/api/notification", "sending notifications to " + JSON.stringify(ids))
            Array.isArray(ids) && ids.forEach((id) => {
                if (type === 'email') {

                    sendSingleEmail(msg, "Notification", id)
                    addInOverallLogs({}, "/api/notification", "sending email to " + id)
                } else {
                    sendSingleSMS(msg, id)
                    addInOverallLogs({}, "/api/notification", "sending sms to " + id)
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

export async function addInOverallLogs(logs = {}, route = "", additional = "") {

    try {
        await query(
            `INSERT INTO overall_logs (logs, route, additional) VALUES ($1, $2, $3)`,
            [JSON.stringify(logs), route, additional]
        );

    } catch (error) {
        console.log(error)
    }

}

export const revalidate = 0