import mongoose from "mongoose";

const EducationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    institution: { type: String, required: true },
    degree: { type: String },
    fieldOfStudy: { type: String },
    startDate: Date,
    endDate: Date,
    description: String,
  },
  { timestamps: true },
);

const Education = mongoose.model("Education", EducationSchema);
export default Education;
