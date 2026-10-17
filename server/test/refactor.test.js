import assert from 'node:assert/strict';
import { generateFindingRefactor } from '../src/services/refactorService.js';

console.log('=== Starting CodeEagle Refactor Safety Tests ===');

const code = `function total(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}`;

await assert.rejects(
  generateFindingRefactor({ code, issue: { rule: 'COMP-HIGH', line: 0, endLine: 2 } }),
  /outside the source file/,
);

const noCandidate = await generateFindingRefactor({
  code,
  issue: { rule: 'COMP-HIGH', line: 1, endLine: 3 },
  filename: 'total.js',
});
assert.equal(noCandidate.success, false, 'A missing model must not invent replacement logic');
assert.equal(typeof noCandidate.error.message, 'string');
assert.equal(noCandidate.replacement, undefined);

const duplicate = await generateFindingRefactor({
  code: 'debugger;\ndebugger;',
  issue: { rule: 'QUAL-DEBUGGER', line: 1, endLine: 1 },
});
assert.equal(duplicate.success, false, 'Ambiguous source text cannot be auto-edited');

const { projectRepository } = await import('../src/repositories/projectRepository.js');
const project = { id: 'proj_test_refactor_1', name: 'Refactor Test Project' };
await projectRepository.saveProject(project);
const review = {
  id: 'rev_test_refactor_1',
  projectId: project.id,
  projectName: project.name,
  score: 80,
  files: [],
  findings: [],
  createdAt: new Date().toISOString(),
};
await projectRepository.saveReview(review);
const latest = await projectRepository.getLatestReview(project.id);
assert.equal(latest?.id, review.id);

console.log('=== Refactor Safety Tests Passed ===');
