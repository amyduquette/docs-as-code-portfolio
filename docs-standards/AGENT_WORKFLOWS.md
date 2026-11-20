# Documentation agent workflows

This file owns editorial review: how to judge whether a page is written for the reader and whether it is any good. It is the rubric for both a human asking an agent to review a draft and any automated reviewer running on a pull request, so both judge by the same standard.

Two things live elsewhere and are not repeated here. `docs-standards/DOCS_VALIDATION.md` owns the mechanical checks, their commands, and what CI covers. `docs-standards/STYLE_GUIDE.md` and `docs-standards/CONTENT_ARCHITECTURE.md` own voice, terminology, formatting, page types, and navigation.

## How the work goes

1. **Draft** from source information the writer provides or that you verified. Do not invent product behavior.
2. **Review** against the rubric below.
3. **Report** findings and uncertainties. Do not silently fix disputed or unrelated issues.
4. **Hand off**. Technical readiness belongs to `DOCS_VALIDATION.md`.

The same rubric applies whether you are reviewing a local draft in an editor or a pushed pull request.

## Review modes

**Iterative review is the default.** Treat a plain request such as "review it," "take a look," or "what do you think" as a content review by inspection. Do not run validation tooling.

**Final review** happens only when the writer explicitly asks for it, or says something equivalent to "is this ready to merge" or "run the full checks." It is the rubric below plus the checks in `DOCS_VALIDATION.md`.

During rapid back-and-forth editing, do not rerun the full review after every small edit. Inspect the changed content, make the requested adjustment, and wait for the writer to ask for another pass.

## Evidence and decisions

For claims about executable behavior, hosted systems, or third-party integrations, run or probe the behavior when it is safe and feasible. Reading documentation or source code can confirm a contract or implementation, but it does not prove runtime behavior. When execution is not reasonable, inspect the owning source and state what remains inferred or unverified.

Agreement between agents is not validation. Say what you observed and how you verified it when evidence affects a finding or approval.

Separate testable claims from preference and tradeoff decisions. Present the evidence and tradeoffs, then let the human writer decide. Do not reopen a settled decision without new evidence or a material change in scope.

Before asking the writer to verify something, run the safe checks and inspect the sources available to you. Ask for help only when the required access, intent, or decision belongs to the writer.

## Multi-agent reviews

Use multiple agents when distinct review perspectives materially help. Assign one implementer, one evidence verifier, one optional breadth or reader reviewer, and one chair. Roles belong to the task, not permanently to an agent, and the human writer remains the decision owner.

Default to one findings round, one implementation round, and one rereview. Add another round only when new evidence or an unresolved blocking issue requires it. After the first report, contribute only new evidence, an objection, or a changed conclusion. Do not repeat another reviewer's finding or approval without independent evidence or material disagreement.

The chair closes with the decisions, owners, unresolved questions, and validation status.

## The rubric

Judge every page against these. They are also what counts as a real finding when you report.

- **Reader flow**: Read as a first-time user. Does the page answer "Why am I here," "What do I need," "What do I do next," and "How do I know I succeeded?"
- **User focus**: Does the page explain what the reader can do, why it matters to them, and how it gets them to their goal? Content framed around what the product does internally is a finding unless that detail changes the reader's decision.
- **Accuracy**: Are claims verified against source material, or flagged with `TODO`? Incorrect, misleading, or contradictory statements about product behavior are the most serious finding available.
- **Task structure**: For task pages, are there Prerequisites and Steps? Is the workflow clear and in the right order? Check against the task flow rules in `CONTENT_ARCHITECTURE.md`.
- **Clarity**: Is anything confusing, or does it assume knowledge the reader will not have?
- **Terminology**: Does it match `STYLE_GUIDE.md`, and is it internally consistent?
- **Structure and style**: Sentence-case headings, descriptive links, language identifiers on code blocks, and the reader-facing structure `STYLE_GUIDE.md` defines. Losing a useful reader aid is a finding.
- **Grammar and mechanics**: Broken lists, malformed sentences, missing punctuation.
- **Agent-facing artifacts**: If the change affects navigation, workflows, commands, settings, permissions, terminology, or supported product surfaces, does `skill.md` need an update? See `CONTENT_ARCHITECTURE.md` for skill maintenance rules.
- **Docs operations**: If the change alters how docs operations work, including repo-local workflow guidance, skills, automations, or recurring loops, does `DOCS_OPERATIONS.md` need an update?

## Judgment calls

- Treat one reader's confusion as a signal, not a mandate. Before adding explanatory text, work out whether the confusion came from missing information, poor placement, an ambiguous example, or unclear structure.
- Prefer fixes that make the correct path natural for everyone: better headings, example placement, labels, links. Avoid defensive clarifications that only make sense to someone who saw the support thread that caused them.
- After changing content in response to a specific question, reread it without that context. If it reads like it is arguing with a misunderstanding rather than helping the next reader, simplify it.
- Preserve useful author intent. Do not remove valid reader aids or precise terminology just because a simpler form exists. If wording seems deliberately technical or unusual, ask before simplifying.
- After the writer pushes back twice on the same kind of change, stop patching and ask what principle should drive the decision.
- Skip style preferences not grounded in the style guide, minor rewrites that do not affect accuracy or clarity, and anything already marked `TODO` and acknowledged.

## Uncertainty

If repository content, code behavior, or product details are unclear, inspect the source material first.

While drafting, if something is still unverified, leave an inline `TODO` with a specific question rather than guessing or quietly omitting the gap: `{/* TODO: confirm whether X requires Y to be enabled first */}`

While reviewing, report the uncertainty and let the author decide whether to verify it. Do not edit unverified content unless asked.

## Reporting

- One finding per item, numbered, with file and line. Number questions to the writer too. "Skip 2 and 4" should be a usable reply.
- Ranked by severity, most important first
- Say what is wrong and why it matters
- Suggest a fix only when the right answer is clear; otherwise flag and ask
- If there are no findings, say so plainly rather than padding. Still list residual risks, unverified claims, and any validation that was not run

Keep each finding as short as it can be without losing anything that changes what the reader does. Cut words, not facts: file paths, exact terms, commands, caveats, and the reason something matters all stay. When brevity and completeness conflict, completeness wins. Do not open with a summary of what you are about to say or close by restating what you just said.

After a final review, close out by summarizing what the writer needs to act on:

- Contradictions between source material, product behavior, and existing docs that were flagged but not resolved
- Coverage gaps or missing pages that surfaced
- Terminology that looked unstable and needs a canonical decision
- Priority or roadmap questions affecting docs coverage or sequencing
- Unverified claims that need source review

Also flag anything learned that should update `AGENTS.md` or `docs-standards/`, such as a new pattern, a terminology decision, or a reusable convention.
