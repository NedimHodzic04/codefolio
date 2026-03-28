import express from "express";
import session from "express-session";
import passport from "passport";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import "./config/passport.js";
const app = express();

dotenv.config();

const port = process.env.PORT || 5000;

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
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

app.get("/api/me", (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

app.get("/", (req, res) => {
  res.send("Welcome");
});

connectDB().then(
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  }),
);
