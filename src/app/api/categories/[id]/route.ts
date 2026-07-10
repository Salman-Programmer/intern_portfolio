import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { Activity } from "@/models/Activity";
import { headers } from "next/headers";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  if (!body.name?.trim())
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });

  await connectDB();
  const category = await Category.findOne({ _id: id, userId: user.id });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

  category.name = body.name.trim();
  category.slug = toSlug(body.name.trim());
  category.color = body.color || category.color;
  category.description = body.description ?? category.description;
  await category.save();

  await Activity.create({
    userId: user.id,
    type: "category_updated",
    title: `Category "${category.name}" updated`,
    description: `Modified project category details`,
  });

  return NextResponse.json(category);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const category = await Category.findOneAndDelete({ _id: id, userId: user.id });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await Activity.create({
    userId: user.id,
    type: "category_deleted",
    title: `Category "${category.name}" deleted`,
    description: `Removed project category`,
  });

  return NextResponse.json({ deleted: true });
}
