import assert from 'node:assert/strict';
import test from 'node:test';

import {
  collectPublishedPagePaths,
  docsUrlForItem,
  linkableDocsPaths,
  normalizeItems,
  toDocsUrl,
} from './docs-weekly-changelog.mjs';

test('maps published page paths to the correct product URL', () => {
  assert.equal(toDocsUrl('index.mdx', 'main'), 'https://docs.example.com');
  assert.equal(
    toDocsUrl('index.mdx', 'release/product'),
    'https://docs.example.com/product/index',
  );
  assert.equal(
    toDocsUrl('tools/example-editor.mdx', 'main'),
    'https://docs.example.com/tools/example-editor',
  );
  assert.equal(
    toDocsUrl('ide/assistant.mdx', 'release/product'),
    'https://docs.example.com/product/ide/assistant',
  );
});

test('collects only page entries from docs.json navigation', () => {
  const config = {
    navigation: {
      tabs: [
        {
          groups: [
            {
              pages: [
                'index',
                { group: 'Tools', pages: ['tools/example-editor'] },
              ],
            },
          ],
        },
      ],
    },
    redirects: { source: '/old', destination: '/tools/example-editor' },
  };

  assert.deepEqual(
    [...collectPublishedPagePaths(config)].sort(),
    ['index', 'tools/example-editor'],
  );
});

test('excludes removed and unpublished MDX files from linkable pages', () => {
  const pr = {
    base: 'main',
    changes: [
      { path: 'tools/example-editor.mdx', status: 'modified' },
      { path: 'snippets/list-model-ids.mdx', status: 'modified' },
      { path: '_drafts/future-page.mdx', status: 'modified' },
      { path: 'removed-page.mdx', status: 'removed' },
    ],
  };
  const publishedPathsByBase = new Map([
    ['main', new Set(['tools/example-editor', 'removed-page'])],
  ]);

  assert.deepEqual(linkableDocsPaths(pr, publishedPathsByBase), ['tools/example-editor.mdx']);
});

test('validates and links the page selected for each item', () => {
  const prsByNumber = new Map([
    [
      123,
      {
        number: 123,
        base: 'release/product',
        changes: [
          { path: 'ide/install.mdx', status: 'modified' },
          { path: 'ide/troubleshooting.mdx', status: 'modified' },
        ],
      },
    ],
  ]);
  const publishedPathsByBase = new Map([
    ['release/product', new Set(['ide/install', 'ide/troubleshooting'])],
  ]);

  const items = normalizeItems(
    [
      {
        text: 'IDE setup: clearer installation path.',
        prNumbers: [123],
        docPath: 'ide/install.mdx',
        docPrNumber: 123,
      },
      {
        text: 'IDE troubleshooting: new recovery guidance.',
        prNumbers: [123],
        docPath: 'ide/troubleshooting.mdx',
        docPrNumber: 123,
      },
    ],
    prsByNumber,
    publishedPathsByBase,
  );

  assert.equal(
    docsUrlForItem(items[0], prsByNumber),
    'https://docs.example.com/product/ide/install',
  );
  assert.equal(
    docsUrlForItem(items[1], prsByNumber),
    'https://docs.example.com/product/ide/troubleshooting',
  );
  const [unlinked] = normalizeItems(
    [
      {
        text: 'Navigation: clearer labels.',
        prNumbers: [123],
        docPath: null,
        docPrNumber: null,
      },
    ],
    prsByNumber,
    publishedPathsByBase,
  );
  assert.equal(docsUrlForItem(unlinked, prsByNumber), null);
  const warnings = [];
  const [invalidLink] = normalizeItems(
    [
      {
        text: 'Invalid link.',
        prNumbers: [123],
        docPath: 'snippets/example.mdx',
        docPrNumber: 123,
      },
    ],
    prsByNumber,
    publishedPathsByBase,
    (message) => warnings.push(message),
  );
  assert.equal(invalidLink.docPath, null);
  assert.equal(invalidLink.docPrNumber, null);
  assert.match(warnings[0], /omitting docs link/);
  assert.throws(
    () =>
      normalizeItems(
        [
          {
            text: 'Invalid source.',
            prNumbers: [999],
            docPath: null,
            docPrNumber: null,
          },
        ],
        prsByNumber,
        publishedPathsByBase,
      ),
    /invalid source PR/,
  );
});
