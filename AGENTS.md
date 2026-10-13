# Repository Guidelines

## Project Structure & Module Organization

AUTO FIX is a Ukrainian-language automotive service landing page built with plain HTML, CSS, and JavaScript. There is no backend or build pipeline.

- `index.html`: page sections, service prices, contacts, inline SVG symbols, and dialogs.
- `assets/css/styles.css`: shared styles, responsive layouts, focus states, and reduced-motion rules.
- `assets/js/script.js`: navigation, price filters, estimate calculation, clipboard handling, dialogs, and gallery controls.
- `assets/image/`: logo and workshop illustrations; `assets/image/gallery/` contains client photographs.
- `assets/vendor/swiper/`: bundled Swiper JavaScript, CSS, and MIT license.

Local `README.md` consolidates project setup, content maintenance, asset provenance, and verification notes. It is excluded by `.gitignore`; do not assume it exists in a fresh clone. Keep contributor rules in `AGENTS.md`. There is no automated test directory.

## Build, Test, and Development Commands

Run commands from the repository root:

- `python3 -m http.server 8080`: serve the site at `http://localhost:8080`.
- `node --check assets/js/script.js`: check JavaScript syntax; this does not test browser behavior.
- `git diff --check`: detect whitespace errors in tracked changes.

Opening `index.html` directly also works. No npm installation or build step is required.

## Coding Style & Naming Conventions

Use two-space indentation. Follow existing JavaScript conventions: strict mode, single-quoted strings, semicolons, and camelCase identifiers. Use kebab-case CSS classes and descriptive `data-*` attributes for behavior. Reuse CSS custom properties in `:root`.

Keep visible text Ukrainian and asset paths relative. Preserve the framework-free structure and local dependencies; retain vendor licenses. When changing prices, update both the displayed amount and the corresponding input `value`; preserve `data-service` and category mappings.

## Testing Guidelines

No test framework or coverage threshold is configured. After behavior or layout changes, run syntax and whitespace checks, then verify in a browser:

- Narrow mobile and desktop layouts, navigation, and readable contacts.
- Price filtering, persistent selections, totals, reset, and clipboard fallback.
- Dialog opening/closing, Escape, keyboard focus, and gallery controls.
- Reduced motion and usable content with JavaScript disabled.

Report browser checks separately from static validation and state any untested behavior.

## Commit & Pull Request Guidelines

History uses short English summaries such as `Add mechanic contact dialog with phone and messenger links`; no mandatory prefix scheme is established. Prefer imperative summaries and focused commits.

For pull requests, describe the change, list validation performed, link relevant issues when available, and include mobile/desktop screenshots for visual changes. Keep telephone booking behavior accurate: the site does not submit service requests to a server.
