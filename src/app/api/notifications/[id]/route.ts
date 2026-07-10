import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Activity } from "@/models/Activity";
import { headers } from "next/headers";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();

  const notification = await Activity.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { $set: { read: true } },
    { new: true }
  );

  if (!notification) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(notification);
}
