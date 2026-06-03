import express from "express";
import {
  getMe,
  getShowcasedUsers,
  getUserByUsername,
  toggleShowcase,
  addSkill,
  removeSkill,
  updateProfile,
  updateSocials,
  updateAppearance,
} from "../controllers/user.controller.js";
import checkAuth from "../middleware/auth.js";

const router = express.Router();

router.get("/me", getMe);
router.get("/showcased", getShowcasedUsers);
router.patch("/:username/showcase", checkAuth, toggleShowcase);
router.get("/:user", getUserByUsername);
router.post("/skills", checkAuth, addSkill);
router.delete("/skills/:skillName", checkAuth, removeSkill);
router.patch("/profile", checkAuth, updateProfile);
router.patch("/socials", checkAuth, updateSocials);
router.patch("/appearance", checkAuth, updateAppearance);

export default router;
