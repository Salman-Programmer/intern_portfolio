import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Activity } from "@/models/Activity";
import { headers } from "next/headers";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  if (typeof body.techStack === "string") {
    body.techStack = body.techStack.split(",").map((t: string) => t.trim()).filter(Boolean);
  }

  await connectDB();
  const project = await Project.findOneAndUpdate(
    { _id: id, userId: user.id },
    body,
    { new: true, runValidators: true }
  );

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await Activity.create({
    userId: user.id,
    type: "project_updated",
    title: `Project "${project.title}" updated`,
    description: `Modified project details`,
  });

  return NextResponse.json(project);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();

  const project = await Project.findOneAndDelete({ _id: id, userId: user.id });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await Activity.create({
    userId: user.id,
    type: "project_deleted",
    title: `Project "${project.title}" deleted`,
    description: `Removed from portfolio`,
  });

  return NextResponse.json({ success: true });
}
