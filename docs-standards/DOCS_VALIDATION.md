# Documentation validation

This anonymized work sample shows how I documented mechanical validation for a product documentation repository. It covers the internal-reference checker, regression tests, and CI example included in this portfolio, along with selected Vale findings and custom overrides from the original documentation program.

The portfolio itself is not a Mintlify documentation site. The workflow file is stored outside `.github/workflows/`, so it does not run here. The original Vale configuration is not included.

Editorial review is a separate concern. See [Documentation agent workflows](AGENT_WORKFLOWS.md).

## Included checks

| Check | Portfolio sample | Where it ran originally | Reports failure | Coverage |
| --- | --- | --- | --- | --- |
| Internal references | [Checker implementation](../workflows/link-checker/check-internal-xrefs.mjs) | Documentation pull request CI and local validation | Yes | Routes, anchors, assets, redirect canonicalization, navigation entries, and generated API routes |
| Checker regression tests | [Test suite](../workflows/link-checker/check-internal-xrefs.test.mjs) | Local development and the included [CI example](../workflows/link-checker/check-internal-references.yml) | Yes | Checker behavior against isolated temporary documentation fixtures |

Reporting failure and blocking a merge are separate controls. Repository rules determine whether a failed check prevents merging.

## Commands

Run these commands from `workflows/link-checker/`.

| Command | What it does |
| --- | --- |
| `npm test` | Runs the checker regression tests against temporary fixtures. |
| `node check-internal-xrefs.mjs --root <docs-repository-path>` | Checks an existing Mintlify MDX documentation repository. |

The target repository must contain `docs.json`. Running the checker without `--root` uses the current directory.

## When to run the checks

- Run the regression tests after changing the checker or its fixtures.
- Run the checker after changing links, headings, assets, redirects, navigation, or generated API routes in a target documentation repository.
- Do not run mechanical validation during an iterative editorial review unless the requester asks for it.
- For a final review, run the checks that apply to the changed artifact and state anything that remains unverified.

## Coverage boundaries

The checker focuses on internal references. It does not fetch external URLs or remote OpenAPI specifications, parse YAML OpenAPI specifications, inspect relative Markdown file links or MDX imports, check every component attribute, or prove exact renderer behavior for every MDX component.

See the [link checker README](../workflows/link-checker/README.md) for complete coverage and usage details.

The regression tests establish how the checker behaves. A passing run does not verify product instructions, complete release workflows, hosted CI configuration, or the technical accuracy of documentation.

## Vale behavior and overrides

The original documentation repository used Vale locally and through hosted checks. These notes are retained because they show how linter behavior was investigated and how exceptions were documented.

### Hosted behavior

Earlier hosted runs returned a `neutral` conclusion with a configuration error instead of linting changed files. The same failure reproduced locally. A redundant URL pattern in `TokenIgnores` overlapped JSX attributes and inline code, causing Vale's MDX parser to treat placeholders such as `<route-host>` as JSX tags. `IgnoredScopes` already excluded URLs, so the redundant pattern was removed.

After that change, Vale 3.15.1 parsed the Markdown and MDX files without a runtime error. Hosted checks also completed, reported actual findings, and returned `neutral`, confirming that they operated at warning level rather than reporting failure.

Hosted and local lint scopes can differ. In the original repository, hosted checks included agent and standards files that the local configuration excluded. Treat hosted results and local results as separate evidence instead of assuming identical coverage.

### Settled overrides

The original documentation program treated these findings as decided exceptions rather than relitigating them during every review:

- Vale flags on text in backticks or bold UI labels
- Vale flags already suppressed with an inline `vale off` comment
- Acronym flags on metadata tags or acronyms already expanded on first use
- Heading-case flags when a heading follows sentence case and contains required acronyms or product names
- `Google.Colons` findings when the style guide requires capitalization after a colon
- `alex` findings on accepted technical terms when the UI requires the term, the term appears in a literal product label, or rewriting it would change the meaning

If a Vale finding conflicts with an explicit style-guide rule, technically precise terminology, a literal value, or valid MDX formatting that helps the reader, preserve the content and report the finding with context instead of silently rewriting it.

Vale does not resolve MDX imports, so a clean result for one file does not re-lint imported content through every page that uses it.

## Report a validation finding

Report what failed, where it failed, and what the checker could or could not establish. Do not silently fix unrelated content. If a result appears to come from a checker limitation rather than a broken reference, preserve the content and report the limitation.
