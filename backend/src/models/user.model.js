import mongoose from "mongoose";

// Available layout templates
export const LAYOUT_TEMPLATES = ["default", "minimal", "modern", "classic"];

// Available themes
export const THEMES = ["light", "dark", "blue", "purple"];

const UserSchema = new mongoose.Schema(
  {
    githubId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    displayName: { type: String },
    email: { type: String },
    avatarUrl: { type: String },
    bio: { type: String, default: "Student Developer" },
    location: { type: String },
    skills: [String],
    socials: {
      linkedin: String,
      twitter: String,
      website: String,
    },
    education: [{ type: mongoose.Schema.Types.ObjectId, ref: "Education" }],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    layoutTemplate: { type: String, default: "default" },
    theme: { type: String, default: "light" },
    githubAccessToken: { type: String, select: false }, // Stored securely, not returned by default
  },
  { timestamps: true },
);

const User = mongoose.model("User", UserSchema);
export default User;
