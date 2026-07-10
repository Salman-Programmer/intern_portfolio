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

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search   = searchParams.get("search")?.trim() || "";
  const category = searchParams.get("category")?.trim() || "";
  const status   = searchParams.get("status")?.trim() || "";
  const skill    = searchParams.get("skill")?.trim() || "";

  await connectDB();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { userId: user.id };
  if (search)   filter.$or = [
    { title:       { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
    { techStack:   { $elemMatch: { $regex: search, $options: "i" } } },
  ];
  if (category) filter.category = category;
  if (status)   filter.status   = status;
  if (skill)    filter.techStack = { $elemMatch: { $regex: skill, $options: "i" } };

  const projects = await Project.find(filter).sort({ featured: -1, createdAt: -1 }).lean();
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.title?.trim())
    return NextResponse.json({ error: "Project title is required" }, { status: 400 });
  if (!body.description?.trim())
    return NextResponse.json({ error: "Project description is required" }, { status: 400 });

  if (typeof body.techStack === "string")
    body.techStack = body.techStack.split(",").map((t: string) => t.trim()).filter(Boolean);

  await connectDB();
  const project = await Project.create({ ...body, userId: user.id });

  await Activity.create({
    userId: user.id,
    type: "project_created",
    title: `Project "${project.title}" created`,
    description: `Added to ${project.category || "Other"} category`,
  });

  return NextResponse.json(project, { status: 201 });
}
