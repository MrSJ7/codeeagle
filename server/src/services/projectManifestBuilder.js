import path from "node:path";
import crypto from "node:crypto";
import { classifyProjectFile } from "./projectFileFilter.js";
import { computeProjectSourceHash } from "../utils/paths.js";
import { computeCodeHash } from "../utils/codeHasher.js";

/**
 * Builds a canonical, normalized ProjectManifest from raw ingested files.
 *
 * @param {Object} options
 * @param {string} options.projectName Proposed project name
 * @param {"zip" | "folder" | "github"} options.sourceType
 * @param {Object} [options.sourceMetadata] Additional source info (e.g. repo URL)
 * @param {Array<{path: string, size: number, content: string | null, isBinary?: boolean, isSensitive?: boolean}>} options.rawFiles
 * @returns {Object} Canonical ProjectManifest
 */
export function buildProjectManifest({
  projectName = "Untitled Project",
  sourceType = "folder",
  sourceMetadata = {},
  rawFiles = [],
}) {
  const projectId = `proj_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const files = [];

  let eligibleCount = 0;
  let skippedCount = 0;
  let totalLines = 0;
  let totalBytes = 0;

  for (let i = 0; i < rawFiles.length; i++) {
    const raw = rawFiles[i];
    const fileId = `file_${i + 1}_${crypto.randomBytes(3).toString("hex")}`;
    const classification = classifyProjectFile(raw.path, raw.size);

    const isEligible = classification.status === "ELIGIBLE" && typeof raw.content === "string";
    const content = raw.content || null;
    const contentHash = isEligible ? computeCodeHash(content) : (raw.content ? computeCodeHash(raw.content) : "");

    let lineCount = 0;
    if (content) {
      lineCount = content.split(/\r?\n/).length;
      totalLines += lineCount;
    }

    totalBytes += raw.size || 0;

    if (isEligible) {
      eligibleCount++;
    } else {
      skippedCount++;
    }

    files.push({
      id: fileId,
      path: raw.path,
      relativePath: raw.path,
      filename: path.basename(raw.path),
      extension: classification.extension,
      language: classification.language,
      size: raw.size || (content ? Buffer.byteLength(content, "utf8") : 0),
      lineCount,
      content,
      contentHash,
      status: isEligible ? "ELIGIBLE" : "SKIPPED",
      skipReason: isEligible ? null : (classification.skipReason || "SKIPPED"),
      skipMessage: isEligible ? null : (classification.skipMessage || "Skipped from review"),
      isBinary: !!raw.isBinary,
      isSensitive: !!raw.isSensitive,
    });
  }

  // Sort files deterministically by relative path
  files.sort((a, b) => a.path.localeCompare(b.path));

  const projectSourceHash = computeProjectSourceHash(files);

  return {
    id: projectId,
    name: projectName,
    sourceType,
    sourceMetadata: {
      ...sourceMetadata,
      rootPath: "",
    },
    projectSourceHash,
    totalFileCount: files.length,
    eligibleFileCount: eligibleCount,
    skippedFileCount: skippedCount,
    totalLines,
    totalBytes,
    files,
    createdAt: new Date().toISOString(),
  };
}
