import { buildApiUrl } from "./reviewApi.js";

/**
 * Universal project import endpoint.
 * Supports ZIP base64, folder File array, or GitHub URL.
 */
export async function importProjectApi({ sourceType, name, zipBase64, files, url }) {
  const payload = { sourceType, name };

  if (sourceType === "zip") {
    payload.zipBase64 = zipBase64;
  } else if (sourceType === "folder") {
    payload.files = files;
  } else if (sourceType === "github") {
    payload.url = url;
  }

  const response = await fetch(buildApiUrl("/api/projects/import"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const err = new Error(data.error?.message || "Failed to import project.");
    err.code = data.error?.code || "IMPORT_FAILED";
    throw err;
  }

  return response.json();
}

/**
 * Initiates full project code review.
 */
export async function startProjectReviewApi(projectId) {
  const response = await fetch(buildApiUrl(`/api/projects/${projectId}/reviews`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const err = new Error(data.error?.message || "Failed to analyze project.");
    err.code = data.error?.code || "REVIEW_FAILED";
    throw err;
  }

  return response.json();
}

/**
 * Fetches project metadata and file tree.
 */
export async function getProjectApi(projectId) {
  const response = await fetch(buildApiUrl(`/api/projects/${projectId}`));
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const err = new Error(data.error?.message || "Failed to load project.");
    err.code = data.error?.code || "NOT_FOUND";
    throw err;
  }
  return response.json();
}

/**
 * Fetches a specific project review snapshot.
 */
export async function getProjectReviewApi(projectId, reviewId) {
  const response = await fetch(buildApiUrl(`/api/projects/${projectId}/reviews/${reviewId}`));
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const err = new Error(data.error?.message || "Failed to load review snapshot.");
    err.code = data.error?.code || "NOT_FOUND";
    throw err;
  }
  return response.json();
}

/**
 * Fetches review history for a project.
 */
export async function getProjectReviewsHistoryApi(projectId, page = 1, limit = 10) {
  const response = await fetch(buildApiUrl(`/api/projects/${projectId}/reviews?page=${page}&limit=${limit}`));
  if (!response.ok) {
    return { reviews: [], pagination: { total: 0, page: 1, limit: 10, pages: 1 } };
  }
  return response.json();
}

/**
 * Fetches single file details including full source code.
 */
export async function getProjectFileApi(projectId, fileId) {
  const response = await fetch(buildApiUrl(`/api/projects/${projectId}/files/${fileId}`));
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const err = new Error(data.error?.message || "Failed to load file content.");
    err.code = data.error?.code || "NOT_FOUND";
    throw err;
  }
  return response.json();
}

/**
 * Applies a verified fix or refactored patch to a project file and receives the re-analyzed review snapshot.
 */
export async function applyProjectPatchApi({ projectId, fileId, findingId, reviewId, expectedHash, patch }) {
  const response = await fetch(
    buildApiUrl(`/api/projects/${projectId}/files/${fileId}/findings/${findingId}/apply`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, expectedHash, patch }),
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const err = new Error(data.error?.message || "Failed to apply fix to file.");
    err.code = data.error?.code || "PATCH_FAILED";
    throw err;
  }

  return response.json();
}

/**
 * Generates an automated refactoring candidate for an issue in a project file.
 */
export async function generateProjectFindingRefactorApi({ projectId, fileId, findingId, issue }) {
  const response = await fetch(
    buildApiUrl(`/api/projects/${projectId}/files/${fileId}/findings/${findingId}/refactor`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issue }),
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const err = new Error(data.error?.message || "Failed to generate refactor.");
    err.code = data.error?.code || "REFACTOR_FAILED";
    throw err;
  }

  return response.json();
}
