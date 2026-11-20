---
name: cli-release
description: Update documentation for a published CLI release by verifying release evidence, assessing affected pages, drafting changes, and coordinating review and validation. Use for release documentation work, not for ordinary wording edits.
---

# Update documentation for a CLI release

Repository names, page paths, issue identifiers, and command names in this skill are fictional examples. Map them to the target product and documentation repositories before using the workflow.

Treat the public `example-org/example-cli` release and changelog as the release signal, not the complete product contract. Verify behavior against the matching `cli/v<version>` tag in `example-org/application-source`. This sample uses `cli/v<version>` in the source repository and `v<version>` in the public repository. Confirm the actual tag mapping before applying the workflow. Treat the public repository's `README.md` as a release-affected user entry point to review, not as product evidence.

Read [Documentation agent instructions](../../docs-standards/AGENT_INSTRUCTIONS.md) and apply the [writing standards](../../docs-standards/STYLE_GUIDE.md) before drafting. Use [documentation validation](../../docs-standards/DOCS_VALIDATION.md) at handoff instead of defining separate checks here.

## Start the release manually

Invoke this skill from your editor or the team's documentation agent when the release notification arrives. Include the public release URL or version. Do not wait for a scheduled poll.

Create or reuse the documentation tracking issue before research, keyed by `cli-release:v<version>`. Use the configured issue-tracker integration only when the task authorizes that write, and never ask the writer to paste a credential into chat. When invoked from team messaging, post the issue, release, and draft pull request links in the originating thread. Never claim that issue creation or reuse succeeded unless the integration returns confirmation. If issue-tracker write access is unavailable, mark intake as blocked and use the durable packet fallback in Step 2.

Name the working branch after the tracking issue identifier (for example, `DOCS-123`), not the `cli-release:v<version>` dedupe key. If no tracking issue identifier is available, use the release version instead (for example, `cli-v1.2.3`) and note this in the pull request description.

Confirm that the session can read the private source repository before drafting product claims. If source access or the exact release tags are unavailable, create a blocked handoff that records the public release URL and body, the known version range, and the missing access or tags. Add the handoff to the tracking issue or originating team messaging thread when available, then stop before drafting product claims or editing docs. Do not use the public changelog as product evidence.

## Step 1: Establish the release range

Record the public release URL and normalize the version to both tag forms:

- Public repository: `v<version>`
- Source repository: `cli/v<version>`

Inspect the current version in `snippets/cli-version.mdx`. Build an ordered release-range table that lists the documented starting version, every intervening published version, and the target version with their public and source tags. Use that table to review every intervening changelog section and every consecutive source tag diff. Do not jump from the documented version to the newest version without accounting for the releases between them.

For each release in the range, copy the public release body verbatim into the packet. Preserve its headings, bullets, wording, and order in a quote or fenced block. Do not label a paraphrase or condensed list as exact; add a separately labeled summary only when it helps the review. An empty body, generic binary boilerplate, or text such as `Internal release` is not evidence that the release has no docs impact. Record the missing public detail, then use the exact source tag diff and source evidence to determine what changed.

Confirm the local source checkout has every tag in the release-range table. Repeat the fetch and commit lookup for each missing tag:

```bash
git -C <source-path> status --short --branch
git -C <source-path> fetch origin refs/tags/cli/v<version-in-range>:refs/tags/cli/v<version-in-range>
git -C <source-path> rev-parse cli/v<version-in-range>
```

The checked-out source branch does not need to be current, clean, or switched to the release. Fetch only the missing release tags, and leave the writer's branch and working tree untouched. Tag-to-tag reads remain independent of local uncommitted changes.

Inspect each consecutive tag pair from the release-range table, not the current branch:

```bash
git -C <source-path> diff --stat cli/v<older-version>..cli/v<newer-version>
git -C <source-path> diff --name-status cli/v<older-version>..cli/v<newer-version>
git -C <source-path> log --oneline cli/v<older-version>..cli/v<newer-version>
```

Scope the first source pass to the public CLI and agent behavior surfaces:

```bash
git -C <source-path> diff --name-status cli/v<older-version>..cli/v<newer-version> -- cmd/example pkg/cli pkg/config pkg/agent
```

Read every changed user-facing file under `cmd/example` and `pkg/cli`, even when its terms do not appear in the changelog. This catches omitted changes to UI labels, defaults, paths, errors, and command behavior. Follow relevant changes into `pkg/config`, `pkg/agent`, installer scripts, or other packages. Ignore unrelated monorepo changes only after confirming they cannot affect the released CLI.

Check the diff for `resources/bundled-skills/`. Skills under that path ship inside the binary and reach users as product guidance, so treat a change there as a user-visible change and record it in the packet, not as an internal refactor.

A clean or current source branch does not prove what shipped. If the matching source tag remains unavailable after the fetch attempt, mark the release unverified, follow the blocked-handoff procedure above with the missing tag, and stop. Do not use `main` or the local working tree as a substitute.

## Step 2: Build the release packet

Create the packet before editing docs. Add one metadata row for every release in the reviewed range:

| Public version and URL | Published date | Release body status | Changelog section status | Source tag | Source commit |
|---|---|---|---|---|---|
| | | | | | |

Record the released binary version separately when tested, with the `example --version` output as evidence.

Keep a working copy wherever the host supports it, then preserve a sanitized packet in a durable location:

- Use the tracking issue when available.
- Use the originating team messaging thread when the release started there and issue tracker is unavailable.
- Otherwise, add it to the draft pull request description or a pull request comment at handoff.

Use a temporary or local file only as the working copy, never as the sole record. Preserve release URLs, tags and commits, evidence dispositions, the impact matrix, open questions, findings, and validation state. Omit private code excerpts and sensitive details. If work stops before a pull request exists, include the sanitized packet in the handoff to the writer.

Add one row for each user-visible change and each changelog claim:

| Change | Exact behavior and constraints | Source evidence | Runtime or test evidence | Docs impact | Status |
|---|---|---|---|---|---|
| | | | | | |

Use these statuses:

- **VERIFIED**: The exact source release tag, a test or released binary, or a named owner supports the behavior and any public availability claimed in the proposed docs impact.
- **CHANGELOG ONLY**: The changelog identifies the change, but the exact source tag, a test, a released binary, or a named owner does not verify its user-visible details. Never use this status for a row that cites verifying source or test evidence.
- **UNVERIFIED**: Sources conflict, do not establish the behavior, or do not establish that an implemented surface is publicly supported. Leave a specific `TODO` or pause that edit.

Make the status agree with the evidence and docs action. Do not plan a public edit from a `CHANGELOG ONLY` or `UNVERIFIED` row. If implementation is verified but public support is not, describe that distinction in the evidence and use `UNVERIFIED` for the proposed public claim.

Inspect implementation, tests, command help, UI labels, defaults, error paths, platform conditions, migrations, and removals that affect the user. For a new configuration surface or capability, capture the supported values or events, inputs and outputs, defaults, scope, precedence or merge behavior, error and failure behavior, platform conditions, and safety constraints needed to draft trustworthy guidance. Record exact source file paths and the release-tag commit in the packet. Do not cite internal source paths in end-user docs.

Treat commands, flags, settings, and capabilities marked hidden, development-only, experimental in source only, internal, or not user-facing as implementation details, even when they exist in a release tag. Record them in the packet with `no change` for public docs. Document them only when the public release body, visible released command help or UI, or a named product owner explicitly confirms public support. A release commit title or callable hidden command alone does not establish that support.

Resolve questions from the exact release source, tests, released behavior, and current docs before asking the writer. Keep an open question only when sources conflict, safe verification is unavailable, or the remaining choice is an editorial or product-policy decision the writer owns. Do not turn a source-resolvable fact into a writer confirmation task.

## Step 3: Build the page inventory

Inspect these files for every release and record `edit`, `rendered by snippet`, or `no change` in the impact matrix:

- `snippets/cli-version.mdx`: Update to the newest reviewed public release. It renders in `cli/overview.mdx`, `cli/install.mdx`, `cli/interactive-mode.mdx`, `cli/automated-mode.mdx`, `cli/cli-reference.mdx`, and `cli/troubleshooting.mdx`.
- `cli/cli-reference.mdx`: Commands, flags, slash commands, shortcuts, settings entry points, and exit codes.
- `cli/interactive-mode.mdx`: Terminal UI, prompts, context, selectors, status line, modes, permissions, sessions, logs, and feedback.
- `cli/automated-mode.mdx`: `example exec`, input, output, continuation, sandbox, and non-interactive behavior.
- `cli/install.mdx`, `get-started/quickstart.mdx`, and `get-started/log-in.mdx`: Installation, updates, authentication, environment variables, local paths, and first-run UI labels.
- `cli/overview.mdx`, `cli/integrations.mdx`, and `cli/troubleshooting.mdx`: Product overview, ACP client behavior, recovery, errors, and diagnostics.
- `cli/settings.mdx`: Configuration keys, accepted values, defaults, precedence, migrations, and paths.
- `skill.md`: Agent-facing commands, workflows, terminology, constraints, and documentation routes. If the project versions this guide, update its version according to the repository policy.
- `example-org/example-cli/README.md` on `main`: Public installation, quick-start, modes, commands, settings, integrations, and UI labels. Compare it with the release packet and record `no change` or `follow-up draft`. Do not include this cross-repository file in the `docs-repository` pull request.
- The built-in skill that ships inside the CLI, `resources/bundled-skills/cli-product-reference/SKILL.md` in source: Agent-facing product claims, commands, terminology, and documentation routes that reach users through the binary rather than through the docs site. Read it at the target release tag, compare it with the release packet, and record `no change` or `follow-up draft`. A release can change this file, and its guidance can contradict the docs even when the release left it untouched. Do not include this cross-repository file in the `docs-repository` pull request. This review is separate from the routing decision below; neither one satisfies the other.

Inspect these conditional groups when the release touches the named surface:

- Configuration and execution controls: `cli/configuration.mdx`, `cli/permissions.mdx`, `cli/sandboxes.mdx`, and any affected extension or credential guidance.
- Editor integrations: `integrations/editors.mdx` and any affected editor-specific pages.
- Automation: `integrations/automation.mdx`, `cli/automated-mode.mdx`, and related workflow examples.
- Cross-surface entry points: `get-started/overview.mdx`, `configure.mdx`, and `support/overview.mdx`.
- Source bootstrap routing: `resources/bundled-skills/cli-product-reference/SKILL.md` in source, only when canonical docs paths or topic coverage change. Ordinary wording fixes do not require an update.
- Documentation terminology: `docs-standards/STYLE_GUIDE.md` when the release introduces, renames, splits, or redefines terms used across multiple pages or product surfaces.

Follow the repository's release-note policy. Record whether a release needs a new entry, a correction to an existing bundled version, or no change. Treat existing entries as point-in-time records and change a bundled version only to correct a historical fact.

Search the whole docs repository for:

- The new and previous version numbers
- New, renamed, deprecated, and removed commands, flags, slash commands, shortcuts, settings keys, UI labels, and error text
- Feature names and aliases from the changelog and source diff
- Terms used only by the previous behavior, even when the new identifier does not appear on the page

Use prior Example CLI docs pull requests as coverage clues, not as product truth.

Before proposing a new page, identify the reader's goal and explain why an existing page cannot serve it. Keep the page action as `proposed` until the packet contains enough verified behavior and constraints to draft it. If the release requires a new page, add impact-matrix rows for:

- The new page and its content type
- `docs.json` navigation or `hidden: true` inclusion
- The parent overview or chooser page that helps readers find it
- `config/redirects.json` when the page needs a stable product-facing URL
- `skill.md` when agent-facing routes or guidance change
- The source `cli-product-reference` bootstrap skill when the new path or topic coverage changes its routing

Record `no change` for each dependency that does not need an edit. Do not mark bootstrap routing unchanged solely because it matched the docs before the new page was proposed.

## Step 4: Create the impact matrix

List every inspected page before editing:

| Page | Why it changes or stays unchanged | Packet evidence | Action | Status |
|---|---|---|---|---|
| | | | Edit, rendered by snippet, no change, follow-up draft, or proposed new page | |

Record explicit no-change decisions. Distinguish the one edited version snippet from the six pages that render it so reviewers can see the full reader impact without expecting duplicate edits.

## Step 5: Draft current guidance

Update current-state pages from the packet and matrix. Translate implementation details into the user's task and preserve exact commands, flags, values, UI labels, limits, and platform conditions.

The packet's vocabulary is evidence, not phrasing. Struct fields, function names, internal flags, and other source identifiers exist to source a claim, not to describe it to a reader. Write the reader-facing sentence in terms of what they can do and observe, even when the packet only has the internal term for it.

- Update the shared version note for every reviewed public release, including releases with no other docs impact.
- Document only behavior available in the target public release. Do not pull later behavior from source `main`.
- Do not turn internal refactors or performance work into user-facing claims unless users can observe or act on the change.
- Do not copy a concise changelog bullet into procedural guidance until its behavior and constraints are verified.
- Add a specific inline `TODO` for unresolved facts. Do not guess or silently omit a known gap.
- Update existing pages instead of creating a duplicate. Change `docs.json` or redirects only when a page is added, moved, or renamed.
- Keep release evidence in the packet, tracking issue, or pull request. Do not mention the internal source repository or local verification workflow in public docs.

If the public `example-org/example-cli` README is stale, add a separate **CLI README follow-up** to the release packet with:

- The affected heading and current text or line reference
- The verified release behavior that makes it stale
- A concise proposed replacement or patch
- The user impact and recommended priority

Add the follow-up to the tracking issue and, when invoked from team messaging, link or summarize it in the originating thread. Drafting this recommendation is the default. Do not edit the public repository or open a pull request there unless the writer explicitly authorizes that separate change for the release. If authorized, keep it in a separate `example-org/example-cli` branch and draft pull request from the `docs-repository` work.

If the built-in `cli-product-reference` skill is stale, add a separate **CLI product reference follow-up** to the release packet with:

- The affected heading and current text or line reference at the target release tag
- The verified release behavior or current docs state that makes it stale
- A concise proposed replacement or patch
- The user impact and recommended priority

Add the follow-up to the tracking issue and, when invoked from team messaging, link or summarize it in the originating thread. Drafting this recommendation is the default. Do not edit source or open a pull request there unless the writer explicitly authorizes that separate change for the release. If authorized, keep it in a separate source branch and draft pull request targeting the appropriate future release branch or `main`. Never amend the release tag.

If a tracking issue exists, add the release packet, impact matrix, open questions, and current review state to it. Do not open the draft pull request until the independent review and validation gates in Step 6 pass.

## Step 6: Review, validate, and hand off

Repeat the repository-wide searches for every new and retired identifier. Confirm that:

- The shared version note matches the newest release in the packet.
- Every changelog claim has a packet row and disposition.
- Every packet status agrees with its evidence, and no public edit depends on a `CHANGELOG ONLY` or `UNVERIFIED` row.
- Hidden, development-only, internal, and source-only experimental surfaces have `no change` unless explicit public-support evidence is recorded.
- Every core page has an impact-matrix row.
- The public `example-org/example-cli` README has a `no change` decision or a separate follow-up draft.
- The CLI's built-in `cli-product-reference` skill has a `no change` decision or a separate follow-up draft, recorded from reading the file at the release tag rather than inferred from the changelog.
- Every proposed new page has explicit navigation, discovery, redirect, and agent-routing decisions.
- Conditional pages and the source bootstrap routing skill have explicit decisions.
- Reusable terminology introduced or changed by the release has an explicit `docs-standards/STYLE_GUIDE.md` decision.
- No current-state page documents behavior newer than the target release.
- Unverified claims remain visible as `TODO` items or open questions.
- Every remaining open question requires unavailable evidence or a writer-owned editorial or product-policy decision.

### Run the independent review loop

Keep the workflow portable. Define agent roles and evidence requirements without depending on a specific agent product or review orchestrator.

The primary agent owns the release packet, docs edits, finding dispositions, validation, and draft pull request. After drafting, use the current host's native delegation capability to start a fresh reviewer subagent. Disable inherited author conversation or history when the host supports context isolation. Keep the reviewer read-only when the host supports per-agent permissions.

Give the reviewer only the required review inputs:

- The target public and source tags
- The owning source paths or runtime evidence needed to verify claims
- The current docs diff, including relevant untracked files
- The release packet and impact matrix
- [Documentation agent instructions](../../docs-standards/AGENT_INSTRUCTIONS.md), the `review-docs` skill and writing standards, and their required standards

Treat the packet and impact matrix as permitted review inputs even though these authored artifacts can include evidence dispositions and planned docs actions. Do not add separate author reasoning, an intended answer, suspected findings, or a prior diagnosis. Ask the reviewer to inspect the source and diff before comparing them with the packet and matrix, verify product claims, coverage, reader flow, structure, and terminology independently, then return numbered findings with file and line references or state `no findings`.

Record the current review round and each finding in the tracking issue or release packet. Give every finding one status: `open`, `resolved`, `accepted risk`, or `disputed`. The primary agent resolves each finding or records an evidence-backed dispute. Send the changed artifact and prior findings back to the reviewer for rereview. Repeat until no findings remain open. Do not reopen resolved findings without new evidence.

Escalate to the writer when sources conflict, the same finding remains after two author-resolution rounds, any finding remains open after three reviewer rounds, or the decision is editorial or product policy rather than testable behavior. Only the writer can mark a finding `accepted risk` or resolve a policy dispute.

For an unusually broad, high-risk, or disputed release, use a second fresh reviewer for the final diff after the regular reviewer reports no findings.

If the current host cannot start an independent reviewer, record `independent review: unavailable` and stop before opening the draft pull request. Provide a handoff containing the packet, impact matrix, diff, review rubric, open questions, and validation state. Do not let the primary agent's self-review satisfy the independent-review gate.

After the reviewer reports no findings, run the handoff checks required by [checker coverage](../../workflows/link-checker/README.md). Open the draft pull request only when:

- No review finding remains open or disputed.
- No unsupported public claim remains in the draft.
- Required validation passes.

Follow the target documentation repository's branch and pull request conventions, using the branch-naming rule above. Add the draft pull request link and validation results to the tracking issue and, when invoked from team messaging, to the originating thread. Report unresolved facts and the release and source commits reviewed. Never merge automatically.

## Guardrails

- Do not use source `main` or the local working tree as evidence for an exact release when the `cli/v<version>` tag exists.
- Do not publish detailed behavior from the public changelog alone.
- Do not treat an empty, boilerplate, or internal-only public release body as a no-change result.
- Do not skip intervening releases when the docs version lags.
- Do not treat current docs or old release notes as product sources.
- Do not publish a hidden, development-only, internal, or source-only experimental surface without explicit evidence that it is publicly supported.
- Do not create a page without recording its navigation, discovery, redirect, and agent-routing dependencies.
- Do not pass the author's reasoning or diagnosis to an independent reviewer beyond the recorded packet and impact-matrix dispositions.
- Do not substitute primary-agent self-review for the independent-review gate.
- Do not open the draft pull request while findings remain open or disputed, required validation fails, or independent review is unavailable.
- Do not overwrite unrelated user changes in any repository.
- Do not edit `example-org/example-cli` or open a pull request there without explicit authorization for that release.
- Do not hide a missing source, contradictory behavior, or uncertain release boundary.
