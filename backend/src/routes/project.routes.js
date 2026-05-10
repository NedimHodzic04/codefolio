import express from "express";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  syncGitHubProjects,
} from "../controllers/project.controller.js";
import checkAuth from "../middleware/auth.js";

const router = express.Router();

router.get("/", checkAuth, getProjects);
router.post("/", checkAuth, createProject);
router.post("/sync", checkAuth, syncGitHubProjects);
router.patch("/:id", checkAuth, updateProject);
router.delete("/:id", checkAuth, deleteProject);

export default router;
