import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Portfolio } from "@/models/Portfolio";
import { Activity } from "@/models/Activity";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("avatar") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!file.type.startsWith("image/"))
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  if (file.size > 2 * 1024 * 1024)
    return NextResponse.json({ error: "Image must be under 2MB" }, { status: 400 });

  const bytes  = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  await connectDB();
  await Portfolio.findOneAndUpdate(
    { userId: session.user.id },
    { avatar: dataUrl },
    { upsert: true }
  );

  await Activity.create({
    userId: session.user.id,
    type: "image_uploaded",
    title: "Profile photo updated",
    description: "Uploaded a new profile avatar",
  });

  return NextResponse.json({ avatar: dataUrl });
}
