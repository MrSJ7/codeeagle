import { PROJECT_LIMITS } from "../config/limits.js";
import { normalizeSafeRelativePath } from "../utils/paths.js";
import { classifyProjectFile, isBinaryFile, isSensitiveFile } from "./projectFileFilter.js";

/**
 * Validates and extracts owner, repo, and optional ref from a GitHub URL with strict SSRF protection.
 *
 * @param {string} rawUrl
 * @returns {{owner: string, repo: string, ref: string | null}}
 */
export function parseAndValidateGithubUrl(rawUrl) {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    const error = new Error("GitHub repository URL is required.");
    error.code = "INVALID_GITHUB_URL";
    throw error;
  }

  let parsed;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    const error = new Error("Invalid URL format. Please provide a valid GitHub URL.");
    error.code = "INVALID_GITHUB_URL";
    throw error;
  }

  // SSRF Protection: Hostname must strictly be github.com
  const hostname = parsed.hostname.toLowerCase();
  if (hostname !== "github.com" && hostname !== "www.github.com") {
    const error = new Error("Only public repositories from github.com are currently supported.");
    error.code = "INVALID_GITHUB_URL";
    throw error;
  }

  // Path format: /owner/repo[/tree/branch]
  const pathParts = parsed.pathname.split("/").filter(Boolean);
  if (pathParts.length < 2) {
    const error = new Error("GitHub URL must include repository owner and name (e.g. https://github.com/owner/repository).");
    error.code = "INVALID_GITHUB_URL";
    throw error;
  }

  const owner = pathParts[0];
  let repo = pathParts[1].replace(/\.git$/i, "");
  let ref = null;

  if (pathParts[2] === "tree" && pathParts[3]) {
    ref = pathParts.slice(3).join("/");
  }

  // Validate owner and repo names
  const validNameRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!validNameRegex.test(owner) || !validNameRegex.test(repo)) {
    const error = new Error("Invalid GitHub repository name or owner.");
    error.code = "INVALID_GITHUB_URL";
    throw error;
  }

  return { owner, repo, ref };
}

/**
 * Imports a public GitHub repository and returns normalized files.
 *
 * @param {string} githubUrl
 * @returns {Promise<{
 *   projectName: string,
 *   sourceMetadata: { owner: string, repo: string, branch: string, url: string },
 *   files: Array<{path: string, size: number, content: string | null, isBinary: boolean, isSensitive: boolean}>
 * }>}
 */
export async function importGithubRepository(githubUrl) {
  const { owner, repo, ref: requestedRef } = parseAndValidateGithubUrl(githubUrl);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROJECT_LIMITS.GITHUB_REQUEST_TIMEOUT_MS);

  const headers = {
    "User-Agent": "CodeEagle-Reviewer/1.0",
    "Accept": "application/vnd.github.v3+json",
  };

  try {
    // 1. Fetch Repository Metadata to identify default branch and size
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      signal: controller.signal,
    });

    if (repoRes.status === 404) {
      const err = new Error(`Repository "${owner}/${repo}" was not found or is private.`);
      err.code = "REPOSITORY_NOT_FOUND";
      throw err;
    }

    if (repoRes.status === 403 || repoRes.status === 429) {
      const err = new Error("GitHub API rate limit exceeded. Please try again in a few minutes or upload via ZIP.");
      err.code = "GITHUB_RATE_LIMITED";
      throw err;
    }

    if (!repoRes.ok) {
      const err = new Error(`GitHub API returned status ${repoRes.status}`);
      err.code = "GITHUB_FETCH_FAILED";
      throw err;
    }

    const repoData = await repoRes.json();
    const branch = requestedRef || repoData.default_branch || "main";

    // 2. Fetch Git Tree recursively
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, {
      headers,
      signal: controller.signal,
    });

    if (!treeRes.ok) {
      if (treeRes.status === 404) {
        const err = new Error(`Branch "${branch}" not found in repository.`);
        err.code = "REPOSITORY_NOT_FOUND";
        throw err;
      }
      const err = new Error("Failed to fetch repository file tree from GitHub.");
      err.code = "GITHUB_FETCH_FAILED";
      throw err;
    }

    const treeData = await treeRes.json();
    if (!Array.isArray(treeData.tree) || treeData.tree.length === 0) {
      const err = new Error("The specified GitHub repository is empty.");
      err.code = "EMPTY_REPOSITORY";
      throw err;
    }

    // Filter tree to blobs (files only)
    const treeBlobs = treeData.tree.filter((node) => node.type === "blob");
    if (treeBlobs.length > PROJECT_LIMITS.MAX_PROJECT_FILES * 2) {
      const err = new Error(`Repository contains too many files (${treeBlobs.length}). Maximum supported files is ${PROJECT_LIMITS.MAX_PROJECT_FILES}.`);
      err.code = "REPOSITORY_TOO_LARGE";
      throw err;
    }

    // Select files to fetch content for
    const rawFiles = [];
    const filesToFetch = [];

    for (const item of treeBlobs) {
      let safePath;
      try {
        safePath = normalizeSafeRelativePath(item.path);
      } catch {
        continue;
      }

      const size = item.size || 0;
      const classification = classifyProjectFile(safePath, size);
      const binary = isBinaryFile(safePath);
      const sensitive = isSensitiveFile(safePath);

      if (classification.status === "ELIGIBLE") {
        filesToFetch.push({
          path: safePath,
          size,
          sha: item.sha,
          isBinary: false,
          isSensitive: false,
        });
      } else {
        rawFiles.push({
          path: safePath,
          size,
          content: null,
          isBinary: binary,
          isSensitive: sensitive,
        });
      }
    }

    // Bounded concurrent fetch of eligible source files (batch size 6)
    const BATCH_SIZE = 6;
    for (let i = 0; i < filesToFetch.length; i += BATCH_SIZE) {
      const batch = filesToFetch.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (fileInfo) => {
          try {
            const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${fileInfo.path}`;
            const fileRes = await fetch(rawUrl, {
              headers: { "User-Agent": "CodeEagle-Reviewer/1.0" },
              signal: controller.signal,
            });

            if (fileRes.ok) {
              const text = await fileRes.text();
              return {
                ...fileInfo,
                content: text,
                size: Buffer.byteLength(text, "utf8"),
              };
            }
          } catch (err) {
            console.warn(`[GithubIngestion] Failed to download ${fileInfo.path}: ${err.message}`);
          }

          return {
            ...fileInfo,
            content: null,
          };
        })
      );

      rawFiles.push(...results);
    }

    return {
      projectName: repo,
      sourceMetadata: {
        owner,
        repo,
        branch,
        url: `https://github.com/${owner}/${repo}`,
      },
      files: rawFiles,
    };
  } catch (err) {
    if (err.name === "AbortError") {
      const timeoutError = new Error("GitHub repository import timed out. Please try again or use ZIP upload.");
      timeoutError.code = "GITHUB_FETCH_FAILED";
      throw timeoutError;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
