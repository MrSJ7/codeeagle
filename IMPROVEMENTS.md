# Review accuracy and interface update

## What changed

- React effect dependency checks now inspect lexical bindings and all explicit dependency arrays. Stable state setters and refs are excluded, and missing dependencies are reported together.
- React list-key checks use the actual enclosing `.map()` callback binding, preventing unrelated variables with the same name from being flagged.
- Event-listener cleanup detection reads the AST, so a comment or unrelated call no longer counts as cleanup. Intentional `== null` checks are left alone.
- Static and hybrid review scores share one calculator. Rule impact weights keep minor maintainability findings from counting as much as security defects.
- Hardcoded secrets and effect dependencies no longer receive automatic edits that could break behavior or expose secrets. A unique standalone `debugger` statement has a verified removable fix.
- The refactor service no longer fabricates placeholder functions or comment-only “fixes” when Gemini is unavailable. Generated candidates must be unique, size-bounded, and parse as valid code before preview.
- Suggested edits pass source verification and a visual preview before application.
- The review report and mobile workspace were redesigned around a clear score explanation, prioritized findings, accessible mobile navigation, and a usable stacked findings/detail/editor layout.

## Verify locally

```sh
npm ci
npm test
npm --prefix client run build
npm run dev
```

Set `GEMINI_API_KEY` on the server if you want AI findings and suggested refactors. Static checks work without it. This review remains heuristic: a score of 100 means the enabled checks found no issues, not that the code is bug-free.
