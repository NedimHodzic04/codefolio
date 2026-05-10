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
    githubRepoId: { type: Number }, // No unique constraint - uniqueness handled at application level
    language: { type: String },
  },
  { timestamps: true },
);

// Create index for efficient queries on user + githubRepoId (non-unique to allow multiple custom projects)
ProjectSchema.index({ user: 1, githubRepoId: 1 });

const Project = mongoose.model("Project", ProjectSchema);
export default Project;
