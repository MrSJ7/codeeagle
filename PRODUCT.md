# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are software engineers, engineering team leads, security auditors, and full-stack JavaScript/TypeScript developers. They arrive in high-stakes situations: reviewing code before submitting a Pull Request, auditing unfamiliar code, or hunting down subtle security vulnerabilities and performance leaks. Their primary job is to rapidly understand code health, identify latent security and logic defects with high confidence, and remediate issues through verified, regression-free patches without context switching.

## Product Purpose

CodeEagle bridges the divide between brittle static linters and hallucinatory generative AI. Linters lack semantic context and fail to identify subtle logic flaws, state bugs, or security attack vectors. Conversely, pure LLM chat interfaces hallucinate non-existent line numbers, produce non-deterministic quality scores, and suggest unsafe code modifications that introduce new bugs.

CodeEagle provides a professional, dual-engine review environment: deterministic Babel AST static analysis establishes an unshakeable baseline of code facts, while Google Gemini semantic reasoning diagnoses complex logic bugs and architectural antipatterns. Success is measured by developer trust: zero false line citations, mathematically reproducible quality scores, cryptographic patch safety, and instant post-patch verification.

## Positioning

Unlike generic AI code assistants and conversational chatbots, CodeEagle enforces an authoritative **Deterministic Ground Truth Priority**:
1. Deterministic AST rules always supersede AI findings on duplicate lines.
2. AI-reported line numbers are strictly clamped and validated against actual physical source lines.
3. Code patches are mathematically grounded: a patch requires verbatim snippet matching, single-occurrence enforcement, and cryptographic SHA-256 stale-source verification.
4. Applying a patch immediately triggers an authoritative server-side re-audit to verify resolution and ensure zero regressions.

Neighboring products cannot truthfully claim this level of deterministic safety because they rely entirely on ungrounded LLM completions or standard regex matching.

## Operating Context

CodeEagle operates as a standalone web-based developer tool. Developers paste single JavaScript or JSX files (up to 150 KB) or load standard reference presets. Reviews run against an Express backend orchestrating `@babel/parser` and `@google/genai`. 

Audits persist in MongoDB Atlas or gracefully fallback to an in-memory repository if the database is absent, enabling pre-patch and post-patch side-by-side audit history tracking. Developers use CodeEagle directly in their browsers alongside their terminal, IDE, and pull request review workflows.

## Capabilities and Constraints

### Core Capabilities
- **Dual-Engine Analysis Pipeline**: Deterministic Babel AST analysis runs concurrently with Google Gemini 2.5 Flash semantic analysis.
- **13 Built-in Deterministic Rules**: SQL injection, hardcoded secrets/tokens, `eval()`, prototype pollution, insecure `Math.random()`, unhandled promise rejections, React missing `useEffect` dependencies, uncleaned timer memory leaks, excessive function arguments, and complex control-flow nesting.
- **AST Metrics Extraction**: Real-time extraction of Lines of Code (LOC), function count, branch count, Cyclomatic Complexity, and max nesting depth.
- **Defensive AI Guardrails**: Strict JSON schema validation (`responseSchema`), line number bounds checking, duplicate deduplication, and markdown sanitization.
- **Deterministic Quality Scoring**: Mathematically calculated overall score (0–100) and 4 category grades (Security, Quality, Performance, Maintainability) based on weighted issue severity.
- **Cryptographic Patch Verification**: SHA-256 hash matching, verbatim search snippet verification, single-occurrence validation, and unified visual diff modal.
- **Automated Post-Patch Re-Analysis**: Server-side re-audit verifies issue resolution and updates audit history.
- **Auditable History Drawer**: Slide-out audit ledger tracking all reviews, score deltas, applied patches, and timestamps.

### Technical Constraints
- **Scope**: Single-file review scope only (JavaScript and JSX syntax; TypeScript supported via standard JSX/ECMAScript Babel parsing).
- **Size Limit**: Enforced 150 KB payload size limit.
- **Zero Execution**: The server NEVER executes submitted user code; all static analysis is performed purely on AST representations.
- **Authentication**: No user accounts or authentication required; sessions operate ephemerally with MongoDB or in-memory persistence.
- **Network Resilience**: If the Google Gemini API is unconfigured or unreachable, the system automatically falls back to full deterministic AST static analysis without degrading reliability.

## Brand Commitments

- **Product Name**: **CodeEagle — AI Code Review** (the legacy moniker "CodeLens" is permanently retired from all user-facing branding).
- **Visual Identity**: Professional developer instrument. Light mineral workspace shell (`#F5F7F6`), stark dark code editor canvas (`#171A19`), hairline stone borders (`#E7E5E4`), and authoritative emerald brand accents (`#0F9F6E`).
- **Brand Voice**: Precise, calm, authoritative, high-density, and respectful of developer time. No corporate fluff, no conversational AI cheerleading, no synthetic hype.

## Evidence on Hand

- Fully functional React 18 + Vite frontend and Node.js + Express backend in `/scratch/code-reviewer`.
- Comprehensive automated test suite with **671 tests passing at 100%** across static analyzers, patch verifiers, repository fallbacks, and UI components.
- Real-world vulnerability presets (`authMiddleware.js`, `UserProfile.jsx`, `orderProcessor.js`) demonstrating SQL injection, React memory leaks, and nested complexity.
- Production deployment configuration (`render.yaml` for Express REST API, `vercel.json` for React SPA).
- Note: Zero fabricated customer logos, synthetic user testimonials, or artificial benchmark claims.

## Product Principles

1. **Deterministic Truth Supersedes Prediction**: When an AST rule and an AI model both evaluate the same line, the deterministic AST rule is the absolute authority.
2. **Never Propose an Ungrounded Patch**: Suggested fixes must include verbatim original code snippets that exist exactly once in the source file. No ambiguous replacements.
3. **Always Verify Mutations**: A code patch is not complete when applied; it is only complete when an automated post-patch re-audit confirms the issue is resolved without introducing regressions.
4. **Information Density Over Decoration**: Provide dense, scannable findings, collapsible line context, explicit severity indicators, and zero decorative animations that slow down professional workflows.
5. **Fail-Safe Operation**: If external AI services or databases are down, the tool must function reliably as an offline-first AST linter and metric analyzer.

## Accessibility & Inclusion

- Adherence to WCAG 2.1 AA standards for color contrast across both light surface backgrounds and the dark code editor canvas.
- Full keyboard operability for navigation, code editing, issue selection, diff modal inspection, and patch execution.
- Visible, high-contrast focus rings (`focus-visible:ring-2`) on all interactive controls.
- Complete ARIA labelling on icons, buttons, drawers, modals, and severity status badges.
- Strict support for `prefers-reduced-motion` with global CSS animation overrides.
