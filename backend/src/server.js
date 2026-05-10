import express from "express";
import session from "express-session";
import passport from "passport";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import "./config/passport.js";
import MongoStore from "connect-mongo";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import educationRoutes from "./routes/education.routes.js";
import projectRoutes from "./routes/project.routes.js";

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

// Mount routes
app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes); // Keep /api/auth/github/callback working
app.use("/api/education", educationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", userRoutes); // Must come last - has catch-all /:user route

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
