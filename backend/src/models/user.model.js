import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    githubId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
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
  },
  { timestamps: true },
);

const User = mongoose.model("User", UserSchema);
export default User;
