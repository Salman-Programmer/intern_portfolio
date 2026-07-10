import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Portfolio } from "@/models/Portfolio";
import { Activity } from "@/models/Activity";
import { headers } from "next/headers";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const portfolio = await Portfolio.findOne({ userId: user.id }).lean();

  if (!portfolio) {
    return NextResponse.json({
      userId: user.id,
      name: user.name || "",
      title: "",
      about: "",
      email: user.email || "",
      phone: "",
      location: "",
      website: "",
      github: "",
      linkedin: "",
      twitter: "",
    });
  }

  return NextResponse.json(portfolio);
}

export async function PUT(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await connectDB();

  if (body.name && !body.slug) {
    const baseSlug = body.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const existing = await Portfolio.findOne({ slug: baseSlug });
    if (!existing || existing.userId === user.id) {
      body.slug = baseSlug;
    } else {
      body.slug = `${baseSlug}-${user.id.slice(-4)}`;
    }
  }

  const portfolio = await Portfolio.findOneAndUpdate(
    { userId: user.id },
    { ...body, userId: user.id },
    { new: true, upsert: true, runValidators: true }
  );

  await Activity.create({
    userId: user.id,
    type: "portfolio_updated",
    title: "Portfolio info updated",
    description: `Updated profile details`,
  });

  return NextResponse.json(portfolio);
}
