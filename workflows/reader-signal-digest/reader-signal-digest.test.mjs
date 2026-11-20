import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildSlackMessage,
  linkablePagePaths,
  linkSlackPageRefs,
} from './docs-reader-signal-digest.mjs';

test('collects unique documentation paths from sanitized analytics evidence', () => {
  const paths = linkablePagePaths({
    topSearches: [
      { topClickedPage: '/cli/example' },
      { topClickedPage: '' },
    ],
    unansweredAssistant: [{ page: '/deployment/supported-configurations' }],
    topViews: [{ path: '/cli/example' }, { path: 'not-a-route' }],
    topVisitors: [{ path: '/cli/install' }],
  });

  assert.deepEqual(paths, [
    '/cli/example',
    '/deployment/supported-configurations',
    '/cli/install',
  ]);
});

test('links only page references supplied by the analytics evidence', () => {
  assert.equal(
    linkSlackPageRefs(
      'Compare /cli/example with /cli/install and investigate /unknown/page.',
      ['/cli/example', '/cli/install'],
    ),
    'Compare <https://docs.example.com/cli/example|/cli/example> with ' +
      '<https://docs.example.com/cli/install|/cli/install> and investigate /unknown/page.',
  );
});

test('adds validated page links throughout the Slack digest', () => {
  const message = buildSlackMessage({
    summary: 'Readers are heavily engaging with /cli/example.',
    priorities: ['Review /deployment/supported-configurations.'],
    signals: ['Compare /cli/example and /cli/install.'],
    totals: {
      visitors: { human: 3061 },
      views: { human: 9641 },
      searches: 382,
      assistantConversations: 167,
      unansweredAssistant: 34,
    },
    dateFrom: '2026-07-27T00:00:00.000Z',
    dateTo: '2026-08-03T00:00:00.000Z',
    pagePaths: [
      '/cli/example',
      '/cli/install',
      '/deployment/supported-configurations',
    ],
  });

  assert.match(message, /<https:\/\/docs\.example\.com\/cli\/example\|\/cli\/example>/);
  assert.match(
    message,
    /<https:\/\/docs\.example\.com\/deployment\/supported-configurations\|\/deployment\/supported-configurations>/,
  );
  assert.match(message, /<https:\/\/docs\.example\.com\/cli\/install\|\/cli\/install>/);
});
