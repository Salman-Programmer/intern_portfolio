import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Portfolio, IPortfolio } from "@/models/Portfolio";
import { Skill } from "@/models/Skill";
import { Project } from "@/models/Project";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  await connectDB();

  const portfolio = await Portfolio.findOne({ slug: slug.toLowerCase() }).lean<IPortfolio>();
  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const [skills, projects] = await Promise.all([
    Skill.find({ userId: portfolio.userId }).sort({ category: 1, name: 1 }).lean(),
    Project.find({ userId: portfolio.userId }).sort({ featured: -1, createdAt: -1 }).lean(),
  ]);

  return NextResponse.json({ portfolio, skills, projects });
}
