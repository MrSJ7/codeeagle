# CodeLens — Viva Preparation & Oral Defense Guide 🎓

This guide contains concise, speakable answers for viva examinations, project defenses, and technical evaluations.

---

## ⏱️ Quick Spoken Introductions

### 1. 30-Second Introduction (Section 30)
> *"CodeLens is an AI-assisted code review platform that combines deterministic static analysis with Google Gemini semantic reasoning. It parses JavaScript and JSX into an Abstract Syntax Tree to identify security flaws, code quality issues, and maintainability metrics deterministically. It then uses Gemini to detect subtle logical edge cases, validates all AI outputs against strict schema and line-grounding rules, calculates an objective quality score, and enables safe one-click patch application with automatic re-analysis and audit history persistence."*

### 2. 1-Minute Technical Walkthrough (Section 31)
> *"Architecturally, CodeLens is a decoupled full-stack application. The frontend is a React 18 Single Page Application built with Vite and Tailwind CSS. The backend is an Express REST API in Node.js.
> 
> When a user submits code, the backend first runs a deterministic static analyzer using Babel Parser and Traverse. This calculates cyclomatic complexity, nesting depth, and metrics, and evaluates 13 security and quality AST rules. Next, if configured, the backend calls Google Gemini via `@google/genai` to analyze contextual logic.
> 
> Crucially, AI output is never trusted blindly: it is constrained to a strict JSON schema, validated against source line bounds, and deduplicated against static findings where static rules always take precedence. The final score is computed deterministically from merged findings—Gemini never controls the score.
> 
> If a developer applies a fix, our patch engine verifies that the target snippet exists verbatim, occurs exactly once, matches the expected line range, and checks a SHA-256 hash to ensure the source is not stale. After pure string replacement, the engine immediately re-analyzes the code to compute a before/after diff. Both audits are stored as immutable records in MongoDB, with an automatic in-memory fallback if the database is offline."*

### 3. "Why This Project Is Good" (Section 32)
> *"CodeLens represents a pragmatic, production-inspired approach to AI developer tools:
> 1. **Hybrid Architecture**: It doesn't rely solely on AI. It uses deterministic AST parsing for baseline reproducibility and AI strictly for contextual reasoning.
> 2. **Defensive Guardrails**: AI output is schema-validated, line-grounded, and confidence-weighted.
> 3. **Verified Safe Code Mutation**: Unlike chatbot copy-paste, patches are verified with SHA-256 stale-source protection, uniqueness checks, and immediate automated re-analysis.
> 4. **Self-Healing Graceful Degradation**: If Gemini API or MongoDB is down, the core static analysis and in-memory persistence continue working without crashing.
> 5. **Traceability**: Every review and patch creates an immutable audit record for measurable before/after comparison."*

---

## 📚 Core Viva Question Bank (40 Questions)

### Part 1: Project Basics
#### 1. What is CodeLens?
An automated code review tool combining deterministic AST-based static analysis with optional Google Gemini semantic analysis, safe automated patching, and audit persistence.

#### 2. What problem does it solve?
Manual code review is slow, while static linters miss deep contextual bugs and raw LLMs hallucinate non-existent issues or invalid line numbers. CodeLens bridges this by grounding AI findings inside a deterministic static analysis framework.

#### 3. Why did you choose this project?
To explore how deterministic compiler techniques (AST parsing) and modern generative AI can complement each other safely without executing untrusted user code.

#### 4. What makes it different from a simple chatbot code reviewer?
Chatbots output unvalidated markdown text with potential hallucinations, cannot verify line numbers, cannot measure exact cyclomatic complexity, and cannot safely patch code. CodeLens provides structured AST metrics, strict JSON validation, deterministic scoring, and verified safe diff patching.

---

### Part 2: Architecture
#### 5. Explain the overall architecture.
A client-server model: React 18 SPA on the frontend communicating via REST to an Express backend. The backend delegates to a Review Orchestrator that coordinates the Babel AST analyzer, optional Gemini API service, an AI validation/deduplication layer, a deterministic scoring engine, a safe patch engine, and a persistence repository with MongoDB and memory implementations.

#### 6. Why separate frontend and backend?
Separation of concerns, security, and independent scalability. API keys (Gemini) and database credentials remain strictly on the backend, while the client focuses purely on UI rendering and state.

#### 7. Why use a service layer?
To decouple business logic from Express HTTP routing (`req`, `res`). This makes core algorithms (scoring, deduplication, patch verification) modular, independently testable, and reusable across different controllers.

#### 8. Why use a repository abstraction?
To decouple data persistence from review business logic. The `reviewRepository` facade allows CodeLens to seamlessly toggle between MongoDB and in-memory storage without changing a single line of review or patch code.

---

### Part 3: Static Analysis
#### 9. What is an Abstract Syntax Tree (AST)?
An AST is a tree representation of the syntactic structure of source code, where each node represents a language construct (e.g., `VariableDeclaration`, `IfStatement`, `CallExpression`).

#### 10. Why use `@babel/parser`?
Babel is a robust, battle-tested JavaScript/JSX parser supporting modern ECMAScript standards without executing any code.

#### 11. How is cyclomatic complexity calculated?
We start at 1 and add 1 for every decision point / branch in the function AST: `if`, `else if`, `for`, `while`, `do-while`, `case`, `catch`, conditional ternary (`? :`), and logical binary operators (`&&`, `||`, `??`).

#### 12. What is max nesting?
The maximum depth of nested control-flow blocks (`if`, `for`, `while`, `switch`, `try`) within any single function, measuring cognitive complexity.

#### 13. How are static rules registered?
In a centralized registry (`ruleRegistry.js`) containing metadata (ID, category, severity, title, description, recommendation, fix support). Each analyzer queries this catalog to ensure consistent IDs and contracts.

#### 14. Why is static analysis deterministic?
Given the same source code input, the parser generates the exact same AST and the static rules evaluate the exact same checks, guaranteeing identical findings, metrics, and scores every time.

---

### Part 4: AI & Gemini Integration
#### 15. Why use Google Gemini?
To detect semantic bugs, improper API usages, and subtle logic flaws that rigid pattern-matching AST rules cannot identify.

#### 16. What does Gemini add beyond AST rules?
AST rules can detect that `dangerouslySetInnerHTML` is used, but Gemini can reason about whether the supplied string actually originated from an untrusted source or whether an asynchronous state update suffers from a race condition.

#### 17. How do you constrain Gemini output?
Using `@google/genai` with `responseMimeType: "application/json"` and a strict `responseSchema` that specifies required fields, enums for categories and severities, and nested fix structures.

#### 18. What is structured JSON output?
The Gemini API constrains token generation at decoding time to only emit valid JSON conforming to the OpenAPI-style schema provided in the request.

#### 19. How do you handle malformed AI responses?
If the response fails JSON parsing or schema validation in `aiValidator.js`, the system logs the incident, sets `aiStatus: "VALIDATION_FAILED"`, and cleanly returns the static analysis findings without crashing.

#### 20. How do you reduce the impact of hallucinations?
1. Source Grounding: Source code is numbered line-by-line in the prompt.
2. Range Bounds Check: Line numbers must be within valid file bounds.
3. Verbatim Fix Check: Suggested `originalSnippet` must exist verbatim in the source code; otherwise the fix is stripped.
4. Confidence Weighting: AI score penalties are weighted by the model's reported confidence score.
5. Static Wins: Duplicate AI findings on the same line are discarded in favor of deterministic static rules.

#### 21. Why doesn't Gemini control the final score?
LLMs are probabilistic and notoriously inconsistent at quantitative scoring. CodeLens uses a deterministic scoring formula: overall and category scores are calculated mathematically from the final deduplicated issue set.

---

### Part 5: Patching & Diff Engine
#### 22. How does Apply Patch work?
The client submits the target code, issue ID, and fix. The server verifies source integrity, performs an exact string replacement of the single occurrence of `originalSnippet` with `replacementSnippet`, re-analyzes the resulting code, and returns the new code, diff, and updated review.

#### 23. How do you prevent patching stale code?
Every review computes a SHA-256 `codeHash`. Patch requests must supply `expectedCodeHash`. If the server's hash of the incoming code does not match `expectedCodeHash`, the patch is rejected with `409 STALE_SOURCE`.

#### 24. Why use SHA-256?
It is a fast, cryptographically secure hash function that guarantees even a single-character difference in the source code produces a completely different 64-character hex digest.

#### 25. Why require the original snippet to occur exactly once?
If the snippet appears multiple times in the file, simple text replacement would be ambiguous and could patch the wrong occurrence, potentially introducing syntax errors or corrupted code.

#### 26. How are AI patches kept safe?
AI patches undergo extra checks in `aiPatchVerifier.js`:
- Must have confidence $\ge 0.80$.
- Must span $\le 30$ lines.
- Replacement must be $\le 50$ KB.
- Verbatim match within $\pm 5$ lines of the reported issue.
- Requires explicit user preview and confirmation before application.

#### 27. Why re-run analysis after applying a patch?
To verify that the targeted issue was actually resolved, to confirm no new syntax or security issues were introduced, and to compute an accurate before/after score diff.

---

### Part 6: Database & Persistence
#### 28. Why MongoDB?
MongoDB stores JSON-like BSON documents, which map naturally to our hierarchical review response objects (nested metrics, issue arrays, score breakdowns).

#### 29. Why Mongoose?
It provides schema enforcement, model validation, and type safety on top of MongoDB collections.

#### 30. Why have an in-memory fallback?
High resilience: a database connection failure should not prevent a developer from reviewing code. If MongoDB is down or unconfigured, reviews are saved in an in-memory repository.

#### 31. What happens when MongoDB is down?
`connectDatabase()` catches the error, logs a sanitized message without leaking credentials, sets `isDatabaseConnected()` to false, and routes all repository operations to `memoryReviewRepository`. Zero 500 crashes occur.

#### 32. Why store audits as separate immutable records?
For auditability and progress tracking. Overwriting audits would destroy the history of improvements. Having separate records allows side-by-side comparison of pre-patch vs. post-patch code.

---

### Part 7: Security & Safety
#### 33. Do you execute user code?
**No.** CodeLens never executes, evals, or runs submitted code in any runtime environment. Analysis is performed strictly via AST parsing and pure text inspection.

#### 34. How are API keys protected?
`GEMINI_API_KEY` is loaded strictly on the backend via environment variables. It is never exposed in client bundles, client environment files, or API responses.

#### 35. How do you validate input?
We validate that code is a non-empty string, enforce a 150 KB payload size limit, normalize and restrict languages to `javascript` and `jsx`, and reject malformed JSON with canonical error structures.

#### 36. How do you prevent arbitrary AI-generated code mutation?
AI cannot modify files directly. It can only propose replacement snippets, which must pass verbatim string matching, line range limits, size limits, and explicit user confirmation in a visual diff modal.

#### 37. What happens if Gemini goes down?
The backend catches the timeout or network failure, sets `metadata.engine = "static"` and `metadata.aiStatus = "UNAVAILABLE"`, and returns the static review with HTTP 200.

#### 38. What happens if the frontend sends a malicious patch request?
The patch controller re-validates all parameters on the server: source hash, snippet existence, snippet uniqueness, and size bounds. Client-side tampering cannot bypass server-side validation.

---

### Part 8: Deployment & Future Scope
#### 39. How is CodeLens deployed?
Frontend is deployed on Vercel as a static SPA with rewrite rules. Backend is deployed on Render as a Node.js web service with dynamic port binding and strict CORS. Persistent data is hosted on MongoDB Atlas.

#### 40. What would you improve for a production-scale system?
Add user authentication (JWT/OAuth), multi-file / workspace analysis, Git repository integration (GitHub Webhooks/PR reviews), background job queues (Redis/BullMQ) for large reviews, and AST-based AST-replacement patching.

---

## 🎯 "Trick" Viva Questions & Honest Answers (Section 17)

#### Q: "Can Gemini guarantee that its finding is 100% correct?"
> **Answer**: *"No. LLMs are probabilistic models based on pattern prediction; they cannot provide mathematical proofs of correctness. That is why CodeLens validates AI output, bounds it by source line numbers, verifies snippets verbatim, and keeps the deterministic static engine as the authoritative baseline."*

#### Q: "Can your static analyzer detect every possible security bug?"
> **Answer**: *"No. Static AST analysis uses pattern-matching rules and local heuristics. It does not perform inter-procedural taint analysis across third-party packages or dynamic runtime execution. It is designed to catch common, high-risk patterns quickly and deterministically."*

#### Q: "Can your patch engine prove semantic correctness of the patched code?"
> **Answer**: *"No. The patch engine guarantees syntactic text replacement safety (exact match, uniqueness, bounds checking, and post-patch AST re-analysis). It proves the text changed as intended and didn't introduce syntax errors, but full semantic correctness would require comprehensive test suites or formal verification."*

#### Q: "What if Gemini hallucinates a line number that doesn't exist?"
> **Answer**: *"Our `aiValidator.js` checks every finding against the file's total line count: `issue.line >= 1 && issue.line <= totalLines`. Any finding with an out-of-bounds line number is discarded before reaching the review result."*

#### Q: "What if two identical code snippets exist in the file?"
> **Answer**: *"The patch engine rejects the candidate with reason `MULTIPLE_MATCHES`. We intentionally refuse to patch ambiguous snippets to prevent modifying the wrong location in the file."*

#### Q: "What happens if MongoDB is down?"
> **Answer**: *"The backend transparently switches to the in-memory repository. The review, scoring, patch, and history drawer features continue working smoothly for the active server session."*

#### Q: "What happens if Gemini is unavailable or rate-limited?"
> **Answer**: *"The review service catches the error, sets `metadata.aiStatus = 'UNAVAILABLE'`, and returns the static AST review with HTTP 200. The user still receives deterministic metrics, static issues, and safe static patches."*

#### Q: "Why not just use Gemini for everything, including scoring and static rules?"
> **Answer**: *"Because LLMs lack determinism. If you send the same code three times, Gemini might give three different scores and miss rules it caught previously. Static AST analysis provides reproducible, instant baselines, allowing Gemini to focus solely on what it does best: contextual reasoning."*

#### Q: "Why not execute the submitted code in a sandbox to test it dynamically?"
> **Answer**: *"Executing arbitrary user code introduces significant security risks (remote code execution, container escapes, resource exhaustion). Pure static AST inspection and semantic AI analysis provide comprehensive review capabilities with zero code execution risk."*

#### Q: "Why not let AI directly modify the file like Cursor or Copilot?"
> **Answer**: *"For code review safety and educational clarity, human-in-the-loop oversight is essential. CodeLens requires explicit preview and confirmation in a diff modal before any patch is applied."*
