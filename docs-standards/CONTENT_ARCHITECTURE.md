# Product docs content architecture

This anonymized work sample shows the information architecture, page types, naming conventions, and content structure I established for a product documentation site.

Use `STYLE_GUIDE.md` for prose, terminology, and formatting rules.

## Scope

Use this guide for decisions about:

- How docs are grouped in navigation
- When to create concept, task, or reference pages
- How to name pages
- How to structure feature pages and task pages
- How to cross-link without duplicating content

## Navigation structure

The Documentation tab uses user-goal-based groups. Use **Use the product** for surface-specific pages only when the page is best found by the interface the user is working in.

### Top-level groups

| Group | Contents |
|-------|----------|
| **Get started** | Orientation, quickstart, and supported models |
| **Use the product** | Surface-specific docs for the IDE, web, and CLI |
| **Work with agents** | Cross-surface agent workflows such as context, plan mode, and trajectories |
| **Customize agents** | Agent behavior and reusable configuration docs such as instructions, managed agents, and skills |
| **Connect agents** | Permission-gated resources that agents can use, such as MCP servers, repositories, credentials, and secrets |
| **Control agents** | Runtime controls such as tool permissions, sandboxes, and settings file reference |
| **Orchestration** | Repository-backed pipelines and automation workflows |
| **Administration** | Admin-only operations: console overview, auditing, metrics, models, organization, and settings |

### Grouping principles

- Use surface labels such as **IDE**, **Web**, and **CLI** only for pages that are genuinely tied to that interface.
- Cross-surface pages such as `agent-instructions`, `tool-permissions`, `context`, and `plan-mode` belong outside any surface group.
- Do not default to organizing docs by UI. Prefer user-goal groups first, then use surface grouping only where it makes the nav easier to scan.
- Keep nesting shallow. Add a sub-group only when it materially helps users find the right page faster.
- Group by user goal rather than implementation type. For example, keep reusable resources such as MCP servers and repositories separate from safety controls such as approvals and sandboxes.
- **Administration** is for admin-only operations. Non-admins should not need to navigate here for daily use.
- Avoid duplicating content across groups. Cross-link instead.

### Drafts and unpublished pages

Store work-in-progress pages in `_drafts/`. This folder is excluded from Mintlify's search and processing via `.mintignore`. Do not add `_drafts/` pages to `docs.json`.

To publish a page without showing it in the navigation, for example, a page linked directly from another page or from the product, add it to `docs.json` and set `hidden: true` in its frontmatter. Hidden pages are included in the site build but do not appear in the sidebar.

Do not add temporary release-branch, cherry-pick, or propagation status to end-user pages. Keep each branch accurate for the behavior available there, and track temporary rollout state in the pull request or work tracker.

## Use clear content types

### Concept pages use nouns

Concept pages explain what something is and why it matters.

Examples:

- `Custom instructions`
- `Tool permissions`
- `Repositories`
- `Sandboxes`

Avoid verb-led concept titles such as `Using custom instructions`.

### Task pages use verbs

Task pages explain how to do something.

Examples:

- `Install the extension`
- `Create an agent`
- `Configure permissions`
- `Manage organizations`

Avoid abstract noun titles such as `Agent creation`.

### Reference pages use descriptive nouns

Reference pages support lookup.

Examples:

- `API reference`
- `Commands reference`
- `Permissions reference`
- `Supported models`

## Start from the user journey

Before choosing a structure, identify the reader's goal.

- Ask why the user landed on this page and what they need to accomplish next.
- Define the successful outcome for the page, especially for setup and integration content.
- Bring critical prerequisites, constraints, and likely failure points close to the action instead of burying them in background sections.
- Prioritize the path to first success over feature-by-feature completeness.
- If users commonly fail because the product behavior is conditional or the terminology is confusing, make that explicit in the page structure.

When reviewing a page, read it as a first-time user and confirm it answers:

- Why am I here?
- What do I need before I start?
- What do I do next?
- How do I know I succeeded?

## Default page pattern

Most feature documentation should blend concept and task in one page.

Recommended flow:

1. Opening statement
2. Key features or capabilities
3. How it works
4. Get started
5. Advanced usage
6. Examples
7. Related resources

Use this pattern when users need both conceptual grounding and an immediate path to action. Structure the page around the user's likely journey from orientation to first successful outcome.

## Cross-surface task structure

When a page covers one user task across multiple surfaces, organize the page by task first and by surface second.

- Use a shared `##` heading for the task, such as `Use plan mode` or `Add context`.
- Within that task section, use `###` surface subheadings such as `In the IDE`, `In the CLI`, or `In the browser` only when the workflow actually differs by surface.
- Within each surface section, prefer bold labels over deeper heading levels for short variants such as files, symbols, or web content. This keeps the table of contents focused on the main user journey instead of small UI-level distinctions.
- Do not make the entire page structure surface-first unless the page itself is genuinely surface-specific.

Use a surface-first exception when task-first structure would fragment a surface-specific workflow or create repetitive surface subsections for controls that do not map cleanly across surfaces. For example, a cross-surface page about context can keep IDE and CLI sections separate when the IDE guidance is organized by context type and the CLI guidance is organized by execution mode.

## Feature page template

```markdown
---
title: "Feature name"
description: "A one-sentence TLDR that tells the reader what this page helps them do and why they should read it."
---

## Overview

[What it is and why it matters]

## Key features

- [Capability]
- [Capability]
- [Capability]

## How it works

[High-level mechanics]

## Get started

### Prerequisites

- [Requirement]

### Basic usage

1. [Step]
2. [Step]
3. [Expected result]

## Advanced usage

[Optional deeper workflows]

## Examples

[Representative examples]

## Related resources

- [Related page]
```

## Conditional sections

Only include a section when you have content for it. Do not fill in placeholder text or leave a section empty.

| Section | Include when |
|---------|--------------|
| How it works | The feature has underlying mechanics that benefit from explanation |
| Advanced usage | There are meaningful workflows beyond basic usage |
| Examples | A runnable example would help the reader |
| Troubleshooting | There are known failure modes with specific causes and fixes |
| Related resources | There are genuinely related pages worth linking to |

When information is missing, insert a specific inline comment such as `{/* TODO: confirm whether X requires Y */}` rather than writing a vague placeholder.

## Procedure sections within feature pages

On blended feature pages, any section that tells the reader how to do something should use task structure, not ad hoc prose.

- Use an imperative heading for the procedure, such as `Create a credential` or `Connect a repository`.
- Within that procedure section, include `Prerequisites` and `Steps` by default.
- In pages with multiple procedures, use bold labels such as `**Prerequisites**` and `**Steps**` to avoid cluttering the table of contents.
- Omit `Prerequisites` only when there truly are none.
- Omit `Steps` only when the section is not actually procedural and should be rewritten as concept content instead.

This rule applies even when the page as a whole is not a standalone task page.

## When to split into standalone task pages

Create separate task pages when the procedure is:

- Reused across multiple features
- Long or operationally complex
- Administrative
- Installation or setup focused
- Troubleshooting focused

## Task page template

```markdown
---
title: "Task name"
description: "One sentence describing what this task helps you accomplish."
---

[Opening statement that states the outcome]

## Prerequisites

- [Requirement]

## Steps

1. First action
2. Second action

## Next steps

- [Related task or concept]

## Related resources

- [Related concept or reference]
```

### Task flow rules

Use these rules for standalone task pages and procedural sections on blended pages:

- Prerequisites are conditions, access, tools, or materials the user must already have before they start. Do not list actions the page teaches the user how to perform as prerequisites.
- Put the main sequence of user actions under `## Steps` for task pages.
- Use numbered steps for the main sequence.
- Use tabs for alternate ways to complete the same step, such as retrieving the same value from an API or from a database.
- Do not split a short sequential task into multiple procedural `##` sections when one `## Steps` section is clearer.
- Keep success verification close to the end of the procedure so users know the change worked.

## Reference page pattern

Structure reference pages for quick lookup first.

Recommended flow:

1. Quick reference
2. Detailed specifications
3. Examples

## Product-to-docs linking

Developers link to docs from inside the product using short stable URLs defined in `config/redirects.json`, which `docs.json` references with `$ref`. These redirects are a contract with the product team. The `source` value never changes; only the `destination` changes if a file is moved or renamed.

### Convention

- Add a redirect entry when a page needs a stable product-facing short URL, such as a link used from inside the product.
- When you move or rename a file that already has a redirect entry, update the `destination` in `config/redirects.json` — the `source` stays the same.
- Never add a redirect when `source` and `destination` would be identical. Self-redirects such as `/secrets` -> `/secrets` fail the build.
- Never remove or rename a `source` value without coordinating with the product team.

### Moving or renaming a page

Update the existing entry in `config/redirects.json`:

```json
{ "source": "/your-slug", "destination": "/new-folder/new-file-name" }
```

## Linking strategy

Link to depth instead of duplicating explanations.

Do:

- Link to prerequisite concepts
- Link to detailed procedures
- Link to reference material for exhaustive options
- When two related pages split responsibility, add a direct inline link on each page where readers are likely to need the other page next
- Link directly to the page that helps the user recover from the next likely point of confusion or failure

Do not:

- Re-explain a concept that already has a dedicated page
- Repeat long procedures in multiple places
- Hide critical setup requirements several clicks away

## Naming guidance

Match the file name to the title and content type.

### Concept page naming patterns

| Pattern | Example | When to use |
|---------|---------|-------------|
| Noun | `agents.mdx` | When the concept name stands alone |
| Adjective + noun | `custom-instructions.mdx` | When describing a specific type |
| "How [noun] work" | `how-agents-work.mdx` | When explaining mechanics |
| "Understanding [noun]" | `understanding-sandboxes.mdx` | When the concept needs extra framing |

### Task page naming patterns

| Pattern | Example | When to use |
|---------|---------|-------------|
| Verb | `install.mdx` | Short task pages with a clear object from context |
| Verb + noun | `configure-permissions.mdx`, `manage-users.mdx` | Most task pages |
| Verb + adjective + noun | `set-up-sandboxes.mdx` | When the task involves initial setup |

### Reference page naming patterns

| Pattern | Example | When to use |
|---------|---------|-------------|
| Noun + "reference" | `permissions-reference.mdx` | Comprehensive lookup |
| "Supported [noun]" | `supported-models.mdx` | Lists of available items |
| Short noun | `cli.mdx`, `models.mdx` | A page with a clear, established product name |

## Authoring checklist

Before creating or restructuring a page, confirm that:

- The page has a clear content type
- The title matches the content type
- The page is placed in the correct group per the navigation structure above
- The page is added to `docs.json` navigation
- If the page needs a stable product-facing short URL, a redirect entry is added to `config/redirects.json` (see **Product-to-docs linking** above)
- The content links out instead of duplicating existing material
- The structure helps a reader move from orientation to action
