import mongoose from "mongoose";

const EducationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date }, // null if current
    description: { type: String },
  },
  { timestamps: true },
);

const Education = mongoose.model("Education", EducationSchema);
export default Education;
