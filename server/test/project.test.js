import zlib from "node:zlib";
import crypto from "node:crypto";
import { normalizeSafeRelativePath, resolveSafeExtractionPath, computeProjectSourceHash } from "../src/utils/paths.js";
import { classifyProjectFile, isSensitiveFile, isBinaryFile } from "../src/services/projectFileFilter.js";
import { extractZipBuffer } from "../src/services/zipIngestionService.js";
import { ingestFolderFiles } from "../src/services/folderIngestionService.js";
import { parseAndValidateGithubUrl } from "../src/services/githubIngestionService.js";
import { buildProjectManifest } from "../src/services/projectManifestBuilder.js";
import { runProjectStaticAnalysis } from "../src/services/projectAnalyzer.js";
import { calculateProjectScore } from "../src/services/projectScoreCalculator.js";
import { executeProjectReview } from "../src/services/projectReviewService.js";
import { applyProjectPatch } from "../src/services/projectPatchService.js";
import { projectRepository } from "../src/repositories/projectRepository.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log("✅ PASS: " + message);
    passed++;
  } else {
    console.error("❌ FAIL: " + message);
    failed++;
  }
}

function createTestZip(entries) {
  const localHeaders = [];
  const cdHeaders = [];
  let offset = 0;

  for (const entry of entries) {
    const fileNameBuf = Buffer.from(entry.name, "utf8");
    const isDeflated = !!entry.deflate;
    const rawContent = Buffer.from(entry.content || "", "utf8");
    const compressedContent = isDeflated ? zlib.deflateRawSync(rawContent) : rawContent;
    const compressionMethod = isDeflated ? 8 : 0;
    const crc = 0;

    const lh = Buffer.alloc(30 + fileNameBuf.length + compressedContent.length);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(0, 6);
    lh.writeUInt16LE(compressionMethod, 8);
    lh.writeUInt16LE(0, 10);
    lh.writeUInt16LE(0, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(compressedContent.length, 18);
    lh.writeUInt32LE(rawContent.length, 22);
    lh.writeUInt16LE(fileNameBuf.length, 26);
    lh.writeUInt16LE(0, 28);
    fileNameBuf.copy(lh, 30);
    compressedContent.copy(lh, 30 + fileNameBuf.length);
    localHeaders.push(lh);

    const cd = Buffer.alloc(46 + fileNameBuf.length);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8);
    cd.writeUInt16LE(compressionMethod, 10);
    cd.writeUInt16LE(0, 12);
    cd.writeUInt16LE(0, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(compressedContent.length, 20);
    cd.writeUInt32LE(rawContent.length, 24);
    cd.writeUInt16LE(fileNameBuf.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(offset, 42);
    fileNameBuf.copy(cd, 46);
    cdHeaders.push(cd);
    offset += lh.length;
  }

  const allLocal = Buffer.concat(localHeaders);
  const allCd = Buffer.concat(cdHeaders);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(allCd.length, 12);
  eocd.writeUInt32LE(allLocal.length, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([allLocal, allCd, eocd]);
}

async function runProjectTests() {
  console.log("=== Starting CodeEagle Project-Level Review Unit & Integration Tests ===\n");

  console.log("--- 1. Safe Path Normalization & Zip Slip Defense ---");
  assert(normalizeSafeRelativePath("src/auth.js") === "src/auth.js", "Standard path normalizes safely");
  assert(normalizeSafeRelativePath("src\\components\\Button.jsx") === "src/components/Button.jsx", "Windows backslashes normalized to POSIX");
  assert(normalizeSafeRelativePath("./src/./utils.js") === "src/utils.js", "Dot segments resolved cleanly");
  assert(normalizeSafeRelativePath("/absolute/path.js") === "absolute/path.js", "Leading slash stripped to prevent absolute root escape");

  let traversalBlocked = false;
  try { normalizeSafeRelativePath("../../../etc/passwd"); } catch { traversalBlocked = true; }
  assert(traversalBlocked, "Parent directory traversal (../../../) rejected");

  let zipSlipBlocked = false;
  try { resolveSafeExtractionPath("/tmp/sandbox", "../../evil.sh"); } catch { zipSlipBlocked = true; }
  assert(zipSlipBlocked, "Zip Slip extraction outside target directory rejected");

  console.log("\n--- 2. File Filtering, .gitignore & Module Directory Handling ---");
  const jsClass = classifyProjectFile("src/auth.js", 1200);
  assert(jsClass.status === "ELIGIBLE" && jsClass.language === "javascript", "JavaScript file marked ELIGIBLE");

  const jsxClass = classifyProjectFile("src/components/Feed.jsx", 2400);
  assert(jsxClass.status === "ELIGIBLE" && jsxClass.language === "jsx", "JSX file marked ELIGIBLE");

  const nodeModulesClass = classifyProjectFile("node_modules/express/index.js", 5000);
  assert(nodeModulesClass.status === "SKIPPED" && nodeModulesClass.skipReason === "IGNORED_DIRECTORY", "node_modules skipped automatically");

  const nestedNodeModules = classifyProjectFile("packages/app/node_modules/react/index.js", 3000);
  assert(nestedNodeModules.status === "SKIPPED" && nestedNodeModules.skipReason === "IGNORED_DIRECTORY", "Nested node_modules skipped automatically");

  const bowerClass = classifyProjectFile("bower_components/jquery/jquery.js", 8000);
  assert(bowerClass.status === "SKIPPED" && bowerClass.skipReason === "IGNORED_DIRECTORY", "bower_components skipped automatically");

  const vendorClass = classifyProjectFile("vendor/bundle.js", 8000);
  assert(vendorClass.status === "SKIPPED" && vendorClass.skipReason === "IGNORED_DIRECTORY", "vendor directory skipped automatically");

  const pnpClass = classifyProjectFile(".pnp.js", 1000);
  assert(pnpClass.status === "SKIPPED" && pnpClass.skipReason === "IGNORED_DIRECTORY", ".pnp.js lockfile skipped automatically");

  // .gitignore rule parsing and filtering
  const gitignoreRules = [
    { regex: /(?:^|\/)build(?:\/.*)?$/, isNegated: false },
    { regex: /(?:^|\/)[^/]*\.min\.js(?:\/.*)?$/, isNegated: false },
    { regex: /(?:^|\/)custom-ignore(?:\/.*)?$/, isNegated: false }
  ];
  const gitignoredFile1 = classifyProjectFile("src/bundle.min.js", 2000, gitignoreRules);
  assert(gitignoredFile1.status === "SKIPPED" && gitignoredFile1.skipMessage === "Skipped via .gitignore", "*.min.js matched and skipped via .gitignore");

  const gitignoredFile2 = classifyProjectFile("build/output.js", 2000, gitignoreRules);
  assert(gitignoredFile2.status === "SKIPPED", "build/output.js skipped via .gitignore");

  const gitignoredFile3 = classifyProjectFile("src/custom-ignore/feature.js", 2000, gitignoreRules);
  assert(gitignoredFile3.status === "SKIPPED", "custom-ignore folder skipped via .gitignore");

  const envClass = classifyProjectFile(".env.production", 500);
  assert(envClass.status === "SKIPPED" && envClass.skipReason === "SENSITIVE_FILE", ".env file excluded from analysis for privacy");

  const imageClass = classifyProjectFile("public/logo.png", 50000);
  assert(imageClass.status === "SKIPPED" && imageClass.skipReason === "BINARY_FILE", "Image binary skipped from analysis");

  const tsClass = classifyProjectFile("src/types.ts", 1200);
  assert(tsClass.status === "SKIPPED" && tsClass.skipReason === "UNSUPPORTED_LANGUAGE", "TypeScript file listed in tree as skipped");

  console.log("\n--- 3. GitHub URL Validation & SSRF Defense ---");
  const validGh = parseAndValidateGithubUrl("https://github.com/facebook/react");
  assert(validGh.owner === "facebook" && validGh.repo === "react", "Valid public GitHub URL parsed");

  const validBranchGh = parseAndValidateGithubUrl("https://github.com/expressjs/express/tree/v4.21.2");
  assert(validBranchGh.owner === "expressjs" && validBranchGh.repo === "express" && validBranchGh.ref === "v4.21.2", "Branch ref parsed safely");

  let ssrfBlocked1 = false;
  try { parseAndValidateGithubUrl("http://localhost:5001/admin"); } catch { ssrfBlocked1 = true; }
  assert(ssrfBlocked1, "SSRF attempt on localhost rejected");

  let ssrfBlocked2 = false;
  try { parseAndValidateGithubUrl("https://evil.com/github.com/owner/repo"); } catch { ssrfBlocked2 = true; }
  assert(ssrfBlocked2, "SSRF attempt on non-GitHub host rejected");

  console.log("\n--- 4. Safe ZIP Extraction & Manifest Generation ---");
  const testZip = createTestZip([
    { name: "test-project/src/auth.js", content: "const JWT_SECRET = \"sk-test-secret-12345\";\nfunction login() { return true; }", deflate: true },
    { name: "test-project/src/components/Login.jsx", content: "export function Login() { return <div dangerouslySetInnerHTML={{ __html: \"<p>hi</p>\" }} />; }", deflate: true },
    { name: "test-project/.env", content: "DATABASE_PASSWORD=supersecret", deflate: false },
    { name: "test-project/README.md", content: "# Test Project", deflate: false },
  ]);

  const extractedFiles = extractZipBuffer(testZip);
  assert(extractedFiles.length >= 3, "Extracted test ZIP files into memory");

  const manifest = buildProjectManifest({
    projectName: "Test Security Project",
    sourceType: "zip",
    rawFiles: extractedFiles,
  });

  assert(manifest.totalFileCount === 4, "Manifest contains 4 total files");
  assert(manifest.eligibleFileCount === 2, "Manifest identifies exactly 2 eligible JS/JSX files");
  assert(manifest.skippedFileCount === 2, "Manifest identifies 2 skipped files (.env, README.md)");
  assert(typeof manifest.projectSourceHash === "string" && manifest.projectSourceHash.length === 64, "Generated 64-char SHA-256 project fingerprint");

  console.log("\n--- 5. Multi-File Static AST Analysis & Aggregation ---");
  const reviewRecord = await executeProjectReview({ manifest });

  assert(reviewRecord.status === "complete", "Project review executed to completion");
  assert(reviewRecord.filesAnalyzed === 2, "Analyzed 2 eligible source files");
  assert(reviewRecord.filesSkipped === 2, "Skipped 2 non-analyzable files");
  assert(reviewRecord.findings.length >= 2, "Aggregated real findings across files (found " + reviewRecord.findings.length + ")");

  const secretFinding = reviewRecord.findings.find((f) => f.rule === "SEC-SECRET" || f.title.includes("Secret") || f.title.includes("credential"));
  assert(!!secretFinding, "Found SEC-SECRET finding in auth.js");
  assert(secretFinding?.path === "src/auth.js", "Finding is line-grounded and path-associated to src/auth.js");

  const dangerousHtmlFinding = reviewRecord.findings.find((f) => f.rule === "SEC-DANGEROUS-HTML" || f.title.includes("HTML"));
  assert(!!dangerousHtmlFinding, "Found dangerous HTML finding in Login.jsx");

  assert(typeof reviewRecord.score === "number" && reviewRecord.score < 100, "Calculated overall project health score (" + reviewRecord.score + "/100)");
  assert(reviewRecord.topPriorities.length > 0, "Generated deterministic top priorities list");

  console.log("\n--- 6. Safe Patch Application & Automated Re-Review ---");
  if (secretFinding) {
    const patchOutcome = await applyProjectPatch({
      projectId: manifest.id,
      reviewId: reviewRecord.id,
      fileId: secretFinding.fileId,
      findingId: secretFinding.id,
    });

    assert(patchOutcome.success === true, "Project patch applied successfully");
    assert(patchOutcome.scoreAfter > patchOutcome.scoreBefore, "Score improved after fix: " + patchOutcome.scoreBefore + " -> " + patchOutcome.scoreAfter);
    assert(patchOutcome.diff.resolvedCount === 1, "Exactly 1 finding resolved by patch");
    assert(patchOutcome.diff.resolvedIssues[0].id === secretFinding.id, "Resolved finding matches target secret issue");

    const history = await projectRepository.getReviewsByProjectId(manifest.id);
    assert(history.reviews.length >= 2, "Project review history holds 2 distinct immutable snapshots");
  }

  console.log("\n--- 7. Code Quality, Complexity & Maintainability Verification ---");
  const qualityCode = `
    var legacyItem = "old";
    function badQuality(x) {
      if (x == 5) {
        debugger;
        return true;
        console.log("unreachable");
      }
      try {
        doSomething();
      } catch (err) {}
      const config = { api: "v1", api: "v2" };
      return config;
    }
  `;
  const qualityManifest = buildProjectManifest({
    projectName: "Quality Test App",
    sourceType: "folder",
    rawFiles: [{ path: "src/quality.js", size: qualityCode.length, content: qualityCode }]
  });

  const qualityReview = await executeProjectReview({ manifest: qualityManifest });
  assert(qualityReview.findings.some(f => f.rule === "QUAL-VAR"), "Detected legacy var declaration (QUAL-VAR)");
  assert(qualityReview.findings.some(f => f.rule === "QUAL-EQEQ"), "Detected loose equality operator (QUAL-EQEQ)");
  assert(qualityReview.findings.some(f => f.rule === "QUAL-DEBUGGER"), "Detected debugger statement (QUAL-DEBUGGER)");
  assert(qualityReview.findings.some(f => f.rule === "QUAL-UNREACHABLE"), "Detected unreachable code (QUAL-UNREACHABLE)");
  assert(qualityReview.findings.some(f => f.rule === "QUAL-EMPTY-CATCH"), "Detected empty catch block (QUAL-EMPTY-CATCH)");
  assert(qualityReview.findings.some(f => f.rule === "QUAL-DUPLICATE-KEYS"), "Detected duplicate object keys (QUAL-DUPLICATE-KEYS)");
  assert(qualityReview.findings.some(f => f.category === "QUALITY"), "Categorized issues under QUALITY");

  console.log("\n=== Project Unit Test Results: " + passed + " passed, " + failed + " failed ===\n");
  if (failed > 0) { process.exit(1); }
}

runProjectTests().catch((err) => {
  console.error("FATAL in project tests:", err);
  process.exit(1);
});