import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Activity } from "@/models/Activity";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  const projectId = formData.get("projectId") as string | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!file.type.startsWith("image/"))
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  if (file.size > 3 * 1024 * 1024)
    return NextResponse.json({ error: "Image must be under 3MB" }, { status: 400 });

  const bytes  = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  if (projectId) {
    await connectDB();
    await Project.findOneAndUpdate(
      { _id: projectId, userId: session.user.id },
      { imageUrl: dataUrl }
    );
    await Activity.create({
      userId: session.user.id,
      type: "image_uploaded",
      title: "Project image uploaded",
      description: "Updated project cover image",
    });
  }

  return NextResponse.json({ imageUrl: dataUrl });
}
