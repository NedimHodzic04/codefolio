import User from "../models/user.model.js";
import Project from "../models/project.model.js";
import { LAYOUT_TEMPLATES, THEMES } from "../models/user.model.js";

export const getMe = (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
};

export const getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.user }).populate(
      "education",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Only return visible projects for public portfolio
    // Include projects where isVisible is undefined (legacy projects) or true
    const projects = await Project.find({
      user: user._id,
      $or: [{ isVisible: true }, { isVisible: { $exists: false } }],
    });
    res.json({ ...user.toObject(), projects });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const addSkill = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { skills: req.body.skills } },
      { new: true },
    );

    res.status(200).json({
      message: "Skill added successfully!",
      skills: updatedUser.skills,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while adding skill" });
  }
};

export const removeSkill = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { skills: req.params.skillName } },
      { new: true },
    );

    res.json({
      message: `${req.params.skillName} removed`,
      skills: updatedUser.skills,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while removing skill" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { bio, location } = req.body;
    const updateData = {};

    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};

const isValidUrl = (url) => {
  if (!url) return true; // Empty URLs are valid (user can clear a field)
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const updateSocials = async (req, res) => {
  try {
    const { linkedin, twitter, website } = req.body;

    // Validate URL formats
    if (linkedin && !isValidUrl(linkedin)) {
      return res.status(400).json({ message: "Invalid LinkedIn URL format" });
    }
    if (twitter && !isValidUrl(twitter)) {
      return res.status(400).json({ message: "Invalid Twitter URL format" });
    }
    if (website && !isValidUrl(website)) {
      return res.status(400).json({ message: "Invalid website URL format" });
    }

    const existing = req.user.socials || {};
    const mergedSocials = {
      linkedin: existing.linkedin ?? "",
      twitter: existing.twitter ?? "",
      website: existing.website ?? "",
    };

    if (linkedin !== undefined) mergedSocials.linkedin = linkedin;
    if (twitter !== undefined) mergedSocials.twitter = twitter;
    if (website !== undefined) mergedSocials.website = website;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { socials: mergedSocials } },
      { new: true },
    );

    res.json({
      message: "Social links updated successfully",
      socials: updatedUser.socials,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while updating social links" });
  }
};

export const updateAppearance = async (req, res) => {
  try {
    const { layoutTemplate, theme } = req.body;
    const updateData = {};

    // Validate layoutTemplate if provided
    if (layoutTemplate !== undefined) {
      if (!LAYOUT_TEMPLATES.includes(layoutTemplate)) {
        return res.status(400).json({
          message: `Invalid layout template. Must be one of: ${LAYOUT_TEMPLATES.join(", ")}`,
        });
      }
      updateData.layoutTemplate = layoutTemplate;
    }

    // Validate theme if provided
    if (theme !== undefined) {
      if (!THEMES.includes(theme)) {
        return res.status(400).json({
          message: `Invalid theme. Must be one of: ${THEMES.join(", ")}`,
        });
      }
      updateData.theme = theme;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    });

    res.json({
      message: "Appearance updated successfully",
      layoutTemplate: updatedUser.layoutTemplate,
      theme: updatedUser.theme,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while updating appearance" });
  }
};
