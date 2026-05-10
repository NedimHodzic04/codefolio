import Project from "../models/project.model.js";

/**
 * Fetches user's GitHub repositories and saves/updates them in the database
 * @param {string} accessToken - GitHub OAuth access token
 * @param {string} userId - MongoDB user ID
 * @returns {Promise<{success: boolean, count: number, error?: string}>}
 */
export async function fetchAndSaveRepos(accessToken, userId) {
  try {
    const response = await fetch(
      "https://api.github.com/user/repos?per_page=100&sort=updated",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        count: 0,
        error: `GitHub API error: ${response.status} ${errorText}`,
      };
    }

    const repos = await response.json();
    let updatedCount = 0;

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
      updatedCount++;
    }

    return { success: true, count: updatedCount };
  } catch (error) {
    return {
      success: false,
      count: 0,
      error: error.message || "Unknown error occurred",
    };
  }
}
