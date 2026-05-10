import express from "express";
import passport from "passport";
import { githubCallback, logout, debugSession } from "../controllers/auth.controller.js";

const router = express.Router();

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  githubCallback
);

router.get("/logout", logout);

router.get("/_debug/session", debugSession);

export default router;
