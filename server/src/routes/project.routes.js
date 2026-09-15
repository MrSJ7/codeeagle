import { Router } from "express";
import { projectController } from "../controllers/project.controller.js";

const router = Router();

// Ingestion endpoints
router.post("/import", projectController.importProject);
router.post("/import/zip", (req, res, next) => {
  req.body.sourceType = "zip";
  return projectController.importProject(req, res, next);
});
router.post("/import/folder", (req, res, next) => {
  req.body.sourceType = "folder";
  return projectController.importProject(req, res, next);
});
router.post("/import/github", (req, res, next) => {
  req.body.sourceType = "github";
  return projectController.importProject(req, res, next);
});

// Project & review endpoints
router.get("/", projectController.listProjects);
router.get("/:projectId", projectController.getProject);
router.get("/:projectId/files/:fileId", projectController.getFile);
router.post("/:projectId/reviews", projectController.createReview);
router.get("/:projectId/reviews", projectController.getProjectReviews);
router.get("/:projectId/reviews/:reviewId", projectController.getReview);
router.post("/:projectId/files/:fileId/findings/:findingId/apply", projectController.applyPatch);

export default router;
