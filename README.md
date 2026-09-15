# CodeLens — AI Code Reviewer

CodeLens is a web-based AI-assisted code review platform that combines deterministic AST-based static analysis with Gemini semantic analysis, validates and merges findings, assigns deterministic quality scores, supports safe verified patches with automatic re-analysis, and stores auditable review history through MongoDB with an in-memory fallback.

---

## 1. Project Overview

CodeLens addresses a critical dilemma in modern software engineering tools:
- **Traditional linters** (ESLint, SonarQube) provide deterministic, reproducible results but lack semantic context and fail to catch subtle logic flaws or complex state bugs.
- **Pure LLM reviewers** (ChatGPT, Claude, Cursor) offer flexible contextual reasoning but frequently suffer from hallucinations, inconsistent scoring, out-of-bounds line numbers, and unsafe code modifications.

CodeLens solves this by combining both paradigms: **deterministic static analysis establishes an unshakeable ground truth**, while **Google Gemini provides contextual semantic reasoning** constrained by strict validation guardrails.

---

## 2. Features

- **Dual-Engine Review Pipeline**: Deterministic Babel AST analysis runs first and fast; optional Google Gemini semantic analysis runs concurrently.
- **13 Registered Deterministic Rules**: Built-in rules for hardcoded secrets, SQL injection, `eval()`, prototype pollution, `useEffect` dependencies, memory leaks, and function complexity.
- **Babel AST Metrics**: Measures lines of code, function counts, branch counts, cyclomatic complexity, and maximum control-flow nesting depth.
- **Defensive AI Guardrails**: Gemini outputs are constrained to strict JSON schemas, validated against physical source line counts, and checked for verbatim fix snippets.
- **Deterministic Deduplication & Scoring**: Static rules always supersede AI findings on duplicate lines. Scores (0–100) and category breakdowns are calculated mathematically from merged issues.
- **Verified Safe Patch Engine**: One-click patch application with SHA-256 stale-source protection, verbatim snippet matching, single-occurrence enforcement, and visual diff previews.
- **Automated Post-Patch Re-Analysis**: Applying a patch immediately triggers a server-side re-audit to verify that the target issue was resolved and no new regressions were introduced.
- **Immutable Review History**: Every audit is persisted as an independent record in MongoDB (with automatic in-memory fallback), allowing side-by-side pre-patch vs. post-patch inspection.
- **Production Deployment Ready**: Configured for Vercel (frontend SPA) and Render (backend REST API) with strict CORS allowlists, security headers, and health probes.

---

## 3. Architecture

CodeLens is built as a decoupled full-stack application with clean architectural separation between presentation, orchestration, analysis, and persistence:

```text
                       ┌─────────────────┐
                       │ React + Vite UI │
                       └────────┬────────┘
                                │ HTTPS REST (JSON)
                                ▼
                         Express REST API
                                │
                       ┌────────┴─────────┐
                       │  Review Service  │
                       └────────┬─────────┘
                                │
                 ┌──────────────┼──────────────┐
                 ▼              ▼              ▼
             Static AST      Gemini AI      Persistence
              Engine          Engine       Repository
          (Babel Parser)  (@google/genai)      │
                 │              │              │
                 │        AI Validation        ├── MongoDB Atlas
                 │       & Deduplication       └── In-Memory Store
                 └──────┬───────┘
                        ▼
                   Issue Merge
                        ▼
                Deterministic Score
                        ▼
                  Canonical Review
                        │
                        ▼
                  Patch Verification (SHA-256)
                        │
                        ▼
                  Automatic Re-analysis
                        │
                        ▼
                  Review History
```

### Architectural Layer Responsibilities
1. **Frontend (`client/`)**: Single Page Application (SPA) in React 18, Vite, and Tailwind CSS. Manages editor state, displays metric breakdowns, renders unified visual diff modals, and queries audit history.
2. **REST API (`server/src/routes/` & `controllers/`)**: Validates input payloads, enforces size limits, handles errors canonically, and restricts CORS to authorized origins.
3. **Review Orchestrator (`server/src/services/reviewService.js`)**: Single authority coordinating static AST analysis, optional Gemini semantic queries, AI validation, deduplication, and score calculation.
4. **Static Engine (`server/src/analyzers/`)**: Pure in-memory AST parser and rule evaluator with zero external network dependencies.
5. **AI Service (`server/src/services/geminiService.js`)**: Interfaces with `@google/genai`, enforcing numbered-line source grounding and strict JSON schemas.
6. **Patch Engine (`server/src/services/patchService.js` & `aiPatchVerifier.js`)**: Cryptographically checks SHA-256 code hashes, validates snippet uniqueness, and performs pure string mutations.
7. **Repository Facade (`server/src/repositories/reviewRepository.js`)**: Decouples persistence from business logic, gracefully defaulting to in-memory storage if MongoDB is unreachable.

---

## 4. Technology Stack

| Technology | Purpose in CodeLens | Why Chosen |
| :--- | :--- | :--- |
| **React 18** | Client UI Framework | Component-based state management for editor, diff modals, and reactive issue filtering. |
| **Vite** | Frontend Build Tool & Dev Server | Sub-second hot module replacement (HMR) and optimized rollup production bundles (~1.1s build). |
| **Tailwind CSS** | Styling System | Utility-first CSS allowing clean, modern dark-themed developer interfaces without bloated CSS files. |
| **Node.js 20+** | Runtime Environment | High-performance asynchronous non-blocking runtime ideal for concurrent API operations. |
| **Express 4** | Backend Web Framework | Robust, minimalist REST API routing with mature middleware for JSON parsing, CORS, and error handling. |
| **`@babel/parser` & `@babel/traverse`** | JavaScript / JSX AST Parsing | Standard compiler toolchain for ECMAScript syntax inspection without executing untrusted code. |
| **Google Gemini API** | Semantic AI Engine | Fast reasoning capabilities for detecting subtle logic flaws, contextual race conditions, and edge cases. |
| **`@google/genai`** | Official Google GenAI SDK | First-party SDK offering native support for structured JSON schemas (`responseSchema`). |
| **MongoDB & Mongoose** | Persistent Storage & ODM | Schema-enforced document storage mapping directly to hierarchical review objects and audit arrays. |
| **Vercel** | Frontend Hosting | Global CDN edge network optimized for React Single Page Applications. |
| **Render** | Backend Cloud Hosting | Containerized Node.js web service support with native health check probes and dynamic port binding. |

---

## 5. How Review Works

Every code review in CodeLens executes through a strict 17-step lifecycle:

```text
User Code ──► Validate ──► AST Parse ──► Static Rules ──► Optional Gemini ──► Validate AI
                                                                                  │
Persist ◄── Canonical Review ◄── Calculate Score ◄── Deduplicate ◄── Normalize AI ◄
   │
   ▼
Frontend Display ──► Preview Patch ──► Verify Patch ──► Apply String Patch ──► Re-Analyze
                                                                                   │
                                  New Audit in History ◄── Compare Before/After ◄──┘
```

1. **Submission**: User submits source code through the React code editor.
2. **Input Validation**: Express backend validates payload size ($\le 150$ KB), non-empty string, and language (`javascript` or `jsx`).
3. **AST Generation**: `@babel/parser` parses the source code into an Abstract Syntax Tree.
4. **Static Rule Evaluation**: 13 static analyzers traverse the AST to extract metrics and flag deterministic issues.
5. **Contextual AI Prompting**: If configured, Google Gemini is invoked with the source code (formatted with 1-based line numbers) and existing static rule IDs.
6. **Defensive AI Validation**: `aiValidator.js` validates model output against schema, line bounds, and verifies that suggested fix snippets exist verbatim.
7. **AI Finding Normalization**: Validated AI findings are mapped to canonical issue structures (`source: "AI"`).
8. **Deduplication**: `issueDeduplicator.js` compares findings; if static and AI rules flag the same line/concern, the static rule always wins.
9. **Canonical Issue IDs**: Deterministic IDs (`RULE-LINE-HASH`) are generated for all retained issues.
10. **Deterministic Scoring**: Score Calculator computes overall score (0–100) and category breakdowns from merged issues.
11. **Persistence**: The completed audit record is stored in MongoDB (or in-memory repository).
12. **Frontend Rendering**: Client displays the overall score, metrics, issue cards, and code editor annotations.
13. **Independent Patch Verification**: User clicks "Preview Fix"; backend verifies SHA-256 code hash, verbatim snippet match, uniqueness, and line bounds.
14. **User Confirmation**: User reviews the visual before/after diff in the modal and confirms patch application.
15. **Pure Text Mutation & Re-Analysis**: The patch engine applies the replacement as pure text and immediately triggers full re-analysis of the patched code.
16. **Review Diffing**: Before/after reviews are diffed to identify resolved issues, remaining issues, and score improvements.
17. **New Immutable Audit**: The post-patch review is persisted as a distinct, new historical record.

---

## 6. Static Analysis

Deterministic static analysis runs entirely in-memory using Babel AST parsing.

### Calculated Metrics
- **Lines of Code (LOC)**: Total physical source lines.
- **Function Count**: Total function declarations, arrow functions, and function expressions.
- **Branch Count**: Decision branches (`if`, `switch`, loops, ternary, logical operators).
- **Cyclomatic Complexity**: Calculated using McCabe's method:
  $$\text{Complexity} = 1 + \sum (\text{decision points})$$
- **Maximum Nesting Depth**: Deepest block nesting level inside any single function.

### Centralized Static Rule Catalog (13 Rules)
All rules are cataloged in `server/src/analyzers/ruleRegistry.js` and queryable via `GET /api/rules`:

| Rule ID | Category | Severity | What It Detects | Auto Fix Supported? |
| :--- | :--- | :--- | :--- | :--- |
| `SEC-SECRET` | SECURITY | **CRITICAL** | Hardcoded credentials (AWS keys, JWT secrets, private tokens) | **Yes** (replaces with `process.env`) |
| `SEC-SQLI` | SECURITY | **CRITICAL** | Raw SQL queries with untrusted string concatenation/templates | No (Advisory only) |
| `SEC-EVAL` | SECURITY | **CRITICAL** | Direct execution of arbitrary code via `eval()` | No (Advisory only) |
| `SEC-FN-CTOR` | SECURITY | **HIGH** | Dynamic code compilation via the `Function` constructor | No (Advisory only) |
| `SEC-DANGEROUS-HTML` | SECURITY | **HIGH** | Potential Cross-Site Scripting (XSS) via `dangerouslySetInnerHTML` | No (Advisory only) |
| `COMP-HIGH` | COMPLEXITY | **HIGH** | Function cyclomatic complexity exceeding threshold (> 10) | No (Advisory only) |
| `COMP-NESTING` | COMPLEXITY | **HIGH** | Control-flow block nesting exceeding depth threshold (> 4) | No (Advisory only) |
| `REACT-HOOK-DEPS` | QUALITY | **HIGH** | Missing variables in React `useEffect` dependency array | **Yes** (appends missing dependencies) |
| `PERF-EFFECT-CLEANUP` | PERFORMANCE | **HIGH** | Missing event listener / timer cleanup inside `useEffect` | No (Advisory only) |
| `QUAL-EMPTY-CATCH` | QUALITY | **MEDIUM** | Empty `catch` blocks that silently swallow exceptions | No (Advisory only) |
| `QUAL-LENGTH` | QUALITY | **LOW** | Function length exceeding maintainability limit (> 50 lines) | No (Advisory only) |
| `QUAL-VAR` | QUALITY | **LOW** | Use of function-scoped `var` instead of block-scoped `let`/`const` | No (Advisory only) |
| `REACT-INDEX-KEY` | QUALITY | **LOW** | Array index used as React list `key` prop | No (Advisory only) |

---

## 7. Gemini AI Analysis

### Why Use Gemini?
Static AST rules are rigid: they excel at finding known patterns (like a regex match for an AWS key or checking if an effect array is empty), but they cannot understand application context.

Google Gemini is employed specifically for **contextual semantic reasoning**:
- Identifying subtle race conditions in React hooks.
- Catching business logic edge cases (e.g., negative balance checks, missing authorization branches).
- Detecting improper third-party library API usage.
- Explaining the "why" behind bugs in clear, developer-friendly language.

> *"Static analysis provides a deterministic baseline; Gemini adds contextual reasoning."*

To avoid redundancy, Gemini is provided with the list of already-detected static rule IDs and instructed to focus exclusively on complementary, high-value semantic findings.

---

## 8. Issue Validation & Deduplication

### Why Validate AI Output?
LLMs are probabilistic token generators. Without validation, an AI can hallucinate non-existent line numbers, suggest malformed replacement code, or produce invalid JSON.

CodeLens enforces a multi-tiered validation pipeline:
1. **Schema Validation**: Output must conform strictly to the JSON schema.
2. **Line Range Grounding**: Every issue's `line` and `lineEnd` must fall strictly within the source code's physical bounds ($1 \le \text{line} \le \text{totalLines}$).
3. **Verbatim Fix Verification**: If Gemini suggests an automated fix (`originalSnippet`), that exact string must exist verbatim in the source code within $\pm 5$ lines of the reported issue. If the snippet does not exist, the fix is safely stripped (`fix: null`), while the advisory text is preserved.
4. **Deduplication Policy**: When an AI finding and a static finding overlap on the same line or concern, the **static AST rule always wins**. Static findings cannot be displaced by AI output.

---

## 9. Scoring

CodeLens uses an **objective, deterministic scoring algorithm**. Gemini **never** calculates or overrides the final score.

### Score Formula
```text
Overall Score = max(0, min(100, 100 - sum(Issue Penalties)))
```

### Severity Deductions
- **CRITICAL**: -25 points
- **HIGH**: -15 points
- **MEDIUM**: -8 points
- **LOW**: -3 points

### AI Confidence Multipliers
AI findings are probabilistic; their penalties are scaled by the model's reported confidence score:
- Confidence $\ge 0.80$: 100% penalty (`basePenalty * 1.00`)
- Confidence $0.60 - 0.79$: 75% penalty (`basePenalty * 0.75`)
- Confidence $< 0.60$: 50% penalty (`basePenalty * 0.50`)

### Category Breakdown
Category scores (`security`, `quality`, `performance`, `complexity`) start at 100 and deduct penalties strictly for issues mapped to that category. If Babel encounters an unrecoverable syntax error, the overall score is set to 0.

---

## 10. Patch Safety

Automated code modification is safety-critical. CodeLens prevents code corruption through 10 safety checkpoints:

1. **SHA-256 Stale-Source Protection**: Client must provide `expectedCodeHash`. If the server's hash of the current source does not match, the patch is rejected (`409 STALE_SOURCE`).
2. **Allowed Source Check**: Issues must have a recognized source (`STATIC` or `AI`).
3. **Verbatim Existence**: The target `originalSnippet` must exist character-for-character in the source code.
4. **Uniqueness Enforcement**: The `originalSnippet` must occur **exactly once** in the entire file. If multiple matches exist, the patch is rejected (`MULTIPLE_MATCHES`) to prevent ambiguous edits.
5. **Line Range Verification**: The snippet must overlap with the issue's reported line range.
6. **Size Limits**: Replacement snippets cannot exceed 50 KB.
7. **AI Patch Thresholds**: AI-suggested fixes require confidence $\ge 0.80$, maximum 30-line replacement span, and verbatim match within $\pm 5$ lines.
8. **Pure Text Manipulation**: Patches are applied strictly via immutable string slicing—never via eval or code compilation.
9. **Automatic Re-Analysis**: The patched code is immediately re-audited by the static engine to verify the fix and catch newly introduced syntax or security issues.
10. **Human-in-the-Loop Confirmation**: Users inspect a visual diff modal showing exact removals and additions before confirming the patch.

---

## 11. Persistence & History

### MongoDB Storage
Completed review audits are stored as structured BSON documents in MongoDB via Mongoose. Stored data includes:
- `reviewId`: Unique deterministic identifier.
- `filename`, `language`, `code`: The complete reviewed source text.
- `codeHash`: Authoritative SHA-256 digest of the source text.
- `score` & `breakdown`: Authoritative quality scores.
- `metrics`: Exact lines, functions, branches, complexity, and nesting.
- `issues`: Canonical issues array.
- `metadata`: Engine mode (`static` or `hybrid`) and timestamps.

### Repository Abstraction & In-Memory Fallback
Business logic interacts strictly with the `reviewRepository` facade. If MongoDB Atlas is offline or unconfigured, the application seamlessly routes all queries to `memoryReviewRepository`. Audits remain fully accessible during the session without crashing.

### Immutable Review History
Every audit (initial reviews and post-patch re-reviews) receives a distinct `reviewId` and is saved as a separate, immutable record.
- Overwriting audits is prohibited.
- Preserves complete before/after audit trails for demonstration and compliance.
- Restoring historical audits in the UI updates the editor as pure text and marks the view with an amber Historical indicator.
- Any subsequent keystroke in the editor dismisses the badge and flags the review as `STALE`.

---

## 12. API Reference

All API routes return canonical JSON and sanitized errors.

| Method | Endpoint | Purpose | Key Request Fields | Key Response Fields | Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health probe & service status | None | `status`, `service`, `persistence`, `ai` | None |
| `GET` | `/api/rules` | Static rule catalog | None | `rules` (array of 13 rules) | None |
| `POST` | `/api/review` | Main hybrid code review pipeline | `code`, `language`, `filename` | `score`, `breakdown`, `metrics`, `issues`, `summary`, `metadata`, `reviewId` | `EMPTY_CODE`, `PAYLOAD_TOO_LARGE`, `UNSUPPORTED_LANGUAGE` |
| `POST` | `/api/review/ai` | Diagnostic AI-only review endpoint | `code`, `language`, `filename` | `issues`, `engine`, `aiStatus` | `EMPTY_CODE`, `PAYLOAD_TOO_LARGE` |
| `POST` | `/api/patch/verify` | Verify static patch candidate | `code`, `expectedCodeHash`, `issue` | `applicable`, `reason`, `diff`, `patchedCode` | `STALE_SOURCE`, `ORIGINAL_NOT_FOUND`, `MULTIPLE_MATCHES` |
| `POST` | `/api/patch/apply` | Apply static patch & re-analyze | `code`, `expectedCodeHash`, `issue` | `patchedCode`, `review`, `diff`, `reviewId`, `appliedIssueId` | `STALE_SOURCE`, `ORIGINAL_NOT_FOUND`, `INVALID_FIX` |
| `POST` | `/api/patch/verify-ai`| Verify AI patch candidate | `code`, `expectedCodeHash`, `issue` | `applicable`, `reason`, `diff`, `patchedCode` | `LOW_CONFIDENCE`, `SPAN_TOO_LARGE`, `STALE_SOURCE` |
| `POST` | `/api/patch/apply-ai` | Apply AI patch & re-analyze | `code`, `expectedCodeHash`, `issue` | `patchedCode`, `review`, `diff`, `reviewId`, `appliedIssueId` | `LOW_CONFIDENCE`, `ORIGINAL_NOT_FOUND`, `STALE_SOURCE` |
| `GET` | `/api/reviews` | Paginated review history | Query: `page`, `limit` | `reviews`, `pagination` (`page`, `limit`, `total`, `pages`) | `INVALID_PAGINATION` |
| `GET` | `/api/reviews/:reviewId`| Fetch full single review record | Param: `reviewId` | Full review object with verbatim `code` | `REVIEW_NOT_FOUND` |
| `DELETE`| `/api/reviews/:reviewId`| Delete a single review record | Param: `reviewId` | `success: true`, `deletedId` | `REVIEW_NOT_FOUND` |

---

## 13. Environment Variables

### Backend (`server/.env`)
```bash
cp server/.env.example server/.env
```

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | No | `5001` | Express backend port |
| `NODE_ENV` | No | `development` | Runtime environment (`development` or `production`) |
| `FRONTEND_ORIGIN` | Production | `http://localhost:5173` | Allowed frontend origin for CORS |
| `CLIENT_URL` | No | (alias) | Backward-compatible alias for `FRONTEND_ORIGIN` |
| `MONGODB_URI` | Optional | `""` | MongoDB connection URI (`mongodb+srv://...`) |
| `GEMINI_API_KEY` | Optional | `""` | Google Gemini API key (kept strictly backend-side) |
| `GEMINI_MODEL` | Optional | `gemini-2.5-flash` | Gemini model name |

### Frontend (`client/.env`)
```bash
cp client/.env.example client/.env
```

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Production | `http://localhost:5001` | Backend API URL without trailing slash |

> [!WARNING]
> Never put `GEMINI_API_KEY` or `MONGODB_URI` in `client/.env`. The client only communicates with the backend API.

---

## 14. Local Development

### Installation
```bash
npm run install:all
```

### Run Concurrently (Client + Server)
```bash
npm run dev
```
- Client runs on: `http://localhost:5173`
- Server runs on: `http://localhost:5001`

---

## 15. Testing

CodeLens is thoroughly verified by **671 automated tests across 13 test suites**, covering unit, integration, contract, failure mode, and deployment smoke scenarios:

```bash
# Run ALL 13 automated test suites
npm test

# Run individual test suites:
node server/test/analyzer.test.js     # 1. AST analyzer & 13 static rules (80 tests)
node server/test/gemini.test.js       # 2. Google Gemini prompt & guardrails (43 tests)
node server/test/hybrid.test.js       # 3. Dual-engine hybrid pipeline (39 tests)
node server/test/patch.test.js        # 4. Safe static patch & diff engine (60 tests)
node server/test/aiPatch.test.js      # 5. Verified AI patch preview & checks (34 tests)
node server/test/persistence.test.js  # 6. MongoDB & memory repository (36 tests)
node server/test/hashing.test.js      # 7. Single-authority SHA-256 hashing (28 tests)
node server/test/api.test.js          # 8. API endpoints & schema contracts (145 tests)
node server/test/e2e.test.js          # 9. 12-step end-to-end user workflow (54 tests)
node server/test/failures.test.js     # 10. Comprehensive failure modes A-K (40 tests)
node server/test/smoke.test.js        # 11. Production deployment smoke tests (34 tests)
node client/test/contract.test.js     # 12. Frontend contract & normalization (34 tests)
node client/test/history.test.js      # 13. Frontend history drawer & modals (44 tests)

# Run client production build
npm --prefix client run build
```

---

## 16. Deployment

CodeLens is configured for deployment across lightweight cloud providers suitable for project demonstrations:

- **Frontend**: [Vercel](https://vercel.com/) (React Single Page Application). Root directory: `client`, Build: `npm run build`, Output: `dist`. SPA rewrites configured in `client/vercel.json`.
- **Backend**: [Render](https://render.com/) (Node.js Web Service). Root directory: `server`, Build: `npm install`, Start: `npm start`. Blueprint provided in `render.yaml`. Health check probe: `/api/health`.
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (M0 Free Cluster). Add IP `0.0.0.0/0` in Network Access; set connection string as `MONGODB_URI` on Render.
- **AI Engine**: [Google AI Studio](https://aistudio.google.com/). Generate API key; set as `GEMINI_API_KEY` on Render.

### Local Production Simulation
```bash
# Terminal 1: Start backend in production mode
cd server
NODE_ENV=production PORT=5001 FRONTEND_ORIGIN=http://localhost:4173 npm start

# Terminal 2: Build and preview frontend
cd client
VITE_API_BASE_URL=http://localhost:5001 npm run build
npm run preview -- --port 4173
```

---

## 17. Security & Safety Model

- **Zero Untrusted Code Execution**: **CodeLens never executes, compiles, or runs submitted code.** Analysis is performed strictly via AST parsing and pure text inspection.
- **Backend-Only Secrets**: `GEMINI_API_KEY` and database credentials are held strictly in server environment variables.
- **Strict Production CORS**: Cross-Origin Resource Sharing is locked to `FRONTEND_ORIGIN`. Rogue origins receive HTTP 403 `CORS_FORBIDDEN`.
- **Sanitized Errors**: Database internals and raw exception stack traces are never exposed in API responses. Log output automatically masks passwords inside `MONGODB_URI`.
- **Stale-Source Protection**: SHA-256 hashes prevent applying patches to out-of-date or modified files.
- **Human-in-the-Loop Patching**: No code modification occurs without visual diff inspection and explicit user approval.
- **Security Headers**: Standard HTTP headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, and production `HSTS`) are enforced.

> [!NOTE]
> **Engineering Boundaries Notice**: CodeLens does not claim 100% vulnerability detection, formal semantic correctness of patches, or complete elimination of LLM hallucination. It provides practical, defensive boundaries around heuristic and probabilistic analysis.

---

## 18. Limitations

As an educational and single-user college project, CodeLens has clearly defined scope boundaries:
1. **Single-User Scope**: Does not feature multi-tenant authentication, user profiles, or role-based access control.
2. **Single-File Context**: Analyzes one JavaScript/JSX file at a time; inter-file dependencies and monorepo structures are out of scope.
3. **Probabilistic AI Nature**: Gemini findings are heuristic recommendations, not formal mathematical proofs.
4. **Render Free Tier Spin-Down**: Render free web services sleep after 15 minutes of inactivity, resulting in a 30–50 second cold-start delay on first request.
5. **In-Memory Storage Ephemerality**: If MongoDB is not connected, audit history persists only for the lifetime of the Node.js server process.

---

## 19. Future Enhancements

Potential future extensions outside the current college project scope:
- **GitHub Integration**: Direct GitHub App integration to post review comments on Pull Requests.
- **Multi-File Workspace Analysis**: Project-level dependency graphing and cross-file symbol tracing.
- **Authentication**: OAuth2 / GitHub login for persistent personal audit history.
- **Multi-Language Support**: AST parsers for TypeScript, Python, and Go.
- **AST-Aware Patch Replacement**: Semantic code restructuring using Babel generator rather than text replacement.

---

## Project Status

```text
Core functionality:      Complete
Testing:                 Complete (671 passing tests across 13 suites)
Deployment preparation:  Complete (Render, Vercel, Atlas configurations verified)
Documentation:           Complete (README, VIVA, DEMO, Walkthrough)
Authentication:          Out of scope (Single-user educational project)
Enterprise hardening:    Out of scope (College project tier)
```
