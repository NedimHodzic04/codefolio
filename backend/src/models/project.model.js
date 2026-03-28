import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  desscription: { type: String },
  techStack: [String],
  githubLink: { type: String },
  liveDemo: { type: String },
  imageUrl: { type: String },
  isFeatured: { type: Boolean, default: false },
});

module.exports = mongoose.model("Project", ProjectSchema);
