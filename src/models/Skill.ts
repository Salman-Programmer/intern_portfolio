import mongoose, { Document, Schema } from "mongoose";

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";
export type SkillCategory =
  | "Frontend"
  | "Backend"
  | "Database"
  | "DevOps"
  | "Mobile"
  | "Design"
  | "Other";

export interface ISkill extends Document {
  userId: string;
  name: string;
  level: SkillLevel;
  category: SkillCategory;
  yearsOfExperience?: number;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
      default: "Intermediate",
    },
    category: {
      type: String,
      enum: ["Frontend", "Backend", "Database", "DevOps", "Mobile", "Design", "Other"],
      default: "Other",
    },
    yearsOfExperience: { type: Number, min: 0, max: 50 },
  },
  { timestamps: true }
);

export const Skill =
  mongoose.models.Skill || mongoose.model<ISkill>("Skill", SkillSchema);
