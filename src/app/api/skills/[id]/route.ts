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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body   = await req.json();

  await connectDB();
  const skill = await Skill.findOneAndUpdate(
    { _id: id, userId: user.id }, body, { new: true, runValidators: true }
  );
  if (!skill) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await Activity.create({
    userId: user.id,
    type: "skill_updated",
    title: `Skill "${skill.name}" updated`,
    description: `Changed to ${skill.level} · ${skill.category}`,
  });

  return NextResponse.json(skill);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const skill = await Skill.findOneAndDelete({ _id: id, userId: user.id });
  if (!skill) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await Activity.create({
    userId: user.id,
    type: "skill_deleted",
    title: `Skill "${skill.name}" deleted`,
    description: `Removed from portfolio`,
  });

  return NextResponse.json({ success: true });
}
