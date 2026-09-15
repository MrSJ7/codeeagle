# CODEEAGLE DESIGN & ENGINEERING BLUEPRINT

**Brand**: CodeEagle  
**Descriptor**: AI Code Review  
**Product Vision**: Sharp, authoritative, distraction-free code review workbench that catches critical flaws before they ship.  
**Canvas Archetype**: Premium Deep Graphite / Obsidian with High-Contrast Warm Off-White Typography and Purposeful Amber/Orange Brand Accents.

---

## A. Design Philosophy
- **Developer-First Functionalism**: The interface exists to make code issues legible, explainable, and remediable within seconds. UI elements that do not aid in understanding, navigating, or fixing code are eliminated.
- **Progressive Density**: The user is never assaulted with a chaotic wall of cards. Triage proceeds logically: Executive Verdict → Ranked Blockers → Gutter Anchored Code → Senior PR Review Comment → Unified Diff → Verified Patch Execution.
- **Truth in Capabilities**: Grounded exclusively in real capabilities (Babel AST traversal, 13 deterministic security/quality/complexity rules, Gemini contextual reasoning, single-authority SHA-256 hash validation, safe string mutation, and audit persistence). Zero fake repository metrics, fake PR stacks, or invented stats.

---

## B. Brand Identity
- **Logo Integrity**: Official eagle emblem preserved exactly (`client/public/codeeagle-logo.png`).
- **Brand Personality**: Sharp, precise, technical, confident, fast, trustworthy, and subtly aggressive.
- **The Eagle Metaphor**: "Sharp eyes that catch what developers miss." Clean geometric lines, razor precision, high vigilance.
- **Descriptor**: `AI CODE REVIEW` rendered in tight, technical tracked uppercase (`text-[10px] tracking-wider font-semibold text-stone-400`).

---

## C. Color Tokens

### 1. Canvas & Surface Hierarchy
- `bg-base` / `canvas-root`: `#08090A` (Deepest obsidian background, matching CodeRabbit & Linear foundations)
- `bg-code` / `canvas-editor`: `#0D1117` (GitHub/Monaco dark code surface)
- `bg-gutter`: `#090C10` (Recessed line-number gutter)
- `bg-surface-1` / `panel-base`: `#161B22` (Secondary panels, rail background, headers)
- `bg-surface-2` / `panel-elevated`: `#21262D` (Active cards, popovers, dropdowns, code chips)
- `bg-surface-hover`: `#262C36` (Row hover states)

### 2. Typography & Contrast Hierarchy
- `text-primary`: `#F0F6FC` (Warm crisp off-white for code, primary headings, diff additions)
- `text-secondary`: `#C9D1D9` (Secondary headings, explanation copy, rule names)
- `text-muted`: `#8B949E` (Gutter line numbers, file metadata, timestamps, shortcuts)
- `text-faint`: `#484F58` (Dividers, disabled states, subtle hints)

### 3. Brand & Accent Tokens
- `brand-primary`: `#F97316` (Vibrant amber/orange for primary CTAs, active indicators, review button)
- `brand-hover`: `#EA580C` (Darkened amber for hover state)
- `brand-active`: `#C2410C` (Pressed state)
- `brand-subtle`: `rgba(249, 115, 22, 0.12)` (Active finding row background tint)
- `brand-border`: `rgba(249, 115, 22, 0.35)` (Active item border accent)

### 4. Severity & Signal Palette
- **CRITICAL**: Red `#F85149` | Subtle Bg: `rgba(248, 81, 73, 0.12)` | Border: `rgba(248, 81, 73, 0.3)`
- **HIGH**: Orange `#FB8532` | Subtle Bg: `rgba(251, 133, 50, 0.12)` | Border: `rgba(251, 133, 50, 0.3)`
- **MEDIUM / AMBER**: Amber `#D29922` | Subtle Bg: `rgba(210, 153, 34, 0.12)` | Border: `rgba(210, 153, 34, 0.3)`
- **LOW / NEUTRAL**: Slate `#8B949E` | Subtle Bg: `rgba(139, 148, 158, 0.10)` | Border: `rgba(139, 148, 158, 0.2)`
- **RESOLVED / SUCCESS**: Emerald `#3FB950` | Subtle Bg: `rgba(63, 185, 80, 0.12)` | Border: `rgba(63, 185, 80, 0.3)`

---

## D. Typography Tokens
- **Display / Editorial Headings**: `Outfit`, sans-serif, weights `600` / `700`, tracking `-0.02em`
- **Application & UI Labels**: `Geist`, `Inter`, -apple-system, sans-serif, weights `400` / `500` / `600`
- **Code & Gutter Tokens**: `JetBrains Mono`, `Fira Code`, `ui-monospace`, monospace, weight `400` / `500`

---

## E. Spacing Scale
- `2xs`: `2px` (Gutter markers, border accents)
- `xs`: `4px` (Pill padding, tag gaps)
- `sm`: `8px` (Button padding vertical, compact row gap)
- `md`: `12px` (Card padding, list item gaps)
- `lg`: `16px` (Panel padding, container insets)
- `xl`: `24px` (Major panel separation, section headers)
- `2xl`: `32px` - `48px` (Landing section vertical spacing)

---

## F. Radius Strategy (Strict Anti-Pill Hierarchy)
- **Buttons**: `rounded-[5px]` (Compact, professional, technical)
- **Badges & Tags**: `rounded-[4px]` (Crisp, sharp)
- **Cards & Containers**: `rounded-[8px]` (Restrained elevation)
- **Outer Shell / Viewport Panels**: `rounded-[10px]`
- *Strictly Forbidden*: `rounded-full` or `rounded-2xl` on functional developer buttons.

---

## G. Shadows & Depth Strategy
- Avoid heavy blurry drop-shadows.
- Depth is achieved via **1px subtle borders** (`border border-[#30363D]/60`) and **layer contrast** (`#08090A` backdrop → `#161B22` panel → `#21262D` elevated card).
- Active modals/drawers use a crisp, deep shadow: `shadow-[0_20px_50px_rgba(0,0,0,0.7)]`.

---

## H. Button System (`CodeEagleButton`)
All buttons adhere to explicit states: `default`, `hover`, `active`, `focus-visible`, `disabled`, `loading`.

1. **PRIMARY (`variant="primary"`)**:
   - Usage: `Start Reviewing →`, `Run Review →`, `Apply Fix & Re-Analyze`
   - Styles: `bg-[#F97316] text-[#08090A] font-semibold text-xs tracking-tight rounded-[5px] px-4 py-2 hover:bg-[#EA580C] hover:text-white active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#F97316] shadow-sm transition-all`
   - Never blends into background; unmistakably visible.
2. **SECONDARY (`variant="secondary"`)**:
   - Usage: `See How It Works`, `Overview`, `Dismiss`, `Cancel`
   - Styles: `bg-[#21262D] text-[#C9D1D9] border border-[#30363D] hover:bg-[#262C36] hover:text-white rounded-[5px] px-3.5 py-1.5 text-xs transition-colors`
3. **TERTIARY / GHOST (`variant="ghost"`)**:
   - Usage: Copy snippet, collapse rail, tab switchers
   - Styles: `text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D] rounded-[5px] px-2.5 py-1 text-xs`

---

## I. Icon System
- Icon Family: `lucide-react` exclusively.
- Tooltips and `aria-label` on every icon-only control.
- Clear 16px standard size for controls, 14px for metadata chips, 12px for badges.

---

## J. Navigation
- Sticky top header (`h-14`, `#0D1117`/80 backdrop blur, border-b `#21262D`).
- Left: Official CodeEagle Eagle Logo + Brand wordmark + `AI CODE REVIEW` subline.
- Middle: In review mode, displays active file metadata (`auth.js · JavaScript · 27 lines`) + 3 review lenses (`Overview`, `Findings (n)`, `Architecture`).
- Right: Primary CTA (`Start Reviewing →` on landing, `Run Review (⌘↵)` in workspace) + History trigger.

---

## K. Landing Information Architecture (13 Sections)
1. **Navbar**: Minimalist brand anchor with live scenario jump and direct review CTA.
2. **Hero**: Kinetic problem statement via `LayoutTextFlip` (*"Review your code. Catch [SECURITY FLAWS / LOGIC BUGS / QUALITY RISKS] before they ship."*) + real technical summary.
3. **Interactive Workbench Hero**: Live code simulation showing `auth.js:6` with inline finding, PR review comment, unified diff, and interactive `Apply Fix` simulation.
4. **Storytelling Flow**: The 7-step review cycle (Problem → AST Detection → Grounded Line → Impact Explanation → Recommendation → Unified Diff → Verified Patch).
5. **Why CodeEagle**: SEE (deterministic AST + AI), UNDERSTAND (senior PR review comments), FIX (verified safe patches), VERIFY (SHA-256 re-analysis).
6. **Analysis Pipeline Architecture**: Visual schematic showing: `Source Code` → `Babel Parser` → `13 Deterministic Rules` + `Gemini Contextual Engine` → `Normalized Ledger` → `Safe AST Patch Engine` → `Automated Re-Analysis`.
7. **Review Intelligence Matrix**: "What is wrong? What matters? Where is it? What should I do?"
8. **Findings Severity Spectrum**: High-contrast breakdown of Critical (P0), High (P1), Medium (P2), Low (P3).
9. **One-Click Verified Fix Engine**: Before vs After unified diff and hash verification demonstration.
10. **Instant Test Scenarios**: Quick-start buttons to load and review `auth.js`, `ActivityFeed.jsx`, and `shippingFee.js`.
11. **Review Before Ship**: Editorial section on developer trust and catching defects early.
12. **Final Conversion CTA**: "Before you ship, let CodeEagle take a look."
13. **Clean Developer Footer**: Minimal links, zero marketing fluff.

---

## L. Review Information Architecture
- Full-height, zero-clipping flex layout (`h-screen flex flex-col overflow-hidden bg-[#08090A]`).
- Top Bar: Unified file metadata and verdict banner.
- Workspace Body: 3 dedicated lenses (`Overview`, `Findings`, `Architecture`).

---

## M. Findings Interaction Model (3-Column Triage Cockpit)
- **Column 1: Findings Queue (`w-80 border-r border-[#21262D]`)**:
  - High-density list.
  - Active item features an orange accent rail (`border-l-2 border-[#F97316]`), elevated background (`#21262D`), and high-contrast title.
- **Column 2: Code Canvas (`flex-1 bg-[#0D1117]`)**:
  - Monaco-grade code editor with high-contrast text (`#E6EDF3`).
  - Gutter severity markers (`red` for critical, `orange` for high).
  - Highlighted active line range with smooth auto-scroll.
- **Column 3: Senior PR Review Comment (`w-96 border-l border-[#21262D]`)**:
  - Styled as an expert PR review comment.
  - "Why this matters" & "Recommendation" copy.
  - Syntax-highlighted unified diff box.
  - Permanently visible **`[ Apply Fix & Re-Analyze ]`** button.

---

## N. Fix Workflow (Deterministic State Machine)
- States: `IDLE` → `APPLYING` → `VERIFYING` → `RE-ANALYZING` → `RESOLVED`.
- Live source code mutation.
- Emerald diff banner showing verified score delta (`Score 50 → 75 (+25 pts)`).
- Instant decrement of active findings queue.

---

## O. History Experience
- Slide-over drawer with real audit entries from backend memory/MongoDB persistence.
- Displays filename, score, findings count, persistence engine badge (`Static` / `Hybrid`), and timestamp.
- 1-click restoration to editor without re-triggering billable API calls.

---

## P. Motion System
- Deliberate, purposeful micro-transitions (`duration-150 ease-out`).
- `LayoutTextFlip` for hero problem phrases.
- Smooth scroll on finding selection.
- Score counter and diff banner reveal animations.
- Zero decorative floating blobs, sparkles, or parallax lag.

---

## Q. Responsive Strategy
- Desktop (>= 1024px): Full 3-column triage cockpit.
- Tablet (768px - 1023px): Collapsible queue rail + side-by-side code and review comment.
- Mobile (< 768px): Tabbed navigation between Findings, Code, and Fix.

---

## R. Component-Library Strategy
- **Core Primitives**: Custom `CodeEagleButton`, `SeverityBadge`, `FindingRow`, `ScoreVerdict`.
- **Magic UI / Aceternity**: `LayoutTextFlip` for hero text animation.
- **Lucide Icons**: Standardized icons for all controls.
- **Tailwind**: Centralized tokens in `tailwind.config.js` and `index.css`.

---

## S. Accessibility Strategy
- WCAG AA contrast on all text surfaces (`#F0F6FC` on `#0D1117` yields 14:1 contrast ratio).
- Keyboard shortcuts: `⌘+Enter` (run review), `1`/`2`/`3` (lenses), `J`/`K` (triage findings), `Escape` (dismiss).
- `aria-selected`, `aria-label`, and visible focus rings on all interactive elements.
