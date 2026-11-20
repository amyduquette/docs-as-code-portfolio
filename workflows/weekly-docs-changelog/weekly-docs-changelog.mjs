#!/usr/bin/env node
// Weekly reader-impact post for the documentation team.
//
// Reads docs PRs merged in the last seven days, asks a model what
// changed for readers, and posts a focused note to Slack. The model includes
// every meaningful reader outcome and omits minor edits. No counts, no process
// detail, no roadmap. It answers "what got better for people reading the docs,"
// not "what did the docs team do."
//
// Reader analytics are a separate workflow. This one reads only merged PRs.

import { pathToFileURL } from 'node:url';

import {
  formatDateRange,
  githubJson,
  githubPaginated,
  parseJsonObject,
  runModelChatCompletion,
  requireEnv,
  truncate,
} from '../shared/docs-automation-lib.mjs';
import { docsAutomationInstructions } from '../shared/docs-automation-prompts.mjs';

const WINDOW_DAYS = 7;
// Cap reader-facing PRs after file filtering so non-reader-facing merges cannot
// crowd out changes readers would notice. This also ensures every included PR
// can be given a real evidence share within MAX_PATCH_CHARS_TOTAL.
const MAX_PRS = 20;
const MIN_PATCH_SHARE = 600;
// Readers see the combined site, which is built from both of these.
const BASE_BRANCHES = ['main', 'release/product'];
const MAX_PATCH_CHARS_PER_FILE = 1800;
const MAX_PATCH_CHARS_TOTAL = 12000;
// Slack truncates text messages above 40,000 characters. Keep a margin so a
// significant week can be complete without risking silent truncation.
const MAX_SLACK_MESSAGE_CHARS = 39000;

const DOCS_BASE_URL = 'https://docs.example.com';
const DOCS_URL_PREFIX_BY_BASE = new Map([
  ['main', ''],
  ['release/product', '/product'],
]);

// Paths that never change what a reader sees.
const NON_READER_PATHS = [
  '.github/',
  '.agents/',
  '.claude/',
  '.codex/',
  '.vendor-agent/',
  'docs-standards/',
  'scripts/',
  'AGENTS.md',
  'CONTRIBUTING.md',
  'README.md',
  'skill.md',
  'package.json',
  '.vale.ini',
  'vale.full.ini',
  '.valeignore',
  '.gitignore',
  'Dockerfile',
  'Caddyfile',
];

function isDryRun() {
  // Posting requires an explicit false value. Missing or malformed values stay safe.
  return String(process.env.DRY_RUN || 'true').toLowerCase() !== 'false';
}

// Use a full timestamp instead of a date-only cutoff. A date-only cutoff starts
// at midnight and can re-report changes from the first day of the window.
function windowStartIso(dateTo) {
  return new Date(dateTo.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .replace(/\.\d{3}Z$/, 'Z');
}

function isReaderFacing(filename) {
  return !NON_READER_PATHS.some((prefix) => filename.startsWith(prefix));
}

function collectPublishedPagePaths(value, paths = new Set()) {
  if (!value || typeof value !== 'object') return paths;

  if (Array.isArray(value)) {
    for (const item of value) collectPublishedPagePaths(item, paths);
    return paths;
  }

  for (const [key, child] of Object.entries(value)) {
    if (key === 'pages' && Array.isArray(child)) {
      for (const page of child) {
        if (typeof page === 'string') paths.add(page);
        else collectPublishedPagePaths(page, paths);
      }
    } else {
      collectPublishedPagePaths(child, paths);
    }
  }
  return paths;
}

async function loadPublishedPagePaths(repo) {
  const pathsByBase = new Map();
  for (const base of BASE_BRANCHES) {
    const result = await githubJson(
      `/repos/${repo}/contents/docs.json?ref=${encodeURIComponent(base)}`,
    );
    if (result?.type !== 'file' || result.encoding !== 'base64' || !result.content) {
      throw new Error(`Could not read docs.json from ${base}.`);
    }
    const contents = Buffer.from(result.content, 'base64').toString('utf8');
    pathsByBase.set(base, collectPublishedPagePaths(JSON.parse(contents)));
  }
  return pathsByBase;
}

// Slugs in this repo match file paths exactly: no page sets a custom `slug`
// frontmatter field, and the only index.mdx is the site root. If either of
// those stops holding, this mapping needs to account for it.
function toDocsUrl(filePath, base) {
  if (!filePath.endsWith('.mdx')) return null;
  const prefix = DOCS_URL_PREFIX_BY_BASE.get(base);
  if (prefix === undefined) return null;
  const slug = filePath.slice(0, -'.mdx'.length);
  if (slug === 'index' && !prefix) return DOCS_BASE_URL;
  return `${DOCS_BASE_URL}${prefix}/${slug}`;
}

function linkableDocsPaths(pr, publishedPathsByBase) {
  const published = publishedPathsByBase.get(pr.base);
  if (!published) return [];

  return [
    ...new Set(
      pr.changes
        .filter((change) => change.status !== 'removed' && change.path.endsWith('.mdx'))
        .map((change) => change.path)
        .filter((path) => published.has(path.slice(0, -'.mdx'.length))),
    ),
  ];
}

function evidencePriority(file) {
  if (file.status === 'added' || file.status === 'removed') return 2;
  if (file.status === 'renamed') return 1;
  return 0;
}

// GitHub returns files in path order. Put structural changes and larger patches
// first so each PR's guaranteed evidence share represents its substantive work.
function prioritizeEvidence(files) {
  return [...files].sort((a, b) => {
    const statusDifference = evidencePriority(b) - evidencePriority(a);
    if (statusDifference !== 0) return statusDifference;

    const patchDifference = String(b.patch).length - String(a.patch).length;
    if (patchDifference !== 0) return patchDifference;

    return a.filename.localeCompare(b.filename);
  });
}

// Hard cap. The shared truncate helper appends a marker past the requested
// limit, which would make the budget arithmetic below overshoot.
function clipPatch(patch, maxChars) {
  const text = String(patch || '');
  if (text.length <= maxChars) return text;
  const marker = '\n[clipped]';
  // Too little room left to say anything useful. Returning the marker alone
  // would cost more characters than the caller allowed.
  if (maxChars <= marker.length) return '';
  return `${text.slice(0, maxChars - marker.length)}${marker}`;
}

// Search by merge date rather than paging the list endpoint. The list endpoint
// can only sort by updated, so an old PR touched this week sorts ahead of real
// merges and would truncate the scan.
async function findMergedPrNumbers(repo, since) {
  const found = new Map();
  for (const base of BASE_BRANCHES) {
    const query = `repo:${repo} is:pr is:merged base:${base} merged:>=${since}`;
    const result = await githubJson(
      `/search/issues?q=${encodeURIComponent(query)}&per_page=100&sort=updated&order=desc`,
    );
    for (const item of result.items || []) {
      found.set(item.number, {
        number: item.number,
        title: item.title,
        body: item.body || '',
        mergedAt: item.closed_at || '',
        base,
      });
    }
  }
  // Sort across branches before inspecting files. Appending platform results
  // after main would otherwise prioritize main regardless of merge time.
  return [...found.values()].sort((a, b) => (a.mergedAt < b.mergedAt ? 1 : -1));
}

async function collectReaderFacingPrs(repo, since) {
  const candidates = await findMergedPrNumbers(repo, since);

  const withFiles = [];
  for (const pr of candidates) {
    const files = await githubPaginated(`/repos/${repo}/pulls/${pr.number}/files`, 300);
    // A patch is the evidence. Without one the prompt forbids using the title
    // or path, so the PR could not contribute a claim anyway.
    const readerFiles = prioritizeEvidence(
      files.filter((f) => isReaderFacing(f.filename) && f.patch),
    );
    if (readerFiles.length > 0) {
      withFiles.push({ ...pr, readerFiles });
      if (withFiles.length >= MAX_PRS) break;
    }
  }
  if (withFiles.length === 0) return [];

  // Two passes so a busy branch cannot starve the others. Spending the budget
  // in arrival order let every platform PR reach the model with no evidence.
  // The share is derived from the PR count so pass one always fits the budget.
  const share = Math.min(
    MAX_PATCH_CHARS_PER_FILE,
    Math.max(MIN_PATCH_SHARE, Math.floor(MAX_PATCH_CHARS_TOTAL / withFiles.length)),
  );
  let budget = MAX_PATCH_CHARS_TOTAL;

  const collected = [];
  for (const pr of withFiles) {
    if (budget < MIN_PATCH_SHARE) break;
    const first = pr.readerFiles[0];
    const patch = clipPatch(first.patch, Math.min(share, budget));
    budget -= patch.length;
    collected.push({
      number: pr.number,
      title: pr.title,
      body: truncate(pr.body, 1200),
      base: pr.base,
      changes: [{ path: first.filename, patch, status: first.status }],
      remaining: pr.readerFiles.slice(1, 8),
    });
  }

  // Round-robin the remainder so extra evidence spreads across PRs.
  for (let i = 0; budget > 0; i += 1) {
    let placed = false;
    for (const pr of collected) {
      if (budget <= 0) break;
      const file = pr.remaining[i];
      if (!file) continue;
      const patch = clipPatch(file.patch, Math.min(MAX_PATCH_CHARS_PER_FILE, budget));
      if (!patch) continue;
      budget -= patch.length;
      pr.changes.push({ path: file.filename, patch, status: file.status });
      placed = true;
    }
    if (!placed) break;
  }

  return collected.map(({ remaining, ...pr }) => pr);
}

const WORKFLOW_PROMPT = `Write this week's update for readers of the documentation site.

Audience: people who read the documentation. Not the docs team, not managers.

Return JSON:
{
  "summary": "One sentence naming the net result for readers this week.",
  "items": [
    {
      "text": "A short scannable fragment naming the reader-visible improvement.",
      "prNumbers": [123],
      "docPath": "tools/openclaw.mdx",
      "docPrNumber": 123
    }
  ],
  "skip": false
}

Rules:
- Write each item as a clipped fragment, not a full sentence. Lead with the
  topic, then the outcome. Cut "is now documented," "has been added," and
  similar filler. Make the topic clear in the first few words.
  Good: "OpenClaw integration: end-to-end setup with a walkthrough video."
  Bad: "Connecting an editor to the model API is now documented end to end
  with a setup video and prerequisites."
- Base every claim on the diffs provided. Do not infer product behavior from a
  title or file path alone. If the evidence does not support a claim, leave it out.
- Give each item every source PR number that supports its claim. Use only PR
  numbers supplied in the input. Do not put PR numbers in the item text; the
  workflow adds links after validating them.
- Set docPath to one exact path from a cited PR's Linkable docs pages list that
  best matches the item, and set docPrNumber to that PR. Set both to null when
  no listed page matches. If one PR has separate reader outcomes on different
  pages, return separate items with the matching docPath for each outcome.
- Group related PRs into one item when they contribute to the same reader outcome.
  If a follow-up PR refines or corrects an earlier change in this window, describe
  the final outcome and cite both PRs. Do not combine unrelated changes.
- Never mention file paths in item text, counts, or the writing process.
- Never describe internal repository structure or tooling.
- Include every meaningful reader-visible improvement supported by the evidence.
  Do not enforce a fixed item count.
- Omit typo fixes, minor wording changes, navigation-only changes, metadata-only
  changes, and internal tooling changes.
- If nothing merged this week meaningfully changed the reader experience, set
  "skip" to true and return an empty items array.
- Plain language. No marketing tone.`;

// Enforce the shape and per-line length the prompt asks for. One
// multi-paragraph item would defeat the point of a focused post.
// Hard cap, not the shared truncate helper: that one appends a "[truncated N
// characters]" marker and a blank line, which is useful in a prompt and wrong
// in a Slack post.
function normalizeLine(text, maxChars) {
  const flat = String(text).replace(/\s+/g, ' ').trim();
  if (flat.length <= maxChars) return flat;
  return `${flat.slice(0, maxChars - 1).trimEnd()}…`;
}

// Model output derives from PR-authored text, so neutralize the three characters
// Slack uses for mentions and links before it reaches a channel.
function escapeSlack(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function normalizeItems(
  values,
  prsByNumber,
  publishedPathsByBase,
  warn = console.warn,
) {
  if (!Array.isArray(values)) throw new Error('Model returned invalid items.');
  const validPrNumbers = new Set(prsByNumber.keys());

  return values.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(`Model returned invalid item ${index + 1}.`);
    }
    const text = normalizeLine(item.text || '', 110);
    if (!text) throw new Error(`Model returned item ${index + 1} without text.`);
    if (!Array.isArray(item.prNumbers) || item.prNumbers.length === 0) {
      throw new Error(`Model returned item ${index + 1} without source PRs.`);
    }

    const prNumbers = [...new Set(item.prNumbers)];
    if (
      prNumbers.some(
        (number) => !Number.isInteger(number) || !validPrNumbers.has(number),
      )
    ) {
      throw new Error(`Model returned item ${index + 1} with an invalid source PR.`);
    }

    let docPath = item.docPath ?? null;
    let docPrNumber = item.docPrNumber ?? null;
    let validDocsLink =
      Object.prototype.hasOwnProperty.call(item, 'docPath') &&
      Object.prototype.hasOwnProperty.call(item, 'docPrNumber');

    if (validDocsLink && (docPath !== null || docPrNumber !== null)) {
      validDocsLink =
        typeof docPath === 'string' &&
        Boolean(docPath) &&
        Number.isInteger(docPrNumber) &&
        prNumbers.includes(docPrNumber) &&
        linkableDocsPaths(
          prsByNumber.get(docPrNumber),
          publishedPathsByBase,
        ).includes(docPath);
    }
    if (!validDocsLink) {
      warn(
        `Model returned item ${index + 1} with invalid docs link metadata; omitting docs link.`,
      );
      docPath = null;
      docPrNumber = null;
    }
    return { text, prNumbers, docPath, docPrNumber };
  });
}

function docsUrlForItem(item, prsByNumber) {
  if (!item.docPath) return null;
  const pr = prsByNumber.get(item.docPrNumber);
  return toDocsUrl(item.docPath, pr.base);
}

function printDryRunEvidence(prs) {
  console.log(
    `DRY RUN. Reader-facing evidence sent to the model (${prs.length} PRs):`,
  );
  for (const pr of prs) {
    const paths = pr.changes.map((change) => change.path).join(', ');
    console.log(`- PR #${pr.number}: ${paths}`);
  }
  console.log('');
}

function buildSlackMessage({ repo, summary, items, dateFrom, dateTo, prsByNumber }) {
  const lines = [
    '*This week in docs*',
    `_${formatDateRange(dateFrom, dateTo)}_`,
    '',
    escapeSlack(summary),
  ];
  if (items.length) {
    lines.push('');
    for (const item of items) {
      const sources = item.prNumbers
        .map((number) => `<https://github.com/${repo}/pull/${number}|PR #${number}>`)
        .join(', ');
      const docsUrl = docsUrlForItem(item, prsByNumber);
      const docsLink = docsUrl ? ` → <${docsUrl}|View page>` : '';
      lines.push(`• ${escapeSlack(item.text)} (${sources})${docsLink}`);
    }
  }
  const message = lines.join('\n');
  if (message.length > MAX_SLACK_MESSAGE_CHARS) {
    throw new Error(
      `Slack message is ${message.length} characters; maximum safe length is ${MAX_SLACK_MESSAGE_CHARS}.`,
    );
  }
  return message;
}

async function postToSlack(text) {
  const webhook = requireEnv('SLACK_WEBHOOK_DOCS');
  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    throw new Error(`Slack post failed: ${response.status}`);
  }
}

async function main() {
  const repo = requireEnv('GITHUB_REPOSITORY');
  const dateTo = new Date();
  const dateFrom = windowStartIso(dateTo);
  const prs = await collectReaderFacingPrs(repo, dateFrom);

  if (prs.length === 0) {
    console.log('No reader-facing docs merged in the last 7 days. Nothing to post.');
    return;
  }
  const publishedPathsByBase = await loadPublishedPagePaths(repo);

  if (isDryRun()) printDryRunEvidence(prs);

  const user = [
    `Docs merged in the last ${WINDOW_DAYS} days:`,
    '',
    ...prs.map((pr) =>
      [
        `## PR ${pr.number}: ${pr.title}`,
        pr.body ? `Description: ${pr.body}` : 'Description: (none provided)',
        `Linkable docs pages: ${linkableDocsPaths(pr, publishedPathsByBase).join(', ') || '(none)'}`,
        ...pr.changes.map((c) => `Changed ${c.path}:\n${c.patch}`),
      ].join('\n'),
    ),
  ].join('\n\n');

  const raw = await runModelChatCompletion({
    system: `${docsAutomationInstructions}\n\n${WORKFLOW_PROMPT}`,
    user,
  });
  const result = parseJsonObject(raw);

  if (result.skip === true) {
    console.log('Nothing reader-visible shipped this week. Nothing to post.');
    return;
  }

  const summary = normalizeLine(result.summary || '', 240);
  if (!summary) {
    throw new Error('Model returned no summary.');
  }
  const prsByNumber = new Map(prs.map((pr) => [pr.number, pr]));
  const items = normalizeItems(result.items, prsByNumber, publishedPathsByBase);

  const message = buildSlackMessage({
    repo,
    summary,
    items,
    dateFrom,
    dateTo: dateTo.toISOString(),
    prsByNumber,
  });

  if (isDryRun()) {
    console.log('DRY RUN. Would post to Slack:\n');
    console.log(message);
    return;
  }

  await postToSlack(message);
  console.log('Posted weekly docs update to Slack.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

export {
  collectPublishedPagePaths,
  docsUrlForItem,
  linkableDocsPaths,
  normalizeItems,
  toDocsUrl,
};
