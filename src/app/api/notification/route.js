import { sendBulkNotifications } from "@/lib/notificationService";
import { NextResponse } from "next/server";


export async function POST(req) {
    const { msg, type } = await req.json();
    if (!msg) {
        return NextResponse.json({ message: 'Cannot send empty notification' }, { status: 404 });
    }

    try {
        await sendBulkNotifications(msg, "Notification", type)
        return NextResponse.json({ message: "Notifications sent" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error occured', error: error.message }, { status: 500 });
    }


}