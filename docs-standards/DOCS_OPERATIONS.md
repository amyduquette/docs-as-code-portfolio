# Documentation operations

Use this file as the source of truth for how docs work is planned, reviewed, automated, and maintained across repositories and tools.

This page is an operations map, not a detailed runbook. Keep implementation details in the system that owns them, and link to that system from this page.

## Scope

Use this page to track:

- Active docs automations, pipelines, and recurring planning loops
- Planned docs workflow improvements
- Where each system lives
- What triggers each system
- What each system produces
- Open operational decisions that affect docs planning or maintenance

Do not use this page to track:

- Line-by-line pipeline implementation details
- Temporary debugging notes
- Individual docs backlog items
- Product behavior that belongs in end-user docs
- Agent guidance that belongs in `AGENTS.md`, `docs-standards/AGENT_WORKFLOWS.md`, or `skill.md`

## Active systems

| System | Where it lives | What it does | Trigger | Output |
|---|---|---|---|---|
| **Docs auto PR summary** | GitHub Actions in the product documentation repository | Adds an inferred PR description when a documentation PR opens and the PR body is empty. | New documentation PR with an empty body | PR description |
| **Weekly docs changelog** | GitHub Actions in the product documentation repository | Summarizes reader-facing changes from documentation PRs merged into `main` and `release/product` by using a model. | Weekly on Fridays or manual dispatch | Short weekly Slack post to the documentation channel with source PR links |
| **Mintlify reader analytics digest** | GitHub Actions in the product documentation repository | Summarizes Mintlify feedback, searches, assistant conversations, page views, and visitors by using a model. | Weekly on Mondays or manual dispatch | Weekly Slack post to the documentation channel with a link to Mintlify analytics |
| **Check internal references** | GitHub Actions in the product documentation repository | Reports broken routes, anchors, assets, and links that point at a redirect source instead of its destination. Covers what Mintlify's hosted `link-rot` check does not. Whether the check blocks merging depends on the repository's required-status-check rules. | Pull request to a configured documentation branch or manual dispatch | Passing or failing PR check |
| **Packaged docs export** | `Dockerfile` and `build/` in the product documentation repository | Builds static docs under `/docs` for customer release bundles. The staging transform removes hosted-only pages, their exclusive assets, and entry links before `mint export`; `resources/demos` is currently hosted-only because it depends on external video content. | Documentation image build | Static documentation image without hosted-only pages or broken references to them |
| **Editorial review** | The `review-docs` skill for local drafts and reviewer adapters for pull requests | Reviews documentation for accuracy, reader success, clarity, structure, and terminology while suppressing generic code-review and mechanical-check noise. | Explicit local review request or manually selecting an AI reviewer on a pull request. Automatic reviews are not configured in this example. | Local findings or pull request review comments |

## Manual workflows

| Workflow | Where to use it | What it does | Output |
|---|---|---|---|
| `product-release` skill | Product documentation repository, when a new monthly release or patch ships | Creates and verifies the release manifest, updates navigation and release notes, assesses conditional docs impact, and hands the change off for review. | Draft PR |
| `model-release` skill | Product documentation repository, when a new model ships, updates, or is retired | Builds a sourced release-facts packet, walks the full page inventory (release notes, model tables, deployment sizing, API/CLI examples), and flags unresolved facts rather than guessing them. | Draft PR |
| `agent-room` skill | Local, for substantial or disputed docs reviews that benefit from independent perspectives | Coordinates role-based review, implementation, and rereview. The skill owns the meeting mechanics. | Decisions, owners, unresolved questions, and validation status |
| Agent mention | Slack | Mentioning the documentation agent starts a session, which may hand off to a specialist. Behavior, rendering, and allowed channels are configured in the shared Slack integration rather than per user. | A threaded reply |

`.agents/skills/` is the catalog of repo-local skills. This table lists only workflows with an operational trigger and output; see that directory for the full set.

`docs-standards/AGENT_WORKFLOWS.md` owns the editorial review rubric. `docs-standards/DOCS_VALIDATION.md` owns mechanical checks: which run, where, whether they report failure, and what each covers. Record automations here; record review behavior and validation in those.

## Planned systems

Track planned systems here before implementation so the docs workflow stays visible as it evolves. Move a system to [Active systems](#active-systems) when it runs on a real trigger and produces a real output.

| Idea | Problem it solves | Likely source | Likely output |
|---|---|---|---|
| Slack docs question scanner | Finds repeated product questions, missing docs, and confusing docs areas from team discussion. | Slack channels selected by docs | Candidate docs gaps or planning digest items |
| Code and docs drift detector | Flags product behavior changes that may invalidate current docs. | Application source changes and mapped docs ownership | Drift issue, PR comment, or planning digest item |

## Update rule

Update this page when you intentionally change how docs operations work, including a docs automation, repo-local agent workflow, repo-local skill, external pipeline, or recurring planning loop.

Normal product docs edits do not require an update to this page.

For small changes, update only the affected row. For larger changes, also check whether `AGENTS.md`, `docs-standards/AGENT_WORKFLOWS.md`, or `skill.md` needs an update.

## Implementation homes

Use this page as the map. Keep operational detail in the system that owns the work:

- Keep repo-owned GitHub Actions workflow definitions in `.github/workflows/` and supporting scripts in `scripts/`.
- Keep repo-owned docs automation model and API configuration in GitHub Actions secrets and variables. The active repo-owned docs automations use an OpenAI-compatible API for model calls.
- Keep agent behavior instructions in `AGENTS.md` and `docs-standards/AGENT_WORKFLOWS.md`.
- Keep reusable skill behavior in `.agents/skills/`.
- Keep pull request review adapters in the integration-specific locations. Point them to the canonical skill and standards instead of copying their rubric.
- Keep public agent guidance in `skill.md` only when the change affects user-facing product workflows or canonical docs guidance.
