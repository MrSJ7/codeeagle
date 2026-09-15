import zlib from "node:zlib";
const API_BASE = "http://localhost:5001";

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

function createSimpleZipBase64() {
  const entries = [
    { name: "sample-project/src/auth.js", content: "const JWT_SECRET = \"test_secret_12345\";\nfunction auth() { return true; }" },
    { name: "sample-project/src/db.js", content: "function query(user) { eval(user); }" },
    { name: "sample-project/README.md", content: "# Sample" }
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

async function runApiTests() {
  console.log("=== Starting CodeEagle Project REST API Contract Tests ===\n");

  // 1. POST /api/projects/import (ZIP mode)
  const zipBase64 = createSimpleZipBase64();
  const importRes = await fetch(API_BASE + "/api/projects/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sourceType: "zip", name: "Fixture ZIP Project", zipBase64 })
  });
  assert(importRes.status === 201, "POST /api/projects/import returns 201 Created for valid ZIP");
  const importData = await importRes.json();
  assert(importData.success === true && importData.project?.id, "Response contains project ID");
  assert(importData.project.totalFileCount === 3, "Manifest contains 3 files");
  assert(importData.project.eligibleFileCount === 2, "Manifest identifies 2 eligible JS files");
  const projectId = importData.project.id;

  // 2. GET /api/projects/:projectId
  const getRes = await fetch(API_BASE + "/api/projects/" + projectId);
  assert(getRes.status === 200, "GET /api/projects/:projectId returns 200 OK");
  const getData = await getRes.json();
  assert(getData.project.name === "Fixture ZIP Project", "Project name matches imported name");

  // 3. POST /api/projects/:projectId/reviews
  const reviewRes = await fetch(API_BASE + "/api/projects/" + projectId + "/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  assert(reviewRes.status === 200, "POST /api/projects/:projectId/reviews returns 200 OK");
  const reviewData = await reviewRes.json();
  assert(reviewData.success === true && reviewData.review?.id, "Review generated with ID");
  assert(reviewData.review.status === "complete", "Review status is complete");
  assert(reviewData.review.findings.length >= 2, "Review contains multi-file findings");
  const reviewId = reviewData.review.id;

  // 4. GET /api/projects/:projectId/reviews/:reviewId
  const getRevRes = await fetch(API_BASE + "/api/projects/" + projectId + "/reviews/" + reviewId);
  assert(getRevRes.status === 200, "GET /api/projects/:projectId/reviews/:reviewId returns 200 OK");
  const getRevData = await getRevRes.json();
  assert(getRevData.review.id === reviewId, "Retrieved review snapshot matches review ID");

  // 5. GET /api/projects/:projectId/files/:fileId
  const targetFile = reviewData.review.files.find(f => f.path.includes("auth.js"));
  assert(!!targetFile, "Found auth.js in review files");
  const fileRes = await fetch(API_BASE + "/api/projects/" + projectId + "/files/" + targetFile.id);
  assert(fileRes.status === 200, "GET /api/projects/:projectId/files/:fileId returns 200 OK");
  const fileData = await fileRes.json();
  assert(fileData.file.content.includes("JWT_SECRET"), "File payload includes exact source code");

  // 6. POST /api/projects/:projectId/files/:fileId/findings/:findingId/apply
  const secretFinding = targetFile.issues.find(i => i.rule === "SEC-SECRET");
  if (secretFinding) {
    const patchRes = await fetch(API_BASE + "/api/projects/" + projectId + "/files/" + targetFile.id + "/findings/" + secretFinding.id + "/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId })
    });
    assert(patchRes.status === 200, "POST patch apply returns 200 OK");
    const patchData = await patchRes.json();
    assert(patchData.success === true, "Patch applied successfully");
    assert(patchData.diff.resolvedCount === 1, "Diff records 1 resolved issue");
  }

  // 7. GET /api/projects/:projectId/reviews (Project History)
  const histRes = await fetch(API_BASE + "/api/projects/" + projectId + "/reviews");
  assert(histRes.status === 200, "GET /api/projects/:projectId/reviews returns 200 OK");
  const histData = await histRes.json();
  assert(histData.reviews.length >= 2, "Project history contains review snapshots");

  // 8. Error handling: Unknown project returns 404
  const notFoundRes = await fetch(API_BASE + "/api/projects/proj_non_existent");
  assert(notFoundRes.status === 404, "Unknown project ID returns 404 Not Found");

  // 9. Error handling: Malformed import returns 400
  const badRes = await fetch(API_BASE + "/api/projects/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sourceType: "unknown_type" })
  });
  assert(badRes.status === 400, "Unsupported source type returns 400 Bad Request");

  console.log("\n=== Project REST API Test Results: " + passed + " passed, " + failed + " failed ===\n");
  if (failed > 0) process.exit(1);
}

runApiTests().catch((err) => {
  console.error("FATAL in API test:", err);
  process.exit(1);
});