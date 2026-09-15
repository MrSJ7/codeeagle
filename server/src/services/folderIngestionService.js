import { PROJECT_LIMITS } from "../config/limits.js";
import { normalizeSafeRelativePath } from "../utils/paths.js";
import { isBinaryFile, isSensitiveFile } from "./projectFileFilter.js";
import { stripCommonRootPrefix } from "./zipIngestionService.js";

/**
 * Normalizes an array of uploaded folder files.
 *
 * @param {Array<{path: string, content?: string, size?: number}>} incomingFiles
 * @returns {Array<{path: string, size: number, content: string | null, isBinary: boolean, isSensitive: boolean}>}
 */
export function ingestFolderFiles(incomingFiles) {
  if (!Array.isArray(incomingFiles)) {
    throw new Error("Invalid input: expected array of files for folder upload");
  }

  if (incomingFiles.length > PROJECT_LIMITS.MAX_PROJECT_FILES) {
    throw new Error(`Folder contains too many files (${incomingFiles.length}). Maximum allowed is ${PROJECT_LIMITS.MAX_PROJECT_FILES}`);
  }

  const files = [];
  let totalBytes = 0;

  for (const item of incomingFiles) {
    if (!item || typeof item.path !== "string") {
      continue;
    }

    let safePath;
    try {
      safePath = normalizeSafeRelativePath(item.path);
    } catch (err) {
      console.warn(`[FolderIngestion] Skipping invalid path "${item.path}": ${err.message}`);
      continue;
    }

    const binary = isBinaryFile(safePath);
    const sensitive = isSensitiveFile(safePath);
    const size = typeof item.size === "number" ? item.size : (typeof item.content === "string" ? Buffer.byteLength(item.content, "utf8") : 0);

    totalBytes += size;
    if (totalBytes > PROJECT_LIMITS.MAX_TOTAL_SOURCE_BYTES) {
      throw new Error(`Total project size exceeds maximum limit of ${Math.round(PROJECT_LIMITS.MAX_TOTAL_SOURCE_BYTES / 1024 / 1024)} MB`);
    }

    let content = null;
    if (!binary && !sensitive && typeof item.content === "string" && size <= PROJECT_LIMITS.MAX_SOURCE_FILE_BYTES) {
      content = item.content;
    }

    files.push({
      path: safePath,
      size,
      content,
      isBinary: binary,
      isSensitive: sensitive,
    });
  }

  return stripCommonRootPrefix(files);
}
