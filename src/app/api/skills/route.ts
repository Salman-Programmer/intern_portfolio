import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Skill } from "@/models/Skill";
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

  await connectDB();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { userId: user.id };
  if (search)   filter.name = { $regex: search, $options: "i" };
  if (category) filter.category = category;

  const skills = await Skill.find(filter).sort({ category: 1, name: 1 }).lean();
  return NextResponse.json(skills);
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.name?.trim())
    return NextResponse.json({ error: "Skill name is required" }, { status: 400 });

  await connectDB();
  const skill = await Skill.create({ ...body, userId: user.id });

  await Activity.create({
    userId: user.id,
    type: "skill_created",
    title: `Skill "${skill.name}" added`,
    description: `${skill.level} · ${skill.category}`,
  });

  return NextResponse.json(skill, { status: 201 });
}
