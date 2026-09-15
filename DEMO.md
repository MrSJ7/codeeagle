# CodeLens — Live Demonstration Script & Viva Walkthrough 🎬

This document outlines a 3–5 minute live demonstration sequence for presentations, evaluation panels, and viva voce examiners.

---

## ⏱️ Live Demo Sequence (3–5 Minutes)

### Step 1: Launch & Layout Overview (30s)
1. Open the application in your browser (`http://localhost:5173` or your production Vercel URL).
2. **Spoken**: *"CodeLens is a dual-engine automated code reviewer. The interface has two primary panes: on the left is the code editor with syntax support and preset loaders; on the right is the real-time review panel showing the quality score, category breakdown, deterministic AST metrics, and canonical findings."*

### Step 2: Load Insecure Preset (20s)
1. In the **Presets** dropdown, select **"Insecure Login"**.
2. Point out the loaded Express endpoint containing a hardcoded JWT secret (`JWT_SECRET = '...'`) and an unescaped SQL query string.
3. **Spoken**: *"This sample endpoint contains both a deterministic secret vulnerability and an unsafe SQL string concatenation."*

### Step 3: Run Audit (30s)
1. Click the blue **"Run Audit"** button in the navbar.
2. Show the loading spinner and completion state.
3. **Spoken**: *"The backend receives the code without executing it. It parses the code into an AST with Babel, checks 13 deterministic static rules, queries Google Gemini for contextual reasoning, and calculates an objective score."*

### Step 4: Explain Scores & Findings (45s)
1. Point to the **ScoreCard**:
   - Overall Score (e.g., 75/100).
   - Category Breakdown (Security: 75, Quality: 100, Performance: 100, Complexity: 100).
2. Point to the **MetricsPanel**:
   - Lines of code, function count, branch count, cyclomatic complexity, max nesting depth.
3. Point to the **IssuePanel**:
   - Show the `CRITICAL` issue: `SEC-SECRET` (Hardcoded credential).
   - Point to the badge: `STATIC` badge (indicating it was flagged by deterministic AST analysis).
   - If Gemini is active: point to any `AI` badged finding (indicating semantic reasoning).
4. **Spoken**: *"Notice that static findings and AI findings are unified into a canonical issue model. Static findings always take precedence to eliminate duplicate noise."*

### Step 5: Fix Preview & Safe Patching (45s)
1. Click on the `SEC-SECRET` issue card to expand it.
2. Click **"Preview Fix"**.
3. Point to the **PatchPreview Modal**:
   - Show the unified visual diff: red removal (`JWT_SECRET = '...'`), green replacement (`JWT_SECRET = process.env.JWT_SECRET;`).
   - Point to the safety indicators: Target line numbers, SHA-256 code hash verification.
4. **Spoken**: *"Before touching the code, CodeLens verifies that the target snippet exists verbatim, occurs exactly once, matches the expected lines, and that the source code has not become stale."*
5. Click **"Apply Patch"**.

### Step 6: Post-Patch Re-Analysis & Score Diff (30s)
1. Show the **PatchDiffBanner**:
   - Shows before/after comparison: Score improved from `75` $\to$ `100` (+25 points).
   - Highlights: `1 Resolved Issue: SEC-SECRET`.
2. Notice the editor code has been cleanly updated with `process.env.JWT_SECRET`.
3. **Spoken**: *"Applying a patch triggers automatic server re-analysis. This guarantees that the issue was actually fixed and that the replacement did not introduce syntax errors or regressions."*

### Step 7: Review History & Immutability (30s)
1. Click the **"History"** button in the navbar to open the drawer.
2. Show the history items:
   - Audit #1: Score 75 (Initial submission).
   - Audit #2: Score 100 (Post-patch re-audit).
3. Click on the initial audit (#1) to demonstrate **Historical Audit Restoration**:
   - Notice the amber badge: *"Viewing Historical Audit"*.
   - Original score 75 and issue are restored without re-calling the API.
4. **Spoken**: *"Audits are immutable. CodeLens preserves both pre-patch and post-patch states for traceability and audit compliance."*

### Step 8: Stale State & Fallback Resilience (30s)
1. Make any small edit in the editor (e.g., add a comment `// modified`).
2. Point out that the historical badge dismisses and the review state switches to **STALE**.
3. **Spoken**: *"If the developer modifies code in the editor, CodeLens immediately flags the active review as stale, preventing stale patch attempts."*
4. **Closing Statement**: *"Under the hood, CodeLens stores audits in MongoDB with an automatic in-memory fallback, runs zero untrusted code, and keeps all AI API keys strictly server-side."*

---

## 🛡️ Demo Backup Plan: If Gemini Is Unavailable (Section 19)

Network dropouts, firewall blocks, or expired API keys should **never** break your viva demonstration.

### Backup Strategy
1. **Zero-Crash Behavior**: If `GEMINI_API_KEY` is not set or Google Gemini is unreachable, CodeLens automatically runs in 100% deterministic static mode.
2. **What Still Works Flawlessly**:
   - Complete AST parsing (`@babel/parser`).
   - Cyclomatic complexity & nesting depth metrics.
   - All 13 static security & quality rules (`SEC-SECRET`, `SEC-SQLI`, `SEC-EVAL`, etc.).
   - Deterministic base-100 scoring.
   - SHA-256 stale-source verification.
   - Safe static patch application.
   - Automated re-analysis and before/after score diffing.
   - MongoDB persistence & in-memory fallback.
   - Complete audit history drawer.

### Spoken Pivot during Viva
If the examiner asks why an AI finding is not appearing, or if network connectivity is down:
> *"CodeLens is intentionally architected with self-healing graceful degradation. Google Gemini is an optional semantic enhancement, not a single point of failure. Because the deterministic static engine is completely self-contained with Babel AST analysis, the entire review, scoring, safe patching, and persistence pipeline operates with 100% reliability even when external cloud AI services are offline."*
