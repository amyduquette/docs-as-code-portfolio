---
name: add-tool-page
description: Add or update an integration page in a product's own documentation, including editor, API-provider, and CI setup guides. Use add-product-to-other-docs when contributing to a third-party project's docs instead.
---

# Add a tool integration page

Read [Documentation agent instructions](../../docs-standards/AGENT_INSTRUCTIONS.md), the [writing skill](../writing-docs/SKILL.md), [content architecture](../../docs-standards/CONTENT_ARCHITECTURE.md), and the target site's current navigation before substantial edits. Read relevant platform-specific guidance if the target project provides it. For small edits, inspect the guidance relevant to the change and still assess sibling consistency and navigation impact.

This skill covers page classification, sibling matching, shared snippets, navigation, and integration-specific verification. Site paths, component names, and commands below are fictional examples to map to the target documentation repository; this collection does not include those pages.

## Classify before drafting

Identify the integration surface before choosing its prerequisites, title, and structure:

- **ACP editor or agent:** an agent CLI exposed through Agent Client Protocol (ACP), for example `example acp`. A title pattern is `Use the agent in <tool>`.
- **Provider-based client:** a client accessing models through an OpenAI-compatible or native provider integration. A title pattern is `Use models in <tool>`.
- **Task-specific surface:** automation, CI, or a local runtime. Match the closest task-specific sibling rather than forcing an editor-setup template.

Define the reader's first-success goal: what observable result shows that this integration is working?

## Research

- Check the tool's current official documentation or UI for exact labels, configuration paths, authentication, supported platforms, and setup methods. A transcript or video is a starting point, not a substitute for those checks. Mark unresolved behavior with a `TODO` rather than guessing.
- List the tool as a prerequisite when the procedure requires its CLI or UI. Link to its official installation instructions instead of reproducing them. Explain product-specific prerequisites, including the authenticated CLI or provider credentials required for the chosen path.
- Keep hosted-service, organization-deployment, third-party-provider, gateway, and local-runtime access distinct when the product supports them. Do not collapse their authentication or billing boundaries into one generic API-key instruction.
- Reuse a maintained model-list snippet when one exists. Avoid hardcoding volatile model IDs, context limits, or defaults unless required. Use clearly explained placeholders for values the reader supplies; distinguish templates from configuration that can be pasted unchanged.
- If the endpoint supports keyless access, check how this particular client handles it. Omit an authentication setting when supported; use a non-secret placeholder only when the client requires a non-empty value and that behavior is verified. Do not carry one client's workaround into every integration.
- Keep prerequisites, steps, and verification consistent. If keyless access is supported, do not require an API key elsewhere on the page. A successful connection to a keyless endpoint establishes reachability, not authentication.
- Scope defaults and behavioral claims to the access method, deployed model, and serving configuration actually verified.

## Match the closest sibling page

Read at least three sibling pages, prioritizing those with the same integration surface. Mirror the closest applicable structure and phrasing instead of starting from an abstract template.

A useful shape where it fits is frontmatter, an optional setup video, prerequisites, numbered steps, verification, and related resources. Tabs represent alternate paths to the same step. Do not use them to separate composable features or sequential actions. If the page needs a different shape, explain why.

Check sibling imports and the site's snippet directory before repeating shared content. Example reusable components might include `ListModelIds` and `SelfHostedEndpointNote`. Confirm the actual exports, import paths, and scope before using them. Use a placeholder such as `<model-id>` where the reader must select a value.

## Assess navigation impact

Check relevant discovery surfaces and update only those affected by the change. Example paths in a Mintlify documentation repository include:

- `docs.json`: the existing navigation group and its established order.
- `tools.mdx`: an integration index or card grid. A new page often needs an entry; a wording change usually does not.
- `get-started/overview.mdx`: update only when the integration changes which surface a reader should choose. Avoid duplicating an existing index.
- `skill.md`: an agent-facing capability summary, if present. Assess changes to routes, workflows, commands, settings, permissions, terminology, or supported surfaces. Wording-only edits usually do not require an update.
- `resources/videos.mdx`: update when an embedded setup video changes and the site maintains a separate video index.
- The site's terminology vocabulary: update only when a new proper noun needs an explicit style-check decision.

Cross-check grouping and ordering across the surfaces changed. Do not add a navigation entry merely because a path appears in this list.

## Verify executable claims

For install commands, CLI invocations, and configuration examples, inspect the actual implementation or output where available. Do not assume an install script behaves as its surrounding prose suggests. For CI instructions, check non-interactive behavior and whether the script makes the executable available on `PATH`.

Execute commands when safe, authorized, and useful. Do not run a third-party installation script by default. Separate source inspection from actual execution in the handoff.

Cross-check flags, environment variables, and endpoints against the owning implementation and relevant current CLI or API reference. Confirm that embedded media and external links resolve and match their descriptions.

## Review and hand off

Use [Agent workflows](../../docs-standards/AGENT_WORKFLOWS.md) for editorial review and [Documentation validation](../../docs-standards/DOCS_VALIDATION.md) for mechanical checks. Apply the target repository's actual check requirements; this collection's checker tests do not validate an integration. For a review task, consult [review-docs](../review-docs/SKILL.md) and preserve its read-only scope unless edits were requested.

If the task moves or renames an existing page, assess redirects under the target site's convention. Preserve stable redirect sources, update destinations when appropriate, and avoid self-redirects. Do not create redirects mechanically for every new page.

Report what was checked against live behavior, what was verified in source, what was taken from documentation, and what remains unresolved. List navigation updates and their reasons, along with any remaining `TODO`s.
