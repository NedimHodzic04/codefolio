import express from "express";
import session from "express-session";
import passport from "passport";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import "./config/passport.js";
import User from "./models/user.model.js";
import MongoStore from "connect-mongo";
import checkAuth from "./middleware/auth.js";
const app = express();

dotenv.config();

const port = process.env.PORT || 5000;

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: false,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);

app.get(
  "/api/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("http://localhost:5000/dashboard");
  },
);

app.get("/auth/logout", (req, res) => {
  req.logout(() => {
    res.redirect("http://localhost:5000");
  });
});

app.get("/dashboard", (req, res) => {
  res.send("DASHBOARD");
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

app.get("/", (req, res) => {
  res.send("Codefolio");
});

connectDB().then(
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  }),
);
