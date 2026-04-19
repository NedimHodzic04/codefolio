import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    techStack: [String],
    githubLink: { type: String },
    liveDemo: { type: String },
    imageUrl: { type: String },
    isFeatured: { type: Boolean, default: false },
    githubRepoId: { type: Number, unique: true, sparse: true },
    language: { type: String },
  },
  { timestamps: true },
);

const Project = mongoose.model("Project", ProjectSchema);
export default Project;
