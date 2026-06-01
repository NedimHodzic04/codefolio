import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/user.model.js";
import { fetchAndSaveRepos } from "../utils/github.js";
import dotenv from "dotenv";

dotenv.config();

function profileFromGitHub(profile) {
  const json = profile._json || {};

  return {
    username: profile.username,
    displayName: profile.displayName || profile.username,
    avatarUrl: json.avatar_url,
    bio: json.bio || undefined,
    email: json.email || undefined,
    location: json.location || undefined,
  };
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
        const githubProfile = profileFromGitHub(profile);

        if (!user) {
          user = await User.create({
            githubId: profile.id,
            ...githubProfile,
            bio: githubProfile.bio || "Student Developer",
            githubAccessToken: accessToken,
          });

          // Only fetch repos on initial sign-up
          await fetchAndSaveRepos(accessToken, user._id);
        } else {
          const updateData = {
            githubAccessToken: accessToken,
            avatarUrl: githubProfile.avatarUrl,
            displayName: githubProfile.displayName,
          };

          if (githubProfile.email) {
            updateData.email = githubProfile.email;
          }

          // Fill from GitHub when the user has not set these locally
          if (githubProfile.bio && !user.bio?.trim()) {
            updateData.bio = githubProfile.bio;
          }
          if (githubProfile.location && !user.location?.trim()) {
            updateData.location = githubProfile.location;
          }

          user = await User.findByIdAndUpdate(user._id, updateData, {
            new: true,
          });
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
