# Documentation operations

This anonymized work sample shows how I documented the ownership, triggers, and outputs of documentation systems in a product documentation program. It covers only systems with artifacts included in this portfolio. The portfolio copies are disconnected examples and do not run here.

This page is an operations map, not a detailed runbook. Implementation details remain in the linked workflow, skill, and standards files.

## Scope

Use this page to track:

- Docs automations, agent workflows, and recurring planning loops represented in this portfolio
- Where each system lives
- What triggers each system
- What each system produces

Do not use this page to track:

- Line-by-line pipeline implementation details
- Temporary debugging notes
- Individual docs backlog items
- Product behavior that belongs in end-user docs
- Detailed agent guidance that belongs in a linked standards or skill file

## Automation and review systems

These systems ran in the original documentation program. The portfolio copies are not connected to hosted services or configured to run automatically.

| System | Portfolio sample | What it does | Original trigger | Original output |
|---|---|---|---|---|
| **Weekly docs changelog** | [Workflow and implementation](../workflows/weekly-docs-changelog/README.md) | Summarizes reader-facing changes from merged documentation pull requests by using a model. | Weekly or manual dispatch | Short Slack post with source pull request links |
| **Reader-signal digest** | [Workflow and implementation](../workflows/reader-signal-digest/README.md) | Summarizes documentation feedback, searches, assistant conversations, page views, and visitors by using a model. | Weekly or manual dispatch | Planning digest posted to Slack |
| **Check internal references** | [Checker and CI example](../workflows/link-checker/README.md) | Reports broken routes, anchors, assets, navigation entries, and links that point to redirect sources. | Documentation pull request or manual dispatch | Passing or failing pull request check |
| **Editorial review** | [Review skill](../agent-skills/review-docs/SKILL.md) and [review rubric](AGENT_WORKFLOWS.md) | Reviews documentation for accuracy, reader success, clarity, structure, and terminology. | Explicit review request | Prioritized findings and unresolved questions |

## Manual workflows

| Workflow | Portfolio sample | What it does | Output |
|---|---|---|---|
| CLI release | [CLI release skill](../agent-skills/cli-release/SKILL.md) | Guides an agent through verifying released CLI behavior and updating affected documentation. | Documentation impact assessment and updates |
| Add an integration to product docs | [Integration skill](../agent-skills/add-tool-page/SKILL.md) | Guides research, verification, drafting, and placement of an integration guide. | Integration documentation aligned with the product docs |
| Add the product to other docs | [External documentation skill](../agent-skills/add-product-to-other-docs/SKILL.md) | Guides a contribution to another project's documentation while following that project's conventions. | Documentation contribution aligned with the target repository |
| Write documentation | [Writing skill](../agent-skills/writing-docs/SKILL.md) | Applies shared writing, content architecture, and accuracy standards to a draft or edit. | Documentation draft or revision |

The [`agent-skills`](../agent-skills/) directory contains the complete skill samples included in this portfolio.

`docs-standards/AGENT_WORKFLOWS.md` owns the editorial review rubric. `docs-standards/DOCS_VALIDATION.md` owns mechanical checks: which run, where, whether they report failure, and what each covers. Record automations here; record review behavior and validation in those.

## Update rule

In the original documentation repository, this map was updated whenever an automation, agent workflow, skill, external pipeline, or recurring planning loop changed.

In this portfolio, update the map when a sample is added, removed, or materially changed. Ordinary wording changes do not require an update.

## Portfolio locations

- [`workflows/`](../workflows/) contains the automation, validation, workflow, and test samples.
- [`agent-skills/`](../agent-skills/) contains reusable agent workflow samples.
- [`docs-standards/`](./) contains the writing, architecture, review, validation, and operations standards.

The workflow files in this portfolio are inactive examples. No credentials or hosted integrations are configured.
