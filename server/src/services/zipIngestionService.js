import zlib from "node:zlib";
import { PROJECT_LIMITS } from "../config/limits.js";
import { normalizeSafeRelativePath } from "../utils/paths.js";
import { isBinaryFile, isSensitiveFile } from "./projectFileFilter.js";

/**
 * Parses a ZIP buffer and safely extracts file contents into memory.
 * Defends against Zip Slip, Zip Bombs, excessive file counts, and malicious paths.
 *
 * @param {Buffer} buffer ZIP file buffer
 * @returns {Array<{path: string, size: number, content: string | null, isBinary: boolean}>}
 */
export function extractZipBuffer(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error("Invalid input: expected Buffer for ZIP archive");
  }

  if (buffer.length > PROJECT_LIMITS.MAX_ARCHIVE_BYTES) {
    throw new Error(`Archive size (${Math.round(buffer.length / 1024 / 1024)} MB) exceeds maximum allowed size of ${Math.round(PROJECT_LIMITS.MAX_ARCHIVE_BYTES / 1024 / 1024)} MB`);
  }

  // 1. Find End of Central Directory (EOCD) Record
  let eocdOffset = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 65536 - 22); i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error("Invalid ZIP archive: End of Central Directory record not found");
  }

  const totalEntries = buffer.readUInt16LE(eocdOffset + 10);
  const cdSize = buffer.readUInt32LE(eocdOffset + 12);
  const cdOffset = buffer.readUInt32LE(eocdOffset + 16);

  if (totalEntries > PROJECT_LIMITS.MAX_PROJECT_FILES * 2) {
    throw new Error(`Archive contains too many files (${totalEntries}). Limit is ${PROJECT_LIMITS.MAX_PROJECT_FILES}`);
  }

  const files = [];
  let totalUncompressedBytes = 0;
  let offset = cdOffset;

  for (let i = 0; i < totalEntries && offset < cdOffset + cdSize; i++) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) {
      break; // Corrupted or truncated Central Directory
    }

    const flags = buffer.readUInt16LE(offset + 8);
    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraFieldLength = buffer.readUInt16LE(offset + 30);
    const fileCommentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);

    const fileName = buffer.toString("utf8", offset + 46, offset + 46 + fileNameLength);
    offset += 46 + fileNameLength + extraFieldLength + fileCommentLength;

    // Skip directory entries
    if (fileName.endsWith("/") || fileName.endsWith("\\")) {
      continue;
    }

    // Zip bomb detection (extreme compression ratio)
    if (compressedSize > 0 && (uncompressedSize / compressedSize) > PROJECT_LIMITS.MAX_EXTRACTION_RATIO && uncompressedSize > 1024 * 1024) {
      throw new Error(`Suspicious compression ratio detected in entry: "${fileName}" (potential Zip bomb)`);
    }

    // Check individual file limit
    if (uncompressedSize > PROJECT_LIMITS.MAX_SOURCE_FILE_BYTES * 2) {
      // We will skip giant files or reject if overall bounds exceeded
    }

    totalUncompressedBytes += uncompressedSize;
    if (totalUncompressedBytes > PROJECT_LIMITS.MAX_TOTAL_SOURCE_BYTES) {
      throw new Error(`Total uncompressed project size exceeds maximum allowed size of ${Math.round(PROJECT_LIMITS.MAX_TOTAL_SOURCE_BYTES / 1024 / 1024)} MB`);
    }

    // Validate safe path & normalize (Zip Slip defense)
    let safePath;
    try {
      safePath = normalizeSafeRelativePath(fileName);
    } catch (err) {
      console.warn(`[ZipIngestion] Skipping invalid or unsafe path "${fileName}": ${err.message}`);
      continue;
    }

    // Locate data in Local File Header
    if (localHeaderOffset + 30 > buffer.length) {
      continue;
    }
    if (buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50) {
      continue;
    }

    const localFileNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraFieldLength = buffer.readUInt16LE(localHeaderOffset + 28);
    const dataOffset = localHeaderOffset + 30 + localFileNameLength + localExtraFieldLength;

    if (dataOffset + compressedSize > buffer.length) {
      continue;
    }

    let fileBuffer;
    try {
      if (compressionMethod === 0) {
        // Stored (no compression)
        fileBuffer = buffer.subarray(dataOffset, dataOffset + uncompressedSize);
      } else if (compressionMethod === 8) {
        // Deflated
        const compressedData = buffer.subarray(dataOffset, dataOffset + compressedSize);
        fileBuffer = zlib.inflateRawSync(compressedData);
      } else {
        // Unsupported compression method
        continue;
      }
    } catch (decompErr) {
      console.warn(`[ZipIngestion] Failed to decompress "${safePath}": ${decompErr.message}`);
      continue;
    }

    const binary = isBinaryFile(safePath);
    const sensitive = isSensitiveFile(safePath);

    let content = null;
    if (!binary && !sensitive && fileBuffer.length <= PROJECT_LIMITS.MAX_SOURCE_FILE_BYTES) {
      // Check for binary 0-bytes in text
      const hasNull = fileBuffer.includes(0);
      if (!hasNull) {
        content = fileBuffer.toString("utf8");
      }
    }

    files.push({
      path: safePath,
      size: fileBuffer.length,
      content,
      isBinary: binary,
      isSensitive: sensitive,
    });
  }

  // If all files share a common single root folder (e.g. "my-repo-main/..."), strip common prefix
  return stripCommonRootPrefix(files);
}

/**
 * Normalizes file paths by stripping single enclosing root directory if present (common in GitHub ZIPs).
 */
export function stripCommonRootPrefix(files) {
  if (!Array.isArray(files) || files.length === 0) return files;

  const firstSlashIndices = files.map((f) => f.path.indexOf("/")).filter((idx) => idx !== -1);
  if (firstSlashIndices.length !== files.length) {
    return files; // Not all files are in subdirectories
  }

  const roots = new Set(files.map((f) => f.path.split("/")[0]));
  if (roots.size === 1) {
    const singleRoot = Array.from(roots)[0];
    return files.map((f) => ({
      ...f,
      path: f.path.substring(singleRoot.length + 1),
    })).filter((f) => f.path.length > 0);
  }

  return files;
}
