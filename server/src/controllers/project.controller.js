import { extractZipBuffer } from "../services/zipIngestionService.js";
import { ingestFolderFiles } from "../services/folderIngestionService.js";
import { importGithubRepository } from "../services/githubIngestionService.js";
import { buildProjectManifest } from "../services/projectManifestBuilder.js";
import { executeProjectReview } from "../services/projectReviewService.js";
import { applyProjectPatch } from "../services/projectPatchService.js";
import { projectRepository } from "../repositories/projectRepository.js";

/**
 * Controller for Project-Level Code Review Endpoints.
 */
export const projectController = {
  /**
   * Universal project import endpoint supporting ZIP, Folder, and GitHub.
   * POST /api/projects/import
   */
  async importProject(req, res, next) {
    try {
      const { sourceType, name, zipBase64, files: rawFolderFiles, url: githubUrl } = req.body || {};

      let manifest;

      if (sourceType === "zip" || zipBase64) {
        if (!zipBase64 || typeof zipBase64 !== "string") {
          return res.status(400).json({
            error: { code: "INVALID_PAYLOAD", message: "ZIP upload requires zipBase64 string." },
          });
        }
        const buffer = Buffer.from(zipBase64, "base64");
        const extracted = extractZipBuffer(buffer);
        manifest = buildProjectManifest({
          projectName: name || "Uploaded Project",
          sourceType: "zip",
          rawFiles: extracted,
        });
      } else if (sourceType === "github" || githubUrl) {
        const ghResult = await importGithubRepository(githubUrl);
        manifest = buildProjectManifest({
          projectName: name || ghResult.projectName,
          sourceType: "github",
          sourceMetadata: ghResult.sourceMetadata,
          rawFiles: ghResult.files,
        });
      } else if (sourceType === "folder" || Array.isArray(rawFolderFiles)) {
        if (!Array.isArray(rawFolderFiles) || rawFolderFiles.length === 0) {
          return res.status(400).json({
            error: { code: "INVALID_PAYLOAD", message: "Folder upload requires non-empty files array." },
          });
        }
        const normalized = ingestFolderFiles(rawFolderFiles);
        manifest = buildProjectManifest({
          projectName: name || "Local Project",
          sourceType: "folder",
          rawFiles: normalized,
        });
      } else {
        return res.status(400).json({
          error: {
            code: "UNSUPPORTED_SOURCE_TYPE",
            message: "sourceType must be zip, folder, or github.",
          },
        });
      }

      // Save initial project record in repository
      await projectRepository.saveProject({
        id: manifest.id,
        name: manifest.name,
        sourceType: manifest.sourceType,
        sourceMetadata: manifest.sourceMetadata,
        projectSourceHash: manifest.projectSourceHash,
        totalFileCount: manifest.totalFileCount,
        eligibleFileCount: manifest.eligibleFileCount,
        skippedFileCount: manifest.skippedFileCount,
        score: null,
        healthStatus: "READY",
        totalFindingCount: 0,
        severityCounts: { critical: 0, high: 0, medium: 0, low: 0 },
        status: "READY",
        files: manifest.files,
      });

      return res.status(201).json({
        success: true,
        project: {
          id: manifest.id,
          name: manifest.name,
          sourceType: manifest.sourceType,
          sourceMetadata: manifest.sourceMetadata,
          projectSourceHash: manifest.projectSourceHash,
          totalFileCount: manifest.totalFileCount,
          eligibleFileCount: manifest.eligibleFileCount,
          skippedFileCount: manifest.skippedFileCount,
          totalLines: manifest.totalLines,
          totalBytes: manifest.totalBytes,
          files: manifest.files.map((f) => ({
            id: f.id,
            path: f.path,
            filename: f.filename,
            extension: f.extension,
            language: f.language,
            size: f.size,
            lineCount: f.lineCount,
            status: f.status,
            skipReason: f.skipReason,
            skipMessage: f.skipMessage,
          })),
        },
      });
    } catch (err) {
      console.error("[ProjectImport] Error:", err.message);
      return res.status(err.status || 400).json({
        error: {
          code: err.code || "IMPORT_ERROR",
          message: err.message || "Failed to import project.",
        },
      });
    }
  },

  /**
   * Launch review on an imported project.
   * POST /api/projects/:projectId/reviews
   */
  async createReview(req, res, next) {
    try {
      const { projectId } = req.params;
      const project = await projectRepository.getProjectById(projectId);

      if (!project) {
        return res.status(404).json({
          error: { code: "PROJECT_NOT_FOUND", message: `Project "${projectId}" was not found.` },
        });
      }

      const manifest = {
        id: project.id,
        name: project.name,
        sourceType: project.sourceType,
        sourceMetadata: project.sourceMetadata,
        projectSourceHash: project.projectSourceHash,
        totalFileCount: project.totalFileCount,
        eligibleFileCount: project.eligibleFileCount,
        skippedFileCount: project.skippedFileCount,
        files: project.files,
      };

      const review = await executeProjectReview({ manifest });

      return res.status(200).json({
        success: true,
        review,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get single project details.
   * GET /api/projects/:projectId
   */
  async getProject(req, res, next) {
    try {
      const { projectId } = req.params;
      const project = await projectRepository.getProjectById(projectId);

      if (!project) {
        return res.status(404).json({
          error: { code: "PROJECT_NOT_FOUND", message: `Project "${projectId}" was not found.` },
        });
      }

      return res.status(200).json({
        project: {
          id: project.id,
          name: project.name,
          sourceType: project.sourceType,
          sourceMetadata: project.sourceMetadata,
          totalFileCount: project.totalFileCount,
          eligibleFileCount: project.eligibleFileCount,
          skippedFileCount: project.skippedFileCount,
          score: project.score,
          healthStatus: project.healthStatus,
          totalFindingCount: project.totalFindingCount,
          severityCounts: project.severityCounts,
          latestReviewId: project.latestReviewId,
          status: project.status,
          files: (project.files || []).map((f) => ({
            id: f.id,
            path: f.path,
            filename: f.filename,
            extension: f.extension,
            language: f.language,
            size: f.size,
            lineCount: f.lineCount,
            status: f.status,
            skipReason: f.skipReason,
            skipMessage: f.skipMessage,
          })),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get specific review snapshot.
   * GET /api/projects/:projectId/reviews/:reviewId
   */
  async getReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const review = await projectRepository.getReviewById(reviewId);

      if (!review) {
        return res.status(404).json({
          error: { code: "REVIEW_NOT_FOUND", message: `Review "${reviewId}" was not found.` },
        });
      }

      return res.status(200).json({ review });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get review history for a project.
   * GET /api/projects/:projectId/reviews
   */
  async getProjectReviews(req, res, next) {
    try {
      const { projectId } = req.params;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;

      const history = await projectRepository.getReviewsByProjectId(projectId, { page, limit });
      return res.status(200).json(history);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get single file content and its issues.
   * GET /api/projects/:projectId/files/:fileId
   */
  async getFile(req, res, next) {
    try {
      const { projectId, fileId } = req.params;
      const project = await projectRepository.getProjectById(projectId);

      if (!project) {
        return res.status(404).json({
          error: { code: "PROJECT_NOT_FOUND", message: "Project not found." },
        });
      }

      const file = (project.files || []).find((f) => f.id === fileId || f.path === fileId);
      if (!file) {
        return res.status(404).json({
          error: { code: "FILE_NOT_FOUND", message: "File not found in project." },
        });
      }

      return res.status(200).json({
        file: {
          id: file.id,
          path: file.path,
          filename: file.filename,
          language: file.language,
          size: file.size,
          lineCount: file.lineCount,
          contentHash: file.contentHash,
          content: file.content || "",
          status: file.status,
          skipReason: file.skipReason,
          skipMessage: file.skipMessage,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Apply verified patch to a file in project and trigger targeted re-analysis.
   * POST /api/projects/:projectId/files/:fileId/findings/:findingId/apply
   */
  async applyPatch(req, res, next) {
    try {
      const { projectId, fileId, findingId } = req.params;
      const { reviewId, expectedHash, patch } = req.body || {};

      if (!reviewId) {
        return res.status(400).json({
          error: { code: "INVALID_PAYLOAD", message: "reviewId is required in request body." },
        });
      }

      const outcome = await applyProjectPatch({
        projectId,
        reviewId,
        fileId,
        findingId,
        expectedHash,
        patchOverride: patch,
      });

      return res.status(200).json(outcome);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({
          error: { code: err.code || "PATCH_ERROR", message: err.message },
        });
      }
      next(err);
    }
  },

  /**
   * Generate an automated refactoring candidate for an issue in a project file.
   * POST /api/projects/:projectId/files/:fileId/findings/:findingId/refactor
   */
  async refactorFinding(req, res, next) {
    try {
      const { projectId, fileId, findingId } = req.params;
      const project = await projectRepository.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({
          error: { code: "PROJECT_NOT_FOUND", message: "Project not found." },
        });
      }

      const file = (project.files || []).find((f) => f.id === fileId || f.path === fileId);
      if (!file || !file.content) {
        return res.status(404).json({
          error: { code: "FILE_NOT_FOUND", message: "File source not found." },
        });
      }

      const review = await projectRepository.getLatestReview(projectId);
      const reviewFile = (review?.files || []).find((f) => f.id === fileId || f.path === fileId);
      const finding = (reviewFile?.issues || []).find((i) => i.id === findingId) ||
        (review?.findings || []).find((i) => i.id === findingId) ||
        req.body?.issue;

      if (!finding) {
        return res.status(404).json({
          error: { code: "FINDING_NOT_FOUND", message: "Finding not found." },
        });
      }

      const { generateFindingRefactor } = await import("../services/refactorService.js");
      const refactorResult = await generateFindingRefactor({
        code: file.content,
        issue: finding,
        filename: file.filename || file.path,
      });

      return res.status(200).json(refactorResult);
    } catch (err) {
      next(err);
    }
  },

  /**
   * List all projects.
   * GET /api/projects
   */
  async listProjects(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const result = await projectRepository.getProjects({ page, limit });
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
};
