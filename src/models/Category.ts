import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  userId: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    userId:      { type: String, required: true, index: true },
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, trim: true, lowercase: true },
    color:       { type: String, default: "#C8F135" },
    description: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

CategorySchema.index({ userId: 1, slug: 1 }, { unique: true });

export const Category =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
