# DESIGN RESEARCH: Live Website Analysis & Translation

This research was conducted via live browser automation and DOM style extraction on [CodeRabbit](https://www.coderabbit.ai/) and [Linear](https://linear.app/).

---

## 1. CODERABBIT ANALYSIS

### Visual Principles Observed
- **Deep Obsidian Canvas**: Body background uses near-black graphite (`lab(4.93 1.26 -1.99)` ≈ `#08090A` / `#0C0D0E`), creating an authoritative, distraction-free environment where code and findings take center stage.
- **Controlled Brand Energy**: High-visibility warm orange/amber brand accent (`#FF5722` / `#F97316`) is used strictly for brand identity, primary CTA emphasis, and high-priority reviewer avatars, rather than splashed indiscriminately across cards.
- **Compact, Technical Radius System**: Buttons and badges use very tight corner radii (`4px` to `6px`), avoiding the bubbly `rounded-2xl` or pill-shaped aesthetic of generic consumer SaaS.
- **High-Density Information Layering**: Findings are presented as PR review cards directly docked with line numbers, severity indicators (`⚠️ Potential issue | 🔴 Major`), and unified diff boxes with high contrast syntax coloring.
- **Quiet, Precise Metadata**: File metadata, author, and timestamp are rendered in muted neutral gray (`#8A8F98` / `text-stone-400`), while code and headings pop in crisp `#F0F6FC`.

### Interaction Principles Observed
- **The Product Surface IS the Hero**: Rather than showing an abstract illustration or decorative mockups, the hero immediately presents a multi-tabbed review workbench (`01 Review every PR automatically`, `02 Prioritize`, `03 Understand`, `04 Secure`).
- **Contextual Line-Anchored Findings**: Every finding is directly mapped to a specific code file, line number, and commit diff.
- **Actionable Remediation**: Reviews do not stop at describing a problem; they immediately present a unified diff proposal (`-` red / `+` emerald) and an action trigger (`Review Change Stack →`).
- **Kinetic Problem Articulation**: Hero uses kinetic flip text to cycle through developer priorities: *"The future isn't writing code. It's reviewing it / securing it / prioritizing it."*

### Why It Works
- Developers trust tools that speak their visual language. CodeRabbit looks and behaves like an advanced GitHub PR review environment, reducing cognitive dissonance and eliminating any feeling of a "toy" or "student project."

### How CodeEagle Translates It
- **Obsidian Review Canvas**: Re-architect CodeEagle's entire color system to a graphite/obsidian dark canvas (`#090C10` code canvas, `#0D1117` base background, `#161B22` elevated panels).
- **Orange/Amber Purposeful Accents**: Use CodeEagle's amber/orange palette (`#F97316` / `#EA580C`) strictly for primary CTAs (`Run Review`, `Start Reviewing`, `Apply Fix`) and active queue highlights.
- **Interactive Workbench Hero**: The hero on the landing page is not a static screenshot; it is a live, interactive review workbench where visitors can inspect a real finding on `auth.js:6`, expand the recommendation, toggle the unified diff, and trigger patch application.
- **Senior PR Review Card**: Format the review findings panel as a senior staff engineer review comment, complete with "Why this matters", "Recommendation", syntax-highlighted unified diff, and verified fix CTA.

### How CodeEagle Must Differ
- **Zero Fake Repositories/PRs**: CodeRabbit reviews GitHub/GitLab PRs across repositories. CodeEagle specializes in immediate, zero-friction single-file JavaScript/JSX audits. CodeEagle must not pretend to have multi-file PR stacks, repo activity feeds, or git branch graphs.
- **Instant Interactive In-Memory Patch Loop**: CodeRabbit posts comments to GitHub PRs. CodeEagle possesses a unique superpower: an instant deterministic AST patch engine that actually applies the diff to the live editor code, re-analyzes with SHA-256 validation, and visibly increments the audit score in real time.

---

## 2. LINEAR ANALYSIS

### Visual Principles Observed
- **Extreme Visual Restraint**: Background `#08090A` with typography hierarchy in crisp `#F7F8F8` (headings at 64px, weight 510, tight letter-spacing) and muted secondary labels in `#8A8F98`.
- **Deliberate Negative Space & Rhythm**: Generous vertical pacing between editorial sections (each feature block averages 1,220px to 1,230px in height), giving complex tooling space to breathe.
- **Crisp Structural Borders**: Panels use subtle 1px border dividers (`rgba(255, 255, 255, 0.08)` / `#21262D`) instead of heavy dropshadows or thick glowing outlines.
- **Editorial Typography Scale**: Hero titles are confident and large, but application UI is compact, precise, and highly legible.

### Interaction Principles Observed
- **Speed and Density**: Navigation and controls are engineered for immediate responsiveness. No sluggish fade-ins or distracting 3D decorations.
- **Keyboard-First Ergonomics**: Linear relies heavily on keyboard shortcuts for power workflows.
- **Storytelling via Product Architecture**: Sections follow a clear narrative: Intake → Planning → Automation → Build & Ship.

### Why It Works
- Linear achieves its legendary craft floor by treating the user as an expert. The interface never talks down to the user, avoids decorative fluff, and feels like precision surgical equipment.

### How CodeEagle Translates It
- **Restrained Editorial Hierarchy**: Replace the generic centered SaaS hero with an editorial layout featuring sharp typography, clear section pacing, and high-contrast primary actions.
- **Architectural Storytelling**: Guide the visitor through a clear narrative:
  1. The Problem (unreviewed code ships bugs)
  2. The Detection Pipeline (AST parser + Gemini reasoning)
  3. The Finding (line-grounded risk explanation)
  4. The Solution (SHA-256 verified patch)
  5. The Verdict (re-analysis and audit score improvement)
- **Keyboard Affordances**: Prominently display keyboard shortcuts (`⌘+Enter` to review, `1`/`2`/`3` for review lenses, `J`/`K` for findings triage).

### How CodeEagle Must Differ
- **Focus on Code Triage rather than Project Management**: Linear is an issue tracker with Kanban boards and cycles. CodeEagle is a developer code review workbench. Our density must focus on Monaco/code readability, line numbers, gutter severity markers, and unified diff syntax highlighting.

---

## 3. CODEEAGLE TRANSLATION & UNIFIED SYNTHESIS

| Attribute | CodeRabbit Reference | Linear Reference | CodeEagle Implementation |
|---|---|---|---|
| **Canvas & Theme** | Dark graphite (`#08090A`), code dark | Dark obsidian (`#08090A`), subtle borders | **Deep Graphite Theme** (`#090C10` code, `#0D1117` base, `#161B22` panels) |
| **Brand Accent** | Orange (`#FF5722`) on logo & bot avatar | Neutral off-white / monochrome | **Amber / Orange Accent** (`#F97316` / `#FB923C`) for primary CTAs and active rails |
| **Typography** | Geist Sans, compact technical | Inter Variable, editorial 64px hero | **Outfit** (editorial headlines) + **Geist/Inter** (application UI) + **Monospace** (code) |
| **Radius Strategy** | Sharp 4px - 6px radius on buttons | 4px on badges, pill on pills | **Intentional Hierarchy**: 4px buttons/tags, 6px cards, 8px outer shell |
| **Hero Experience** | PR review tab cards | Staggered editorial showcase | **Kinetic Headline + Interactive Live Workbench** with instant patch simulation |
| **Review Hierarchy** | PR comment with inline diff | Issue list with priority badges | **3-Column Triage Cockpit**: Queue Rail ↔ Code Canvas with Gutter Pips ↔ Senior PR Comment Panel |
| **Fix Flow** | External Git push | Keyboard-driven triage | **1-Click Verified In-Memory Patch Engine** with SHA-256 hash guard and automated score re-audit |

### Core Anti-Patterns Strictly Banned
1. No white or light-gray SaaS dashboard backgrounds.
2. No purple/cyan AI gradients, glowing blobs, or neon cyberpunk highlights.
3. No fake repository statistics, fake GitHub stars, fake user testimonials, or fake CI checks.
4. No giant pill buttons or low-contrast ghost buttons for primary actions.
5. No clipping or hiding of the primary `[ Apply Fix ]` or `[ Run Review ]` buttons.
