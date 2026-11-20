import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { collectOpenApiRoutes, operationIdToSlug, runXrefCheck } from './check-internal-xrefs.mjs';

const checker = fileURLToPath(new URL('./check-internal-xrefs.mjs', import.meta.url));

function fixture(t, files = {}, options = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-xrefs-'));
  t.after(() => {
    const prefix = path.resolve(os.tmpdir()) + path.sep + 'docs-xrefs-';
    assert.ok(path.resolve(root).startsWith(prefix), 'cleanup must stay inside the temporary fixture');
    fs.rmSync(root, { recursive: true, force: true });
  });
  const config = {
    navigation: { tabs: [{ tab: 'Guide', groups: [{ group: 'Start', pages: ['index', 'cli/install'] }] }] },
    redirects: [],
    ...options,
  };
  const contents = {
    'docs.json': JSON.stringify(config),
    'index.mdx': '# Start\n[Install](/cli/install#steps)\n![Diagram](/images/diagram.svg)\n',
    'cli/install.mdx': '# Install\n\n## Steps\n\nInstall the example CLI.\n',
    'images/diagram.svg': '<svg xmlns="http://www.w3.org/2000/svg"/>',
    ...files,
  };
  for (const [name, content] of Object.entries(contents)) {
    const destination = path.join(root, name);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, content);
  }
  return root;
}

test('converts operation IDs to route slugs', () => {
  assert.equal(operationIdToSlug('listThings'), 'list-things');
  assert.equal(operationIdToSlug('getAPIKey'), 'get-api-key');
  assert.equal(operationIdToSlug('already-kebab'), 'already-kebab');
});

test('accepts routes, anchors, and assets in a documentation root', (t) => {
  const result = runXrefCheck(fixture(t));
  assert.deepEqual(result.errors, []);
  assert.equal(result.docFiles.length, 2);
});

test('reports missing routes, local anchors, cross-page anchors, and assets', (t) => {
  const root = fixture(t, {
    'index.mdx': '# Start\n[Missing](/missing)\n[Local](#absent)\n[Cross-page](/cli/install#absent)\n![Missing](/images/absent.png)\n',
  });
  const { errors } = runXrefCheck(root);
  assert.equal(errors.length, 4);
  assert.ok(errors.some((error) => error.includes('missing route /missing')));
  assert.ok(errors.some((error) => error.includes('missing local anchor #absent')));
  assert.ok(errors.some((error) => error.includes('missing anchor #absent in /cli/install')));
  assert.ok(errors.some((error) => error.includes('missing asset /images/absent.png')));
});

test('recognizes explicit step IDs, custom heading IDs, and repeated headings', (t) => {
  const root = fixture(t, {
    'index.mdx': '# Start\n[Step](/cli/install#authenticate)\n[Custom](/cli/install#custom-id)\n[Repeated](/cli/install#steps-2)\n',
    'cli/install.mdx': '# Install\n<Step id="authenticate" title="Sign in" />\n## Custom {#custom-id}\n## Steps\n## Steps\n',
  });
  assert.deepEqual(runXrefCheck(root).errors, []);
});

test('ignores links inside code examples while checking actual prose', (t) => {
  const root = fixture(t, {
    'index.mdx': '# Start\n```markdown\n[Example](/not-a-route)\n```\n`[Inline example](/also-not-a-route)`\n[Install](/cli/install#steps)\n',
  });
  assert.deepEqual(runXrefCheck(root).errors, []);
});

test('honors documentation directory exclusions', (t) => {
  const root = fixture(t, {
    '.mintignore': '_drafts/\n',
    '_drafts/unpublished.mdx': '# Draft\n[Missing](/does-not-exist)\n',
  });
  const result = runXrefCheck(root);
  assert.deepEqual(result.errors, []);
  assert.equal(result.docFiles.length, 2);
});

test('recommends canonical destinations for links through redirects', (t) => {
  const root = fixture(t, { 'index.mdx': '# Start\n[Install](/old-install#steps)\n' }, {
    redirects: [{ source: '/old-install', destination: '/cli/install' }],
  });
  assert.deepEqual(runXrefCheck(root).errors, [
    'index.mdx:2 uses redirect source /old-install#steps; link to /cli/install#steps instead',
  ]);
});

test('reports missing navigation and redirect destinations', (t) => {
  const root = fixture(t, {}, {
    navigation: { tabs: [{ groups: [{ pages: ['missing-page'] }] }] },
    redirects: [{ source: '/old', destination: '/missing-destination' }],
  });
  const { errors } = runXrefCheck(root);
  assert.equal(errors.length, 2);
  assert.ok(errors.some((error) => error.includes('navigation points to a missing page /missing-page')));
  assert.ok(errors.some((error) => error.includes('redirect /old -> /missing-destination points to a missing page')));
});

test('loads redirect configuration from a referenced JSON file', (t) => {
  const root = fixture(t, {
    'config/redirects.json': JSON.stringify([{ source: '/old', destination: '/cli/install#steps' }]),
  }, { redirects: { $ref: './config/redirects.json' } });
  assert.deepEqual(runXrefCheck(root).errors, []);
});

test('registers API routes from local JSON specs and ignores non-operation keys', (t) => {
  const config = { navigation: { tabs: [{ groups: [{ openapi: { source: 'specs/example.json', directory: 'api-reference' } }] }] } };
  const root = fixture(t, {
    'index.mdx': '# Start\n[API operation](/api-reference/things/list-things)\n',
    'specs/example.json': JSON.stringify({ paths: { '/things': {
      summary: 'Not an operation', parameters: [],
      get: { operationId: 'listThings', tags: ['Things'] },
    } } }),
  }, config);
  assert.deepEqual([...collectOpenApiRoutes(config, root)], ['/api-reference/things/list-things']);
  assert.deepEqual(runXrefCheck(root).errors, []);
});

test('reports unverifiable anchors on generated API pages', (t) => {
  const root = fixture(t, {
    'index.mdx': '# Start\n[API operation](/api-reference/list-things#response)\n',
    'specs/example.json': JSON.stringify({ paths: { '/things': { get: { operationId: 'listThings' } } } }),
  }, { openapi: { source: 'specs/example.json' } });
  assert.ok(runXrefCheck(root).errors.some((error) => error.includes('cannot verify anchor #response on generated API page')));
});

test('does not assume routes from remote API specifications are verified', (t) => {
  const root = fixture(t, { 'index.mdx': '# Start\n[API operation](/api-reference/list-things)\n' }, {
    openapi: 'https://example.com/openapi.json',
  });
  assert.ok(runXrefCheck(root).errors.some((error) => error.includes('missing route /api-reference/list-things')));
});

test('CLI accepts an explicit root when invoked from another directory', (t) => {
  const root = fixture(t);
  const result = spawnSync(process.execPath, [checker, '--root', root], { cwd: os.tmpdir(), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /2 docs files.*no errors/);
});

test('CLI fails when a reference is broken', (t) => {
  const root = fixture(t, { 'index.mdx': '# Start\n[Missing](/missing)\n' });
  const result = spawnSync(process.execPath, [checker, '--root', root], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /missing route \/missing/);
});

test('CLI explains invalid arguments and missing site configuration', (t) => {
  const root = fixture(t);
  const invalid = spawnSync(process.execPath, [checker, '--invalid'], { encoding: 'utf8' });
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /Usage:/);
  fs.unlinkSync(path.join(root, 'docs.json'));
  const missing = spawnSync(process.execPath, [checker, '--root', root], { encoding: 'utf8' });
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /No docs.json found/);
});
