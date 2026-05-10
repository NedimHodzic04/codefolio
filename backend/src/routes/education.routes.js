import express from "express";
import {
  getEducation,
  createEducation,
  updateEducation,
  deleteEducation,
} from "../controllers/education.controller.js";
import checkAuth from "../middleware/auth.js";

const router = express.Router();

router.get("/", checkAuth, getEducation);
router.post("/", checkAuth, createEducation);
router.patch("/:id", checkAuth, updateEducation);
router.delete("/:id", checkAuth, deleteEducation);

export default router;
