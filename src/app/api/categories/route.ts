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

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const categories = await Category.find({ userId: user.id }).sort({ name: 1 }).lean();
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.name?.trim())
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });

  await connectDB();

  const slug = toSlug(body.name.trim());
  const existing = await Category.findOne({ userId: user.id, slug });
  if (existing)
    return NextResponse.json({ error: "A category with this name already exists" }, { status: 400 });

  const category = await Category.create({
    userId: user.id,
    name: body.name.trim(),
    slug,
    color: body.color || "#C8F135",
    description: body.description || "",
  });

  await Activity.create({
    userId: user.id,
    type: "category_created",
    title: `Category "${category.name}" created`,
    description: `Added new project category`,
  });

  return NextResponse.json(category, { status: 201 });
}
