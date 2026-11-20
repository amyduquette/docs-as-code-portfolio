---
name: review-docs
description: Review working-tree documentation, a branch diff, or a pull request for accuracy, reader flow, structure, and readiness. Inspect without edits unless the writer requests changes; run final validation only when requested.
---

# Review a docs change

This wraps the repo's own review guidance rather than restating it. Read the [documentation agent instructions](../../docs-standards/AGENT_INSTRUCTIONS.md), [agent workflows](../../docs-standards/AGENT_WORKFLOWS.md), [style guide](../../docs-standards/STYLE_GUIDE.md), and [content architecture](../../docs-standards/CONTENT_ARCHITECTURE.md) before reviewing. For a final review, also read [documentation validation](../../docs-standards/DOCS_VALIDATION.md), which owns the checks that flow runs. `AGENT_WORKFLOWS.md` is the review process, not the whole evidence set. Also read any SME or source material the requester provided and the relevant sibling pages. This skill adds only the parts those files don't cover: how to determine the change's scope and verify claims against their owning sources.

## Determine the scope

The change under review is one of:

- **Uncommitted working-tree edits**: run `git status` and `git diff HEAD` (covers staged and unstaged together; `git diff` alone misses staged changes), and directly inspect any relevant untracked files `git status` surfaces. Otherwise, untracked files can be missed entirely.
- **A branch's diff against its base**: `git diff <base>...<branch>` (or the branch's actual merge base, not just `main` by name, if it was cut from somewhere else).
- **An open PR**: use `gh pr view` / `gh pr diff` for the description, commits, and diff together; check whether a PR already exists for the current branch before assuming there isn't one.

Infer the scope first from the request, current branch, `git status`, and whether a PR is open. Most requests like "review the pending changes" resolve without asking. Ask only when more than one scope remains plausible and the choice would materially change what gets reviewed (for example, the whole branch vs. just the uncommitted edit).

## Determine the mode

Per `AGENT_WORKFLOWS.md`: **iterative review is the default.** Treat a plain request such as "review it," "take a look," or "what do you think" as iterative. Use the rubric there rather than a copy of it, and stick to inspection. Don't run validation tooling during iterative review. `DOCS_VALIDATION.md` defines which checks exist and what each one covers.

**Run the full final-review flow only when the requester explicitly asks for it** (or says something equivalent to "is this ready to merge," "final review," or "run the full checks"). When you do, apply the editorial rubric in `AGENT_WORKFLOWS.md` plus the checks in `DOCS_VALIDATION.md`, then follow the report format and close-out sections in `AGENT_WORKFLOWS.md` exactly as written there. Don't re-list their steps or commands here, since restating them risks drifting out of sync with the source files.

During iterative review, don't rerun the full checklist after every small edit. Inspect the changed content, make the requested adjustment, and wait for the next explicit review ask, per `AGENT_WORKFLOWS.md`'s iterative-review guidance.

## Verify accuracy against the owning source, not the page itself

A page can be internally consistent and still wrong. For any claim the page makes, check it against whatever actually owns that fact rather than treating fluent, well-formatted prose as correct:

- Anything describing product behavior: verify against the owning source repository, released behavior, or a specific technical fact confirmed by a named owner. Existing reference pages establish how the documentation presents behavior, not independent evidence that the behavior is correct. Inspect the source when available and flag the remaining uncertainty when it is not.
- Anything the reader will actually run: don't just read the surrounding prose's description of what a command or script does. Inspect the referenced implementation or output where that's feasible, since docs can describe intended behavior that doesn't match what a script actually does in an edge case (for example, an install script that only updates `PATH` interactively, which no amount of reading its happy-path description would surface).
- Third-party product claims: verify against that product's current docs or UI, not memory or an older doc revision.

Flag unverified claims rather than letting confident phrasing stand in for a check.

## Integration-specific review

For an integration page in the product's own docs, consult the verification and navigation criteria in [add-tool-page](../add-tool-page/SKILL.md). For a contribution to another project's documentation, consult the source-ownership and target-convention criteria in [add-product-to-other-docs](../add-product-to-other-docs/SKILL.md). These criteria supplement review; they do not authorize drafting or editing during a read-only review.

## Report

- Default to read-only findings; apply fixes only when asked, and apply only the findings the requester agreed with.
- Rank findings by severity, most important first, with file/line references.
- State what's wrong and why it matters; suggest a fix only when the correct answer is clear, otherwise flag and ask.
- If there are no findings, say so plainly rather than staying silent or padding the report, and still list any residual risks, unverified claims, or validation that wasn't run (for example, because this was iterative, not final, review).
- On final review specifically, close out per `AGENT_WORKFLOWS.md`'s close-out section as written there.
