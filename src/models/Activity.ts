import mongoose, { Document, Schema } from "mongoose";

export type ActivityType =
  | "project_created"
  | "project_updated"
  | "project_deleted"
  | "skill_created"
  | "skill_updated"
  | "skill_deleted"
  | "portfolio_updated"
  | "category_created"
  | "category_updated"
  | "category_deleted"
  | "image_uploaded";

export interface IActivity extends Document {
  userId: string;
  type: ActivityType;
  title: string;
  description: string;
  read: boolean;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    userId:      { type: String, required: true, index: true },
    type:        { type: String, required: true },
    title:       { type: String, required: true },
    description: { type: String, default: "" },
    read:        { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Activity =
  mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);
