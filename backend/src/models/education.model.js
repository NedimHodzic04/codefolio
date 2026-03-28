import mongoose from "mongoose";

const EducationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  institution: { type: String, required: true },
  degree: { type: String },
  fieldOfStudy: { type: String },
  startDate: Date,
  endDate: Date,
  description: String,
});

module.exports = mongoose.model("Education", EducationSchema);
