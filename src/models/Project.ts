import mongoose, { Document, Schema } from "mongoose";

export type ProjectStatus   = "In Progress" | "Completed" | "Archived";
export type ProjectCategory =
  | "Web App" | "Mobile App" | "API / Backend" | "Open Source"
  | "UI / Design" | "Data / ML" | "DevOps / Infra" | "Other";

export interface IProject extends Document {
  userId: string;
  title: string;
  description: string;
  category: ProjectCategory;
  techStack: string[];
  status: ProjectStatus;
  liveUrl?: string;
  repoUrl?: string;
  imageUrl?: string;
  featured: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId:      { type: String, required: true, index: true },
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Web App","Mobile App","API / Backend","Open Source","UI / Design","Data / ML","DevOps / Infra","Other"],
      default: "Other",
    },
    techStack:   [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["In Progress","Completed","Archived"],
      default: "In Progress",
    },
    liveUrl:  { type: String, default: "", trim: true },
    repoUrl:  { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "", trim: true },
    featured: { type: Boolean, default: false },
    startDate: { type: Date },
    endDate:   { type: Date },
  },
  { timestamps: true }
);

export const Project =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
