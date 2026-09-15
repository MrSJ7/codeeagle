---
name: CodeEagle
description: AI Code Review platform pairing deterministic AST safety with contextual semantic reasoning
colors:
  primary: "#10B981"
  primary-hover: "#059669"
  primary-tint: "rgba(16, 185, 129, 0.12)"
  teal-secondary: "#0D9488"
  cyan-accent: "#38BDF8"
  shell: "#0A0D12"
  surface: "#111620"
  surface-elevated: "#161E2B"
  surface-raised: "#1E2838"
  border-subtle: "#1E2636"
  border-strong: "#2D394E"
  code-bg: "#0D1117"
  code-gutter: "#090D12"
  code-text: "#E6EDF3"
  code-border: "#1E2636"
  severity-critical: "#EF4444"
  severity-high: "#F97316"
  severity-medium: "#FBBF24"
  severity-low: "#38BDF8"
typography:
  display:
    fontFamily: "Outfit, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Outfit, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Outfit, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Outfit, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Outfit, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#0A0D12"
    rounded: "{rounded.lg}"
    padding: "6px 14px"
  card-surface:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "16px 20px"
---

# Design System: CodeEagle

## Overview

**Creative North Star: "The Precision Cockpit"**

CodeEagle is designed as an authoritative, high-density developer instrument. It avoids the visual cliches of generic AI dashboards—such as neon gradients, animated robot mascots, floating card chaos, and low-density bubbly cards—in favor of the disciplined restraint of premier developer tooling like GitHub Pull Request reviews, Raycast, and Linear.

The interface is built around a unified **Deep Graphite Architecture**: an immersive, dark root canvas (`#0A0D12`) housing elevated graphite containers (`#111620`, `#161E2B`), paired with high-contrast code surfaces (`#0D1117`).

**Key Characteristics:**
- **High Information Density**: UI chrome is compact (44px workspace header, 36px summary toolbar), prioritizing code visibility and multi-column scanability.
- **Luminous Emerald & Restrained Palette**: Rich emerald (`#10B981`) is reserved strictly for primary execution and verified health states; warnings and severities speak with restrained, authoritative tones.
- **Micro-Precision Borders**: 1px hairline borders (`#1E2636`, `#2D394E`) create structure without heavy drop shadows.
- **Dual Typography**: `Outfit` handles UI navigation, labels, and analytical prose, while `JetBrains Mono` governs code blocks, line numbers, hashes, and quantitative metrics.

## Colors

CodeEagle utilizes a focused palette pairing an emerald brand anchor with semantic severity scales and deep graphite surfaces.

### Primary
- **Emerald Brand** (`#10B981`): Primary action triggers (Run Review, Apply Verified Patch), healthy status indicators (Score 80–100), and confirmed badges.
- **Emerald Hover** (`#059669`): Deepened hover state for interactive primary buttons.
- **Emerald Tint** (`rgba(16, 185, 129, 0.12)`): Subtle background fill for active selection tabs, status pills, and verified patch tags.
- **Teal Secondary** (`#0D9488`): Secondary highlights and semantic context tags.
- **Cyan Accent** (`#38BDF8`): AST rule identifiers and quantitative metrics.

### Neutral & Surfaces
- **App Shell** (`#0A0D12`): Neutral background canvas for the root application shell and landing page backdrop.
- **Elevated Surface** (`#111620`): Panel surfaces, review finding containers, and modal bodies.
- **Raised Surface** (`#161E2B`): Active cards, navigation bars, and headers.
- **Hairline Border** (`#1E2636`): Structural boundary for surface divisions.
- **Primary Text** (`#F1F5F9`): High-contrast off-white for primary headings and body copy.
- **Muted Text** (`#64748B`): Secondary captions, timestamps, and column labels.

### Code Canvas
- **Code Background** (`#0D1117`): Deep carbon surface for the code editor and diff viewers.
- **Code Gutter** (`#090D12`): Darkened baseline gutter housing line numbers.
- **Code Foreground** (`#E6EDF3`): Crisp off-white text ensuring high legibility without eye strain.
- **Code Border** (`#1E2636`): Hairline boundary separating editor panels and diff columns.
### Severity Scale
- **Critical** (`#EF4444`): Severe security vulnerabilities (SQL injection, `eval()`, prototype pollution).
- **High** (`#F97316`): Direct runtime risks (memory leaks, unhandled rejections).
- **Medium** (`#FBBF24`): Code smells, missing hook dependencies, and moderate logic hazards.
- **Low** (`#38BDF8`): Style, minor maintainability observations, and optimization suggestions.

### Named Rules
**The Dual-Canvas Rule.** Code is always rendered on dark carbon surfaces (`#171A19`); analytical commentary, review findings, and administrative controls are always rendered on light mineral surfaces (`#FFFFFF` on `#F5F7F6`). Neither canvas invades the other.

**The Rarity Rule.** Emerald primary green (`#0F9F6E`) is applied to less than 5% of any view. Its visual energy is saved for moments of action (running a review) and resolution (successful patch verification).

**The Semantic Severity Rule.** Severity colors are strictly reserved for diagnostic findings and score badges. Never use red or orange for brand accents, decorative borders, or arbitrary icons.

## Typography

**Display Font:** Inter (with `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif` fallbacks)
**Body Font:** Inter
**Code & Metrics Font:** JetBrains Mono (with `ui-monospace`, `SFMono-Regular`, `Menlo`, `Consolas`, `monospace` fallbacks)

**Character:** Technical, crisp, and neutral. Inter provides maximum legibility at compact sizes (11px–13px) for dense analytical data, while JetBrains Mono ensures precise character alignment in code blocks and tabular score displays.

### Hierarchy
- **Display** (Bold 700, `clamp(2rem, 4vw, 3rem)`, line-height 1.15, letter-spacing `-0.025em`): Landing page hero headline.
- **Headline** (Semibold 600, `1.5rem` / 24px, line-height 1.25, letter-spacing `-0.015em`): Feature pillar titles, section headers.
- **Title** (Semibold 600, `1rem` / 16px, line-height 1.3): Modal headers, drawer titles, finding rule names.
- **Body** (Regular 400, `0.875rem` / 14px, line-height 1.5): Finding descriptions, rationale explanations, explanatory text.
- **Label / Micro** (Medium 500, `0.75rem` / 12px or `0.6875rem` / 11px, uppercase letter-spacing `0.05em`): Severity badges, engine tags (`AST`, `AI`), category chips.
- **Code / Tabular** (Regular 400 or Medium 500, `0.8125rem` / 13px, line-height 1.6): Source code lines, diff viewers, numeric scores, SHA-256 hashes.

### Named Rules
**The Code-Only Monospace Rule.** Monospace typography (`JetBrains Mono`) is strictly confined to physical source code, line numbers, file names, commit hashes, and quantitative metrics. Explanations, review rationale, and user guidance must remain in `Inter`.

**The Tabular Numbers Rule.** All numerical indicators (overall scores, subcategory points, finding counts, line ranges) must render with tabular figures (`font-variant-numeric: tabular-nums`) to prevent layout jitter during re-audits.

## Layout

CodeEagle employs a split-pane, high-density layout designed to mirror professional IDE pull request review environments.

- **Global Shell**: Fixed 48px header at top, full viewport height without page scrolling in review mode (`overflow-hidden`).
- **Workspace Split**: 
  - **Left Pane (55%–60%)**: Dark Code Editor with line gutter, editable textarea, and subtle inline issue highlights.
  - **Right Pane (40%–45%)**: Light Review Rail housing the sticky Summary Bar, category filters, and scrollable Findings feed.
- **Sticky Summary Bar**: 40px compact toolbar anchoring the overall score (e.g. `78/100`), category sub-scores (Security, Quality, Performance, Maintainability), and severity filter buttons.
- **Responsive Stacking**: Below 1024px (`lg`), the split workspace transforms into a tabbed interface allowing instant switching between "Code View" and "Findings View" without layout breakage.
- **Spacing Rhythm**: Standard 4px baseline grid (`4px`, `8px`, `12px`, `16px`, `24px`). Padding in cards is restrained to 12px–16px to maintain high information density.

## Elevation & Depth

CodeEagle relies on **tonal layering and hairline borders** rather than diffuse drop shadows.

- **Flat-by-Default**: Cards, panels, and toolbars sit flat on the mineral shell canvas with zero resting shadow.
- **Hairline Boundaries**: Spatial separation is achieved via `1px solid #E7E5E4` (light) and `1px solid #242826` (code).
- **Depth Layers**:
  - `z-0`: Background mineral canvas (`#F5F7F6`).
  - `z-10`: Interactive editor surface and finding cards.
  - `z-20`: Sticky navigation header and summary toolbar.
  - `z-40`: Review History slide-out drawer with semi-transparent backdrop (`rgba(0,0,0,0.3)`).
  - `z-50`: Unified Patch Preview modal and keyboard shortcut overlays.

### Named Rules
**The Hairline Border Rule.** Surfaces are separated by crisp 1px borders, never by blurry drop shadows. Shadows appear only on elevated floating overlays (modals and slide-out drawers) to denote modal capture.

## Shapes

- **Base Radius**: 6px (`rounded-md`) for buttons, text inputs, and select dropdowns.
- **Pill Badges**: 4px (`rounded`) for severity tags (`CRITICAL`, `HIGH`) and engine chips (`AST`, `AI`).
- **Card Containers**: 8px (`rounded-lg`) or 12px (`rounded-xl`) for finding cards, preset pickers, and modal windows.
- **Strict Geometric Restraint**: Circular shapes are restricted to status indicator dots (AI connection dot, severity pips) and avatar initials. No organic, asymmetrical blobs.

## Components

### 1. Navigation Header (`Navbar.jsx`)
- **Structure**: 48px height, white background, hairline bottom border.
- **Brand Mark**: CodeEagle geometric eagle silhouette SVG with "CodeEagle" wordmark and "AI Code Review" badge.
- **Mode Switcher**: Segmented toggle between "Product" (Landing page), "Review" (Active workspace), and "History" drawer.
- **Engine Status Indicator**: Live indicator showing `Static` (gray dot) or `AI` (emerald dot) based on backend Gemini configuration.
- **Primary CTA**: "Run Review" button with emerald fill (`#0F9F6E`), transition hover to `#087A54`, with loading spinner during audit.

### 2. Summary Bar (`ReviewSummary.jsx`)
- **Score Display**: Circular or badge score container colored by health grade (Green $\ge 80$, Yellow $60-79$, Orange $40-59$, Red $<40$).
- **Category Chips**: Security, Quality, Performance, Maintainability with individual point meters.
- **Quick Filters**: Clickable severity filter pills (`Critical`, `High`, `Medium`, `Low`) with live counts.

### 3. Finding Card / PR Review Comment (`IssueDetails.jsx` & `IssuePanel.jsx`)
- **Container**: White surface with 1px stone border, left border accented with the issue severity color.
- **Header**: Line number badge (e.g. `L14-L18`), rule name, severity badge, and engine source chip (`AST` in indigo tint, `AI` in violet tint).
- **Body**: Authoritative explanation of the bug, security vector, or performance hazard.
- **Collapsible Code Snippet**: Collapsible block showing the offending original code lines.
- **Remediation Action**: "Preview Fix" / "Apply Patch" button with green tint (`#DDF7EC`), opening the verified diff preview.

### 4. Code Editor (`CodeEditor.jsx`)
- **Container**: Dark carbon background (`#171A19`), 1px dark border (`#242826`).
- **Gutter**: `#121514` background, right border, muted line numbers (`#5E6963`).
- **Active Markers**: Subtle background tint on lines flagged with findings, matching the highest severity present on that line.
- **Scrollbars**: Custom slim dark scrollbars (`6px` width, thumb `#2D3330`, hover `#3F4743`).

### 5. Patch Preview Modal (`PatchPreview.jsx`)
- **Modal Shell**: Centered dialog on dark backdrop (`z-50`), white container with rounded corners (12px).
- **Safety Header**: Cryptographic safety badge confirming SHA-256 hash match, source line verification, and single-occurrence check.
- **Visual Diff**: Side-by-side or unified diff rendering original code (red highlight `#FEE2E2` / text `#991B1B`) and patched replacement (green highlight `#DCFCE7` / text `#166534`).
- **Actions**: "Cancel" secondary button and "Apply Patch & Re-Analyze" primary action button.

### 6. Post-Patch Diff Banner (`PatchDiffBanner.jsx`)
- **Notification**: Appears at top of workspace following patch application.
- **Delta Meter**: Displays score improvement (e.g. `+14 points: 64 → 78`), resolved issue count, and confirmation of zero regressions.

### 7. History Drawer (`ReviewHistoryDrawer.jsx`)
- **Panel**: Slide-out drawer from right edge (`z-40`, 380px width), white background, hairline border.
- **Item Cards**: Chronological audit entries with timestamp, filename, score delta, and "Inspect Audit" action.

### 8. Landing Page Hero & Showcase (`LandingPage.jsx`)
- **Hero**: Clean, authoritative headline ("Deterministic Code Review with Contextual AI Intelligence"), primary CTA ("Start Reviewing"), and interactive preset scenario selector.
- **Architecture Showcase**: Interactive terminal displaying the dual-engine pipeline and 13 AST static analyzers.
- **Comparison Table**: Objective feature breakdown contrasting CodeEagle against standard linters and generic LLM chatbots.

## Do's and Don'ts

### Do:
- **Do** maintain the strict Dual-Canvas distinction: dark `#171A19` for code inspection, light `#FFFFFF` on `#F5F7F6` for review analysis.
- **Do** display engine source chips (`AST` vs `AI`) on every finding card to make provenance explicit.
- **Do** use `JetBrains Mono` for all line numbers, file names, metrics, and code snippets.
- **Do** keep line numbers clickable, smoothly scrolling and focusing the editor to the exact offending line.
- **Do** provide instant feedback when code edits make existing analysis results stale (displaying "Re-run Review" warning state).
- **Do** enforce single-file focus and compact density so developers can audit without scrolling through endless whitespace.

### Don't:
- **Don't** use neon gradients, playful emojis, or conversational chatbot dialog balloons in review findings.
- **Don't** show ungrounded patches or raw LLM completions without SHA-256 validation and line verification.
- **Don't** hide deterministic AST static analysis behind a generic "AI thinking" spinner.
- **Don't** use Monaco editor or heavy browser-side LSP bundles that degrade initial page load performance.
- **Don't** use low-contrast text (ensure all secondary labels maintain at least WCAG AA 4.5:1 contrast ratio against backgrounds).
- **Don't** invent fake user testimonials or enterprise customer logos.
