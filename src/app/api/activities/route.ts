import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Activity } from "@/models/Activity";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const activities = await Activity.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return NextResponse.json(activities);
}
