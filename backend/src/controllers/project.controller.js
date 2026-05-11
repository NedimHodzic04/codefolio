import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import { fetchAndSaveRepos } from "../utils/github.js";

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching projects" });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, description, techStack, githubLink, liveDemo, imageUrl } =
      req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newProject = new Project({
      user: req.user._id,
      title,
      description,
      techStack,
      githubLink,
      liveDemo,
      imageUrl,
      isFeatured: false,
      githubRepoId: null, // Custom projects don't have a GitHub repo ID
    });

    await newProject.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: { projects: newProject._id },
    });

    res.status(201).json({
      message: "Project created successfully",
      project: newProject,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while creating project" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { title, description, techStack, githubLink, liveDemo, imageUrl } =
      req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found or unauthorized" });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (techStack !== undefined) updateData.techStack = techStack;
    if (githubLink !== undefined) updateData.githubLink = githubLink;
    if (liveDemo !== undefined) updateData.liveDemo = liveDemo;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while updating project" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found or unauthorized" });
    }

    await Project.findByIdAndDelete(req.params.id);

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { projects: req.params.id },
    });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while deleting project" });
  }
};

export const toggleProjectVisibility = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found or unauthorized" });
    }

    // Handle legacy projects without isVisible field (treat as visible)
    const currentVisibility = project.isVisible !== undefined ? project.isVisible : true;
    project.isVisible = !currentVisibility;
    await project.save();

    res.json({
      message: `Project ${project.isVisible ? "shown" : "hidden"} successfully`,
      project,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while toggling visibility" });
  }
};

export const syncGitHubProjects = async (req, res) => {
  try {
    // Fetch user with access token (not returned by default due to select: false)
    const user = await User.findById(req.user._id).select("+githubAccessToken");

    if (!user || !user.githubAccessToken) {
      return res.status(400).json({
        message: "GitHub access token not found. Please log in again.",
      });
    }

    const result = await fetchAndSaveRepos(
      user.githubAccessToken,
      user._id
    );

    if (!result.success) {
      return res.status(500).json({
        message: "Failed to sync GitHub repositories",
        error: result.error,
      });
    }

    res.json({
      message: "GitHub repositories synced successfully",
      count: result.count,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while syncing GitHub projects" });
  }
};
