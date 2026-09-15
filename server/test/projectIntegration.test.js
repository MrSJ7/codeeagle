import { projectController } from "../src/controllers/project.controller.js";
import { projectRepository } from "../src/repositories/projectRepository.js";
import zlib from "node:zlib";

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

function mockReqRes({ body = {}, params = {}, query = {} } = {}) {
  let statusCode = 200;
  let responseData = null;
  const req = { body, params, query };
  const res = {
    status(code) { statusCode = code; return this; },
    json(data) { responseData = data; return this; },
    send(data) { responseData = data; return this; },
  };
  return { req, res, getStatus: () => statusCode, getData: () => responseData };
}

function createTestZipBase64() {
  const entries = [
    { name: "test-repo/src/auth.js", content: "const JWT_SECRET = \"sk-live-12345\";\nfunction login() { return true; }" },
    { name: "test-repo/src/db.js", content: "function query(user) { eval(user); }" },
    { name: "test-repo/README.md", content: "# Test" }
  ];
  const localHeaders = [];
  const cdHeaders = [];
  let offset = 0;
  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, "utf8");
    const dataBuf = Buffer.from(entry.content, "utf8");
    const lh = Buffer.alloc(30 + nameBuf.length + dataBuf.length);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(0, 6);
    lh.writeUInt16LE(0, 8);
    lh.writeUInt32LE(0, 14);
    lh.writeUInt32LE(dataBuf.length, 18);
    lh.writeUInt32LE(dataBuf.length, 22);
    lh.writeUInt16LE(nameBuf.length, 26);
    lh.writeUInt16LE(0, 28);
    nameBuf.copy(lh, 30);
    dataBuf.copy(lh, 30 + nameBuf.length);
    localHeaders.push(lh);
    const cd = Buffer.alloc(46 + nameBuf.length);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8);
    cd.writeUInt16LE(0, 10);
    cd.writeUInt32LE(0, 16);
    cd.writeUInt32LE(dataBuf.length, 20);
    cd.writeUInt32LE(dataBuf.length, 24);
    cd.writeUInt16LE(nameBuf.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt32LE(offset, 42);
    nameBuf.copy(cd, 46);
    cdHeaders.push(cd);
    offset += lh.length;
  }
  const allLocal = Buffer.concat(localHeaders);
  const allCd = Buffer.concat(cdHeaders);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(allCd.length, 12);
  eocd.writeUInt32LE(allLocal.length, 16);
  return Buffer.concat([allLocal, allCd, eocd]).toString("base64");
}

async function runIntegration() {
  console.log("=== Starting CodeEagle Controller & Ingestion Integration Tests ===\n");

  // 1. Ingest via ZIP
  const zipCtx = mockReqRes({
    body: { sourceType: "zip", name: "My Secure App", zipBase64: createTestZipBase64() }
  });
  await projectController.importProject(zipCtx.req, zipCtx.res, (err) => { throw err; });
  assert(zipCtx.getStatus() === 201, "ZIP import returned HTTP 201 Created");
  const projData = zipCtx.getData();
  assert(projData.project?.id && projData.project.name === "My Secure App", "Project stored with valid ID");
  const projectId = projData.project.id;

  // 2. Ingest via Folder
  const folderCtx = mockReqRes({
    body: {
      sourceType: "folder",
      name: "Local Web App",
      files: [
        { path: "src/index.js", content: "console.log(\"ready\");" },
        { path: "src/config.js", content: "const secret = \"test_secret\";" },
        { path: ".env", content: "SECRET=123" }
      ]
    }
  });
  await projectController.importProject(folderCtx.req, folderCtx.res, (err) => { throw err; });
  assert(folderCtx.getStatus() === 201, "Folder import returned HTTP 201 Created");
  assert(folderCtx.getData().project.eligibleFileCount === 2, "Folder import identified 2 eligible JS files");
  assert(folderCtx.getData().project.skippedFileCount === 1, "Folder import excluded .env file");

  // 3. Get Project details
  const getProjCtx = mockReqRes({ params: { projectId } });
  await projectController.getProject(getProjCtx.req, getProjCtx.res, (err) => { throw err; });
  assert(getProjCtx.getStatus() === 200, "GET project returned HTTP 200");
  assert(getProjCtx.getData().project.totalFileCount === 3, "Returned project has 3 files in tree");

  // 4. Create Project Review
  const revCtx = mockReqRes({ params: { projectId } });
  await projectController.createReview(revCtx.req, revCtx.res, (err) => { throw err; });
  assert(revCtx.getStatus() === 200, "Create review returned HTTP 200");
  const reviewData = revCtx.getData();
  assert(reviewData.review.status === "complete", "Review status is complete");
  assert(reviewData.review.findings.length >= 2, "Review aggregated multi-file findings");
  const reviewId = reviewData.review.id;

  // 5. Get File Content and Issues
  const authFile = reviewData.review.files.find(f => f.path.includes("auth.js"));
  assert(!!authFile, "Found auth.js file in review");
  const fileCtx = mockReqRes({ params: { projectId, fileId: authFile.id } });
  await projectController.getFile(fileCtx.req, fileCtx.res, (err) => { throw err; });
  assert(fileCtx.getStatus() === 200, "GET file returned HTTP 200");
  assert(fileCtx.getData().file.content.includes("JWT_SECRET"), "File content returned accurately");

  // 6. Apply Fix to Project File
  const secretIssue = authFile.issues.find(i => i.rule === "SEC-SECRET");
  if (secretIssue) {
    const patchCtx = mockReqRes({
      params: { projectId, fileId: authFile.id, findingId: secretIssue.id },
      body: { reviewId }
    });
    await projectController.applyPatch(patchCtx.req, patchCtx.res, (err) => { throw err; });
    assert(patchCtx.getStatus() === 200, "Apply patch returned HTTP 200");
    const patchData = patchCtx.getData();
    assert(patchData.success === true, "Patch success is true");
    assert(patchData.diff.resolvedCount === 1, "Diff records 1 resolved issue");
    assert(patchData.scoreAfter > patchData.scoreBefore, "Score improved after patch");
  }

  // 7. Get Project Review History
  const histCtx = mockReqRes({ params: { projectId } });
  await projectController.getProjectReviews(histCtx.req, histCtx.res, (err) => { throw err; });
  assert(histCtx.getStatus() === 200, "GET reviews history returned HTTP 200");
  assert(histCtx.getData().reviews.length >= 2, "History holds multiple review snapshots");

  // 8. Generate Automated Refactor for Finding
  const dbFile = reviewData.review.files.find(f => f.path.includes("db.js"));
  const evalIssue = dbFile.issues.find(i => i.rule === "SEC-EVAL");
  if (evalIssue) {
    const refactorCtx = mockReqRes({
      params: { projectId, fileId: dbFile.id, findingId: evalIssue.id },
      body: { issue: evalIssue },
    });
    await projectController.refactorFinding(refactorCtx.req, refactorCtx.res, (err) => { throw err; });
    assert(refactorCtx.getStatus() === 200, "Refactor finding returned HTTP 200");
    const refactorData = refactorCtx.getData();
    assert(refactorData.success === true, "Refactor generation succeeded");
    assert(typeof refactorData.replacement === "string", "Refactor returned replacement string");
    assert(typeof refactorData.explanation === "string", "Refactor returned explanation");
  }

  console.log("\n=== Integration Test Results: " + passed + " passed, " + failed + " failed ===\n");
  if (failed > 0) process.exit(1);
}

runIntegration().catch((err) => {
  console.error("FATAL in integration test:", err);
  process.exit(1);
});