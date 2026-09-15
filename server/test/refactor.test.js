import assert from "node:assert";
import { generateFindingRefactor } from "../src/services/refactorService.js";

console.log("=== Starting CodeEagle Refactoring Engine Tests ===");

// Test 1: QUAL-LENGTH decomposition
{
  const monolithicCode = `// Monolithic test function
async function testArchanaBrowserUpload() {
  const a = 1;
  const b = 2;
  const c = 3;
  // ... more logic
  return a + b + c;
}`;

  const issue = {
    rule: "QUAL-LENGTH",
    title: "Function 'testArchanaBrowserUpload' spans 52 lines",
    line: 2,
    endLine: 8,
  };

  const result = await generateFindingRefactor({
    code: monolithicCode,
    issue,
    filename: "testArchanaBrowserUpload.js",
  });

  assert(result.success === true, "Refactor returns success true");
  assert(result.original.includes("testArchanaBrowserUpload"), "Original snippet contains function name");
  assert(result.replacement.includes("setupTestArchanaBrowserUploadContext") || result.replacement.includes("setup"), "Decomposed helpers created");
  assert(result.replacement.includes("async function testArchanaBrowserUpload()"), "Orchestrator function preserved");
  console.log("✅ PASS: QUAL-LENGTH monolithic function decomposed into modular helpers");
}

// Test 2: QUAL-EMPTY-CATCH remediation
{
  const codeWithEmptyCatch = `try {
  doRiskyOperation();
} catch (e) {}`;

  const issue = {
    rule: "QUAL-EMPTY-CATCH",
    title: "Empty catch block suppresses exceptions",
    line: 1,
    endLine: 3,
  };

  const result = await generateFindingRefactor({
    code: codeWithEmptyCatch,
    issue,
    filename: "risky.js",
  });

  assert(result.success === true, "Refactor succeeds for empty catch");
  assert(result.replacement.includes("console.error"), "Added error logging inside catch");
  console.log("✅ PASS: QUAL-EMPTY-CATCH adds diagnostic error handling");
}

// Test 3: COMP-HIGH cyclomatic complexity function decomposition
{
  const complexCode = `// verify-operations-e2e.js
export async function runOperationsE2ETests(config) {
  if (config.auth) {
    if (config.token) {
      // step 1
    }
  }
  return { success: true };
}`;

  const issue = {
    id: "COMP-HIGH-2",
    rule: "COMP-HIGH",
    title: "Function 'runOperationsE2ETests' has a cyclomatic complexity of 11",
    line: 2,
    endLine: 9,
  };

  const result = await generateFindingRefactor({
    code: complexCode,
    issue,
    filename: "verify-operations-e2e.js",
  });

  assert(result.success === true, "Refactor returns success true for COMP-HIGH");
  assert(result.original.includes("runOperationsE2ETests"), "Original includes target function name");
  assert(result.replacement.includes("setupRunOperationsE2ETestsContext"), "Decomposed helper created");
  assert(result.replacement.includes("export async function runOperationsE2ETests(config)"), "Preserved export, async, and parameters");
  console.log("✅ PASS: COMP-HIGH decomposes complex function while preserving export, async, and parameters");
}

// Test 4: QUAL-VAR deterministic refactoring
{
  const varCode = `function computeTotal() {
  var count = 10;
  return count * 2;
}`;

  const issue = {
    rule: "QUAL-VAR",
    title: "Use of 'var' keyword is discouraged",
    line: 2,
    endLine: 2,
  };

  const result = await generateFindingRefactor({
    code: varCode,
    issue,
    filename: "calc.js",
  });

  assert(result.success === true, "Refactor succeeds for QUAL-VAR");
  assert(result.replacement.includes("let count = 10"), "Replaced var with let");
  console.log("✅ PASS: QUAL-VAR replaces var with let");
}

// Test 5: projectRepository.getLatestReview
{
  const { projectRepository } = await import("../src/repositories/projectRepository.js");
  const testProj = { id: "proj_test_refactor_1", name: "Refactor Test Project" };
  await projectRepository.saveProject(testProj);

  const testReview = {
    id: "rev_test_refactor_1",
    projectId: testProj.id,
    projectName: testProj.name,
    score: 80,
    files: [],
    findings: [],
    createdAt: new Date().toISOString(),
  };
  await projectRepository.saveReview(testReview);

  const latest = await projectRepository.getLatestReview(testProj.id);
  assert(latest !== null, "getLatestReview returned a review");
  assert.strictEqual(latest.id, testReview.id, "getLatestReview returned the latest review");
  console.log("✅ PASS: projectRepository.getLatestReview resolves latest review");
}

console.log("=== Refactoring Engine Tests: All Passed ===");
