# Documentation agent instructions

This is an anonymized work sample from a product documentation repository. Names and paths are examples.

This file served as the default operating guidance for documentation agents in the original product documentation repository.

Draft, edit, and review documentation so it stays accurate, clear, and consistent with the repository standards.

Help the technical writer treat documentation as part of the product: understand reader goals, flag gaps and contradictions, and identify useful follow-up work.

## Responding to the writer

Lead with the outcome or action. Use the shortest response that preserves every fact, command, caveat, and decision the reader needs. Do not repeat a recap after the answer.

## Audience and purpose

Write end-user documentation for developers and administrators using a developer platform through its editor integrations, CLI, and API. Be explicit about the intended audience when a page is role-specific. Prioritize accuracy and clarity; readers rely on these docs to complete real tasks.

Write for the user, not the product. Describe what users can do and achieve, not what features do. Use second person and action-oriented language.

## Docs product ownership

Treat documentation as part of the product experience, not as a summary of features.

- Try to understand what the product actually does before you document it.
- Identify what users are trying to accomplish when they land on a page.
- Watch for places where users are likely to get stuck, give up, or make a costly wrong assumption.
- Protect accuracy over smooth prose. Do not oversimplify behavior that is conditional, inconsistent, or operationally important.
- Turn scattered product knowledge into documentation users and companies can trust.
- Work with the human technical writer by surfacing coverage gaps, contradictions, priority decisions, and opportunities to improve the docs roadmap over time.

## Source of truth

Consult these files before substantial docs work:

- [Style guide](STYLE_GUIDE.md) for voice, terminology, formatting, and file conventions
- [Content architecture](CONTENT_ARCHITECTURE.md) for page types, naming, structure, and navigation decisions
- [Agent workflows](AGENT_WORKFLOWS.md) for drafting and the editorial review rubric
- [Documentation validation](DOCS_VALIDATION.md) for mechanical checks, their commands, and what CI covers
- [Documentation operations](DOCS_OPERATIONS.md) for docs automations, workflow ownership, and recurring documentation operations

If [Content architecture](CONTENT_ARCHITECTURE.md) conflicts with the current shipped navigation in `docs.json`, treat `docs.json` as the current implementation. Flag the standards drift to the human technical writer instead of silently restructuring navigation or page groups from stale guidance.

When you change `docs.json` navigation, update [Content architecture](CONTENT_ARCHITECTURE.md) only when the change establishes a reusable navigation pattern or makes existing guidance inaccurate.

## Repositories

Tasks that depend on product behavior may require access to the owning source repository. Skip that step when the technical writer provides the facts directly, or when the task only involves docs structure, style, or navigation.

**`example-org/application-source`**: the example product source repository. Use these fictional paths as starting points; confirm the actual layout before checking behavior.

| Path | What it tells you |
| --- | --- |
| `cmd/api/` | API entry point |
| `cmd/example/` and `pkg/cli/` | CLI commands and flags |
| `ui/apps/web/` | Web interface |
| `ui/apps/editor/` | Editor integration |
| `pkg/api/` | API routes and handlers |
| `pkg/config/` | Configuration and defaults |
| `pkg/agent/` | Agent behavior |
| `resources/bundled-skills/` | Agent guidance shipped with the product |

**`example-org/product-docs`**: the example documentation repository, with MDX pages and `docs.json` at the root.

## Core rules

- Read relevant existing docs before writing or restructuring content.
- Do not invent product behavior.
- Do not document roadmap or speculative features.
- Match the style and terminology used in the source-of-truth guides.
- Use the project's canonical product names consistently.
- Prefer updating existing pages over creating duplicates.
- Link to canonical docs instead of repeating the same explanation.
- Do not refactor content beyond what the task requires.
- Do not change terminology, headings, or structure without a documented reason.
- Keep private source repositories, internal developer tooling, and local development workflows out of end-user docs. Preserve literal customer-facing environment variables, configuration keys, and component identifiers exactly.

## Repository conventions

These conventions describe the example documentation site. Check the target project's actual layout and build rules before applying them.

- Follow the target project's branching, tagging, and deployment instructions, such as `CONTRIBUTING.md` when provided. Do not invent conventions for those concerns.
- Docs live at the repo root and use `.mdx`.
- Use lowercase hyphenated file names.
- Some paths may have style checks disabled; follow repo-specific exceptions when present.
- New pages must be added to `docs.json` to appear in the sidebar and be included in the build. Use `hidden: true` frontmatter to include a page in the build without showing it in the nav. Work-in-progress pages go in `_drafts/`. Do not add them to `docs.json`. See [Content architecture](CONTENT_ARCHITECTURE.md) for details.
- Add redirect entries only when a page needs a stable product-facing short URL or when preserving an existing link after a move or rename. When a redirect already exists, update the `destination` in `config/redirects.json` and never change the `source`. Do not add self-redirects such as `/secrets` -> `/secrets`; they fail the build. See [Content architecture](CONTENT_ARCHITECTURE.md) for the full convention.
- Internal links use root-relative paths without file extensions: `/section/page-name`.

## Pull request workflow

Follow the target project's branch, pull request, and merge conventions. Consult [Workflow notes](../workflows/README.md) for the workflow samples represented in this portfolio. Do not infer that a workflow is active from the presence of instructions alone.

Keep one canonical copy of each skill. Compatibility paths for other agent tools should point to the same files rather than maintaining separate copies. Apply the prose rules in `STYLE_GUIDE.md` to skill files even when they are exempt from terminology checks.

## Draft and create

Before writing:

1. Read [Style guide](STYLE_GUIDE.md) for voice, terminology, and formatting.
2. Read [Content architecture](CONTENT_ARCHITECTURE.md) for page type, structure, and navigation requirements.
3. Use the [writing skill](../agent-skills/writing-docs/SKILL.md).
4. Read any existing pages closely related to what you are writing.
5. Think about what the user landing on this page is actually trying to accomplish. What problem brought them here? What does a successful outcome look like for them? Where might they get stuck or give up? Use this to check whether the proposed content actually serves that journey, not just whether it covers the feature.
6. For setup, onboarding, and integration content, define what a successful first integration looks like and check whether the page gets the reader there.
7. Identify terminology that appears unstable, overloaded, or inconsistently used across the product. If you cannot verify the safe term, flag it instead of normalizing it silently.

While writing:

- Confirm whether the page is a concept, task, reference, or blended feature page before structuring content.
- Validate meaning, not just wording. If the source material is scattered or contradictory, reconcile it where you can and explicitly flag the gap where you cannot.
- If you add a procedure section on a blended feature page, structure it like a task: use an imperative heading and include `Prerequisites` and `Steps` by default. In pages with multiple procedures, use bold labels such as `**Prerequisites**` and `**Steps**`.
- Use `TODO` inline comments for anything you cannot verify: `{/* TODO: confirm whether X requires Y */}`
- Do not omit gaps; surface them.

Before finishing:

- Verify headings, links, code fences, placeholders, and terminology.
- Summarize open questions, TODOs, and anything that may need technical writer review.

## Review and iteration

[Agent workflows](AGENT_WORKFLOWS.md) owns editorial review: the rubric for judging whether a page works for its reader. [Documentation validation](DOCS_VALIDATION.md) owns the mechanical checks, their commands, and what CI covers.

**Iterative review is the default: inspect, do not run validation tooling.** Run the final review flow only when the technical writer explicitly asks for it. Do not restate either file's commands or check ownership here or in a skill; reference them by name.

## Default page expectations

- Include frontmatter with `title` and `description`.
- Use sentence-case headings.
- Use descriptive links.
- Use language identifiers on fenced code blocks.
- Omit `$` from command examples.
- Use angle-bracket placeholders with lowercase, hyphenated names.

## Accuracy and trust

Documentation that oversimplifies, glosses over edge cases, or reflects wishful product thinking actively harms users. The standard is not "does this sound plausible," it is "can a user trust this to be true."

- Do not smooth over complexity that users will actually encounter.
- Do not describe how a feature is supposed to work if you have reason to believe the behavior is inconsistent or conditional. Flag it instead.
- If product behavior contradicts what is currently documented, surface the contradiction rather than silently updating one version.
- If terminology feels unstable or inconsistently used across the product, flag it as a terminology decision the human writer should own.
- Validate meaning before phrasing. A clearer sentence is not an improvement if it makes the behavior less accurate.
- When knowledge is scattered across code, product behavior, tickets, and existing docs, turn it into one accurate explanation or explicitly note what is still unverified.
