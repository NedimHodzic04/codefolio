import Education from "../models/education.model.js";
import User from "../models/user.model.js";

export const getEducation = async (req, res) => {
  try {
    const education = await Education.find({ user: req.user._id }).sort({
      startDate: -1,
    });
    res.json(education);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching education" });
  }
};

export const createEducation = async (req, res) => {
  try {
    const { institution, degree, fieldOfStudy, startDate, endDate, description } =
      req.body;

    const newEducation = new Education({
      user: req.user._id,
      institution,
      degree,
      fieldOfStudy,
      startDate,
      endDate,
      description,
    });

    await newEducation.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: { education: newEducation._id },
    });

    res.status(201).json({
      message: "Education entry created successfully",
      education: newEducation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while creating education" });
  }
};

export const updateEducation = async (req, res) => {
  try {
    const { institution, degree, fieldOfStudy, startDate, endDate, description } =
      req.body;

    const education = await Education.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!education) {
      return res
        .status(404)
        .json({ message: "Education entry not found or unauthorized" });
    }

    const updatedEducation = await Education.findByIdAndUpdate(
      req.params.id,
      { institution, degree, fieldOfStudy, startDate, endDate, description },
      { new: true, runValidators: true }
    );

    res.json({
      message: "Education entry updated successfully",
      education: updatedEducation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while updating education" });
  }
};

export const deleteEducation = async (req, res) => {
  try {
    const education = await Education.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!education) {
      return res
        .status(404)
        .json({ message: "Education entry not found or unauthorized" });
    }

    await Education.findByIdAndDelete(req.params.id);

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { education: req.params.id },
    });

    res.json({ message: "Education entry deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while deleting education" });
  }
};
