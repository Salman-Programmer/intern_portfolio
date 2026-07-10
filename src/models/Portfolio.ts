import mongoose, { Document, Schema } from "mongoose";

export interface IPortfolio extends Document {
  userId: string;
  slug: string;
  name: string;
  title: string;
  about: string;
  avatar?: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioSchema = new Schema<IPortfolio>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    about: { type: String, default: "", trim: true },
    avatar: { type: String, default: "" },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    location: { type: String, default: "", trim: true },
    website: { type: String, default: "", trim: true },
    github: { type: String, default: "", trim: true },
    linkedin: { type: String, default: "", trim: true },
    twitter: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

export const Portfolio =
  mongoose.models.Portfolio ||
  mongoose.model<IPortfolio>("Portfolio", PortfolioSchema);
