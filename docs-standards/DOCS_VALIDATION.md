# Documentation validation

This file owns the mechanical checks: what runs, where, what it reports, and what each one covers. It is the only place command flags are written down. Reference commands by name elsewhere so guidance cannot drift out of sync with what actually runs.

Editorial review is a separate concern. See `docs-standards/AGENT_WORKFLOWS.md`.

## What runs, and where

Verified July 2026 by direct testing plus reading real PR check runs. Re-verify if the Mintlify dashboard configuration changes, and note that Mintlify runs these per deployment, so a check can be enabled on one deployment and not another.

| Check | Where it runs | Reports failure | Covers |
|---|---|---|---|
| `link-rot` | Mintlify hosted CI on configured deployments | Yes | Internal page links. Does not check external URLs. Direct testing showed it does not check anchors either. |
| `Mintlify Deployment` | Mintlify hosted CI, observed on `main` PRs | Yes | Preview build. Catches invalid `docs.json`, navigation, frontmatter, and missing images. |
| `vale-spellcheck` | Mintlify hosted CI on selected deployments | No (warning level) | Changed Markdown and MDX files. Hosted exclusions differ from local Vale; see below. |
| Internal references | GitHub Actions, `npm run check:xrefs` | Yes | Routes, anchors, assets, and redirect canonicalization. Superset of `link-rot` for internal links. |
| Build errors | GitHub Actions. On `main` and `release/api`, `.github/workflows/build-image.yml`; on `release/product`, `.github/workflows/component-build.yml`. Both build the Dockerfile, which runs `mint export`. | Yes | Invalid MDX and broken components on pages that remain in the packaged `docs.json` after the staging transform. The transform excludes hosted-only pages, currently `resources/demos`. |
| Style and terminology | Local Vale and your editor | No | Runs live while editing. |
| External links | `npm run check:external-links`, on request only | No | External URLs. Known false positives, so it is never wired into CI. |

Reporting failure and blocking a merge are separate controls. Confirm the repository's current required-status-check rules before describing a check as merge-gating, and update this guide when those rules change.

Anchors and external links are not covered by `link-rot`. Anchors are caught by `check:xrefs`; external links only by the manual `check:external-links`.

### Hosted Vale behavior

Earlier hosted runs returned a `neutral` conclusion with a configuration error instead of linting the changed files. The same failures reproduced locally. A redundant URL pattern in `TokenIgnores` overlapped JSX attributes and inline code, causing Vale's MDX parser to treat placeholders such as `<route-host>` as JSX tags. `IgnoredScopes` already excludes URLs, so the URL pattern was removed from `.vale.ini` and `vale.full.ini`.

With that pattern removed, Vale 3.15.1 parsed every Markdown and MDX file locally without a runtime error. On a representative pull request, the hosted checks also completed successfully, reported real findings, and returned `neutral`. This confirms that the configured checks run Vale at warning level rather than returning a failure status.

Hosted Vale linted files under `.agents/` and `docs-standards/` on that PR even though local Vale excludes them through `.valeignore` and file-specific `.vale.ini` sections. Expect hosted findings on those paths to differ from local results.

### Orphan pages are outside the build graph

Only pages in `docs.json` are build-gating. Verified in July 2026 by adding an unclosed component to `index.mdx`: both `mint validate` and `mint export` reported the parse error and exited 1, and the export failed to generate the affected pages. The same defect in an `.mdx` file that no `docs.json` entry references still printed a parse error, but both commands exited 0, because an unreferenced file is not part of the built site. Orphan files are parsed and reported on; they just cannot fail a build. That is one more reason new pages belong in `docs.json` and work in progress belongs in `_drafts/`.

## Commands

| Command | What it does |
|---|---|
| `npm run check:xrefs` | Internal routes, anchors, assets, redirect canonicalization. Runs in PR CI, where it exits nonzero and turns the check red. |
| `npm run check:external-links` | Full external link pass with the repo's false-positive filter. Manual only. |
| `npm run check:style -- <file> [<file>...]` | Vale on the named files. Pass targets after `--`; with no target it prints usage and does nothing. Prefer the files you changed over the whole repo. |
| `npm run check:build` | Fast local structural validation. Fails with a nonzero exit on a parse error in any page `docs.json` references. Useful for catching a broken page before you push; the PR image build remains authoritative for export readiness. |

## When to run them

Do not run validation during drafting or iterative review. A plain "review it" runs no tooling at all.

There are three points where checks do run:

- **Automatically in CI.** The reporting checks run where listed in the table above. Nobody has to remember to trigger them. The table is the authority for which checks exist.
- **At handoff**, when an agent finishes an authored change and hands it back. Run `check:xrefs` and `check:build`, the fast local pair. This is the exception to "only when asked": it needs no request because it catches a broken link or page before it reaches a PR.
- **On request.** If the writer names a check, run that one. If the writer asks to "validate" without naming one, run the same fast pair. Run `check:style` and `check:external-links` only when named, or during a final review.

## Settled exceptions

These rulings are decided. Do not relitigate them per review.

- Vale flags on text in backticks or bold UI labels
- Vale flags already suppressed with an inline `vale off` comment
- Vale acronym flags on metadata tags or on acronyms already expanded on first use
- Vale heading-case flags when the heading already follows sentence case and only includes required acronyms or product names
- `Google.Colons` flags. The style guide requires capitalizing after a colon, so these are always false positives.
- `alex` flags on accepted technical terms only when the term is required by the UI, appears in a literal product label, or a rewording would change the meaning. Otherwise, prefer a clearer rewrite such as `run`.
- External link failures on the VS Code and Visual Studio marketplace. Those pages return a 404 response to automated checkers while resolving normally in a browser. The filter in `scripts/check-broken-links.mjs` matches the whole marketplace host, because per-extension entries silently stop covering each newly documented extension. The tradeoff is deliberate: a genuinely removed marketplace listing is also hidden, so verify marketplace links by hand when you add or change one.
- External link failures on the reserved example host `https://docs.example.local` and any path under it

If a Vale flag conflicts with an explicit rule in `STYLE_GUIDE.md`, report it as a likely false positive rather than a documentation issue. If it conflicts with technically precise terminology, a literal value, or valid Mintlify formatting that helps the reader, preserve the content and report the flag with context instead of silently rewriting it.

Vale does not resolve MDX imports, so a clean run on one file does not re-lint a snippet's content through every page that imports it.

## Reporting a linter finding

Report linter findings; do not fix them as part of unrelated work.

Vale runs live in the editor, so flags appear whether or not anyone asked for validation. When you see one while working on something else, say what was flagged, where, and what the fix would be. Then stop. Apply only what the writer approves. This applies to `.mdx` pages, skill files, `AGENTS.md`, and `docs-standards/` alike.
