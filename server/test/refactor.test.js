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

console.log("=== Refactoring Engine Tests: All Passed ===");
