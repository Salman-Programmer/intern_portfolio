import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Activity } from "@/models/Activity";
import { headers } from "next/headers";

// Notifications are backed by the Activity feed (every activity is also
// surfaced as a notification with a read/unread state).

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = session.user.id;

  const [notifications, unreadCount] = await Promise.all([
    Activity.find({ userId }).sort({ createdAt: -1 }).limit(15).lean(),
    Activity.countDocuments({ userId, read: false }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

// Mark all notifications as read
export async function PATCH() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  await Activity.updateMany(
    { userId: session.user.id, read: false },
    { $set: { read: true } }
  );

  return NextResponse.json({ success: true });
}
