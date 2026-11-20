# Documentation link checker

Checks internal references in Mintlify documentation. Uses Node.js 22 or later, with no external packages.

Adapted from the original documentation toolchain. Changes for this portfolio add `--root`, Markdown image checks, and tests using temporary example files.

## Run locally

Run these commands from `workflows/link-checker/`. The tests create and remove temporary docs fixtures; they do not need a live docs site.

| Command | Coverage |
| --- | --- |
| `npm test` | Reference-checker regression tests against isolated, temporary documentation fixtures |
| `node check-internal-xrefs.mjs --root <docs-repository-path>` | Internal references in an existing Mintlify MDX documentation repository |

The checked repository must contain `docs.json`. Running the checker without `--root` uses the current directory. This sample collection is not a Mintlify site, so use the tests here or supply a documentation root.

## Checker boundaries

The checker scans `.mdx` files, honors the directory exclusions in `.mintignore`, and checks:

- Root-relative Markdown links, images, and double-quoted `href` attributes, including local or cross-page heading anchors
- Explicit step IDs and custom heading anchors
- Supported root-relative asset paths
- References to redirect sources instead of their canonical destinations
- Redirect destinations and navigation entries
- Generated API page routes derived from local JSON OpenAPI specifications

Code examples and inline code are masked before link scanning. The checker does not fetch external URLs or remote OpenAPI specifications, parse YAML OpenAPI specifications, inspect relative Markdown file links or MDX imports, check every component attribute, or prove exact renderer behavior for every MDX component. Generated API anchors are reported as unverifiable.

Navigation coverage follows the `tabs` and versioned-tab layouts supported by the adapted checker. Other layouts need separate coverage. This is a focused reference checker, not a complete Markdown or MDX parser.

The tool reports errors with a nonzero exit code. The [CI file](check-internal-references.yml) is an example for running the tests on GitHub; it is not active from this folder.

## What these checks establish

The tests check the link checker's behavior. They do not verify product instructions, complete release workflows, or hosted CI. Use the [agent workflow rubric](../../docs-standards/AGENT_WORKFLOWS.md) and the source that owns each technical claim when reviewing documentation.
