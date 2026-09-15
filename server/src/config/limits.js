/**
 * Centralized Configuration Limits for CodeEagle Project Review.
 * Enforces strict security, memory, and performance bounds.
 */
export const PROJECT_LIMITS = {
  // Archive & Import limits
  MAX_ARCHIVE_BYTES: 30 * 1024 * 1024,      // 30 MB max upload ZIP size
  MAX_PROJECT_FILES: 500,                   // 500 files max per project
  MAX_SOURCE_FILE_BYTES: 1024 * 1024,       // 1 MB max size per individual file
  MAX_TOTAL_SOURCE_BYTES: 25 * 1024 * 1024, // 25 MB max total uncompressed source
  MAX_EXTRACTION_RATIO: 100,                // Max compression ratio to prevent zip bombs

  // Concurrency & Analysis bounds
  STATIC_ANALYSIS_CONCURRENCY: 4,           // Max concurrent worker promises for AST parsing

  // Gemini AI semantic analysis limits
  MAX_AI_FILES_PER_REVIEW: 5,               // Max eligible files selected for deep AI review
  MAX_AI_SOURCE_BYTES: 50 * 1024,           // Max source bytes sent to Gemini per file (50 KB)
  MAX_AI_TOTAL_BYTES: 150 * 1024,           // Max total AI context across all files

  // GitHub import limits
  MAX_GITHUB_FILES: 300,                    // Max files ingested from public GitHub repo
  GITHUB_REQUEST_TIMEOUT_MS: 15000,         // 15 seconds timeout for GitHub API requests
};
