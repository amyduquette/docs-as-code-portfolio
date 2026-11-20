---
name: writing-docs
description: Apply shared writing, terminology, and content-architecture standards to documentation pages, agent instructions, and skill files. Use when drafting or editing; also consult these standards during a review.
---

# Write documentation

Use this skill with the project's maintained standards. In this collection, the linked standards are adapted samples; site-specific files such as a root `skill.md` refer to the documentation project where the workflow is applied.

## Source of truth

Read these files before substantial docs work:

- [Documentation agent instructions](../../docs-standards/AGENT_INSTRUCTIONS.md)
- [style guide](../../docs-standards/STYLE_GUIDE.md)
- [content architecture](../../docs-standards/CONTENT_ARCHITECTURE.md)
- [agent workflows](../../docs-standards/AGENT_WORKFLOWS.md)
- [documentation validation](../../docs-standards/DOCS_VALIDATION.md)
- [documentation operations](../../docs-standards/DOCS_OPERATIONS.md)
- [checker coverage](../../workflows/link-checker/README.md)
- [workflow notes](../../workflows/README.md)

## Start from the reader's goal

Before drafting, identify:

- What the user is trying to accomplish on this page
- What a successful outcome looks like
- Where the user is likely to get stuck, give up, or make a wrong assumption
- For setup and onboarding content, what a successful first integration looks like

Use those answers to decide what belongs on the page and what should be linked out.

## Style and formatting

Full rules in [style guide](../../docs-standards/STYLE_GUIDE.md).

Key rules:

- Active voice, present tense, second person ("you")
- Sentence-case headings, no trailing punctuation
- Angle-bracket placeholders with lowercase hyphenated names
- Language identifiers on all fenced code blocks
- No `$` in command examples
- Em dashes sparingly; prefer restructuring the sentence
- Use established terminology from the style guide when it exists
- Do not silently normalize unstable or ambiguous product terminology

## Content architecture

Full guidance in [content architecture](../../docs-standards/CONTENT_ARCHITECTURE.md).

Key rules:

- Choose the page type from the reader's goal. For blended feature pages, give each procedure its own prerequisites and numbered steps
- Only include template sections you have content for
- Insert `TODO` comments for missing details, do not guess
- Prioritize the path to first success over covering every capability
- If the target project maintains a root-level `skill.md`, review it when docs changes affect agent guidance, including navigation, workflows, commands, settings, permissions, terminology, or supported product surfaces. `skill.md` summarizes canonical docs for agents; it is not a separate source of product truth.
- Review `workflows/README.md` when the task changes how docs operations work, including automations, planning loops, agent workflows, skills, pipelines, or recurring docs operations.

## Default self-review

Follow the rubric in [agent workflows](../../docs-standards/AGENT_WORKFLOWS.md) before you finish a draft or edit.

By default, review by inspection against that rubric, running no tooling during drafting or iterative review. At handoff on an authored change, and for requested or final validation, follow [checker coverage](../../workflows/link-checker/README.md).

When drafting, add inline `TODO` comments for unverified behavior. When reviewing, report uncertainty unless the user asks you to edit.

## Accuracy and trust

- Do not invent product behavior.
- Do not oversimplify behavior that is conditional, inconsistent, or operationally important.
- If source material, product behavior, and existing docs disagree, flag the contradiction instead of choosing the smoothest wording.
- Validate meaning before polishing phrasing.
