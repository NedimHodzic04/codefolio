import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/user.model.js";
import Project from "../models/project.model.js";
import dotenv from "dotenv";

dotenv.config();

async function fetchAndSaveRepos(accessToken, userId) {
  const response = await fetch(
    "https://api.github.com/user/repos?per_page=100&sort=updated",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (!response.ok) return;

  const repos = await response.json();

  for (const repo of repos) {
    if (repo.fork) continue;
    await Project.findOneAndUpdate(
      { githubRepoId: repo.id },
      {
        user: userId,
        title: repo.name,
        description: repo.description || "",
        githubLink: repo.html_url,
        language: repo.language || "",
        githubRepoId: repo.id,
      },
      { upsert: true, new: true }
    );
  }
}

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          user = await User.create({
            githubId: profile.id,
            username: profile.username,
            displayName: profile.displayName || profile.username,
            avatarUrl: profile._json.avatar_url,
            bio: profile._json.bio,
            email: profile._json.email,
          });

          // Only fetch repos on initial sign-up
          await fetchAndSaveRepos(accessToken, user._id);
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
