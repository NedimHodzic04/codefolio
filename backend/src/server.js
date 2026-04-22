import express from "express";
import session from "express-session";
import passport from "passport";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import "./config/passport.js";
import User from "./models/user.model.js";
import Project from "./models/project.model.js";
import MongoStore from "connect-mongo";
import checkAuth from "./middleware/auth.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
const app = express();

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin / server-to-server requests (no Origin header),
      // and allow the configured client URL for cross-site requests.
      if (!origin) return cb(null, true);
      if (origin === process.env.CLIENT_URL) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);

const port = process.env.PORT || 5000;

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: process.env.NODE_ENV === "production",
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      // In production behind a proxy/CDN, rely on forwarded proto to decide HTTPS.
      // If Express doesn't think the request is secure, `secure: true` prevents Set-Cookie.
      secure: process.env.NODE_ENV === "production" ? "auto" : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

app.get("/api/_debug/session", (req, res) => {
  if (process.env.NODE_ENV !== "production") {
    return res.json({
      ok: true,
      env: process.env.NODE_ENV,
      sessionID: req.sessionID,
      hasSession: Boolean(req.session),
      isSecure: req.secure,
      forwardedProto: req.get("x-forwarded-proto"),
    });
  }
  return res.status(404).json({ message: "Not found" });
});

app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);

app.get(
  "/api/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  (req, res) => {
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.redirect(`${process.env.CLIENT_URL}/login`);
      }
      res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    });
  },
);

app.get("/auth/logout", (req, res) => {
  req.logout(() => {
    res.redirect(process.env.CLIENT_URL);
  });
});

app.post("/api/skills", checkAuth, async (req, res) => {
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
});

app.delete("/api/skills/:skillName", checkAuth, async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { skills: req.params.skillName } },
    { new: true },
  );

  res.json({
    message: `${req.params.skillName} removed`,
    skills: updatedUser.skills,
  });
});

app.get("/api/me", (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

app.get("/api/:user", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.user });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const projects = await Project.find({ user: user._id });
    res.json({ ...user.toObject(), projects });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));
  app.get("/{*path}", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
  });
}

connectDB().then(
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  }),
);
