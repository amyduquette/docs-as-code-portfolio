import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const httpMethods = new Set([
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
]);

const defaultOpenApiDirectory = 'api-reference';

const defaultIgnoredDirs = new Set([
  '.git',
  'node_modules',
]);

function readMintIgnore(root) {
  const mintIgnorePath = path.join(root, '.mintignore');
  if (!fs.existsSync(mintIgnorePath)) {
    return [];
  }

  return fs
    .readFileSync(mintIgnorePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.replace(/\/+$/, ''));
}

function isIgnored(relPath, ignoredPaths) {
  const normalized = relPath.split(path.sep).join('/');
  const parts = normalized.split('/');

  if (parts.some((part) => defaultIgnoredDirs.has(part))) {
    return true;
  }

  for (const ignored of ignoredPaths) {
    if (normalized === ignored || normalized.startsWith(`${ignored}/`)) {
      return true;
    }
  }

  return false;
}

function walkDocs(dir, relDir = '', ignoredPaths = new Set()) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const relPath = relDir ? `${relDir}/${entry.name}` : entry.name;
    if (isIgnored(relPath, ignoredPaths)) {
      continue;
    }

    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDocs(absPath, relPath, ignoredPaths));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (entry.name.endsWith('.mdx')) {
      results.push(relPath);
    }
  }

  return results;
}

function routeFromFile(relPath) {
  const noExt = relPath.replace(/\.(md|mdx)$/i, '');
  if (noExt === 'index') {
    return ['/index', '/'];
  }
  return [`/${noExt}`];
}

function loadJson(absPath) {
  return JSON.parse(fs.readFileSync(absPath, 'utf8'));
}

function resolveJsonRef(basePath, value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || !value.$ref) {
    return value;
  }

  const refPath = path.resolve(path.dirname(basePath), value.$ref);
  return resolveJsonRef(refPath, loadJson(refPath));
}

function loadRedirects(root) {
  const docsJsonPath = path.join(root, 'docs.json');
  const docsJson = loadJson(docsJsonPath);
  const redirects = new Map();
  const redirectConfig = resolveJsonRef(docsJsonPath, docsJson.redirects) ?? [];

  for (const redirect of redirectConfig) {
    if (redirect.source && redirect.destination) {
      redirects.set(redirect.source, redirect.destination);
    }
  }

  return { redirects, docsJson };
}

function stripInlineFormatting(text) {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_~]/g, '')
    .replace(/&[a-z]+;/gi, ' ');
}

function slugify(text) {
  return stripInlineFormatting(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['".,!?()[\]{}:;<>/@\\]/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function buildAnchorMap(absPath) {
  const content = fs.readFileSync(absPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const anchors = new Set();
  const seen = new Map();
  let inFence = false;

  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      inFence = !inFence;
      continue;
    }

    if (inFence) {
      continue;
    }

    const stepIdMatch = line.match(/<Step\b[^>]*\bid=["']([^"']+)["'][^>]*>/);
    if (stepIdMatch) {
      anchors.add(stepIdMatch[1]);
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!headingMatch) {
      continue;
    }

    const customAnchorMatch = headingMatch[2].match(/\s+\{#([A-Za-z0-9_-]+)\}\s*$/);
    if (customAnchorMatch) {
      anchors.add(customAnchorMatch[1]);
      continue;
    }

    const base = slugify(headingMatch[2]);
    if (!base) {
      continue;
    }

    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    anchors.add(count === 1 ? base : `${base}-${count}`);
  }

  return anchors;
}

function lineNumberAt(content, index) {
  return content.slice(0, index).split('\n').length;
}

function maskCodeExamples(content) {
  const preserveLines = (match) => match.replace(/[^\n]/g, ' ');

  return content
    .replace(/```[\s\S]*?```/g, preserveLines)
    .replace(/~~~[\s\S]*?~~~/g, preserveLines)
    .replace(/`[^`\n]+`/g, preserveLines);
}

function collectLinks(relPath, rootDir) {
  const absPath = path.join(rootDir, relPath);
  const content = fs.readFileSync(absPath, 'utf8');
  const scanContent = maskCodeExamples(content);
  const links = [];

  const markdownLinkRegex = /!?\[[^\]]*]\((\/[^)\s]+|#[^)]+)\)/g;
  for (const match of scanContent.matchAll(markdownLinkRegex)) {
    links.push({
      raw: match[1],
      line: lineNumberAt(content, match.index ?? 0),
    });
  }

  const hrefRegex = /\bhref="(\/[^"]+|#[^"]+)"/g;
  for (const match of scanContent.matchAll(hrefRegex)) {
    links.push({
      raw: match[1],
      line: lineNumberAt(content, match.index ?? 0),
    });
  }

  return links;
}

function normalizeDocPath(docPath) {
  if (!docPath) {
    return docPath;
  }

  let normalized = docPath;
  if (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1) || '/';
  }

  return normalized;
}

function isExternalUrl(value) {
  return /^https?:\/\//i.test(value);
}

function operationIdToSlug(operationId) {
  return String(operationId)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function collectOpenApiConfigs(node, configs = []) {
  if (Array.isArray(node)) {
    for (const item of node) {
      collectOpenApiConfigs(item, configs);
    }
    return configs;
  }

  if (!node || typeof node !== 'object') {
    return configs;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === 'openapi') {
      configs.push(value);
      continue;
    }
    collectOpenApiConfigs(value, configs);
  }

  return configs;
}

function normalizeOpenApiConfig(config) {
  if (typeof config === 'string') {
    return [{ source: config, directory: defaultOpenApiDirectory }];
  }

  if (Array.isArray(config)) {
    return config.flatMap(normalizeOpenApiConfig);
  }

  if (config && typeof config === 'object' && typeof config.source === 'string') {
    return [
      {
        source: config.source,
        directory: config.directory || defaultOpenApiDirectory,
      },
    ];
  }

  return [];
}

// Mintlify generates a page per OpenAPI operation, so these routes have no .mdx
// file on disk. Route shape: /<directory>/<first tag>/<operationId in kebab case>.
function collectOpenApiRoutes(docsJsonConfig, root) {
  const routes = new Set();

  for (const config of collectOpenApiConfigs(docsJsonConfig)) {
    for (const { source, directory } of normalizeOpenApiConfig(config)) {
      if (isExternalUrl(source)) {
        continue;
      }

      const specPath = path.join(root, source);
      if (!fs.existsSync(specPath)) {
        continue;
      }

      let spec;
      try {
        spec = loadJson(specPath);
      } catch {
        // Non-JSON specs are not parsed here; links to their pages still report
        // as missing routes rather than passing unchecked.
        continue;
      }

      const base = normalizeDocPath(`/${String(directory).replace(/^\/+|\/+$/g, '')}`);

      for (const operations of Object.values(spec?.paths ?? {})) {
        if (!operations || typeof operations !== 'object') {
          continue;
        }

        for (const [method, operation] of Object.entries(operations)) {
          if (!httpMethods.has(method.toLowerCase())) {
            continue;
          }

          if (!operation || typeof operation !== 'object' || !operation.operationId) {
            continue;
          }

          const slug = operationIdToSlug(operation.operationId);
          if (!slug) {
            continue;
          }

          const tag = Array.isArray(operation.tags) && operation.tags.length > 0
            ? slugify(String(operation.tags[0]))
            : '';

          routes.add(tag ? `${base}/${tag}/${slug}` : `${base}/${slug}`);
        }
      }
    }
  }

  return routes;
}

function isAssetLink(linkPath) {
  return /\.(png|jpe?g|gif|svg|webp|ico|pdf|json)$/i.test(linkPath);
}

function collectPages(node, pages = []) {
  if (Array.isArray(node)) {
    for (const item of node) {
      if (typeof item === 'string') {
        pages.push(item);
      } else {
        collectPages(item, pages);
      }
    }
    return pages;
  }

  if (!node || typeof node !== 'object') {
    return pages;
  }

  if (typeof node.pages !== 'undefined') {
    collectPages(node.pages, pages);
  }

  if (typeof node.groups !== 'undefined') {
    collectPages(node.groups, pages);
  }

  return pages;
}

function collectNavigationPages(navigation) {
  const pages = [];
  collectPages(navigation?.tabs ?? [], pages);

  if (Array.isArray(navigation?.versions)) {
    for (const version of navigation.versions) {
      collectPages(version.tabs ?? [], pages);
    }
  }

  return pages;
}

// Walks the docs tree and reports every internal reference problem it finds.
// Kept out of module scope so importing this file for its helpers stays cheap.
function runXrefCheck(rootDir = process.cwd()) {
  const ignoredPaths = new Set(readMintIgnore(rootDir));
  const docFiles = walkDocs(rootDir, '', ignoredPaths);
  const routeToFile = new Map();
  for (const relPath of docFiles) {
    for (const route of routeFromFile(relPath)) {
      routeToFile.set(route, relPath);
    }
  }

  const anchorCache = new Map();
  function anchorsFor(relPath) {
    if (!anchorCache.has(relPath)) {
      anchorCache.set(relPath, buildAnchorMap(path.join(rootDir, relPath)));
    }
    return anchorCache.get(relPath);
  }

  const { redirects, docsJson } = loadRedirects(rootDir);
  const generatedRoutes = collectOpenApiRoutes(docsJson, rootDir);
  const errors = [];

  function hasRoute(route) {
    return routeToFile.has(route) || generatedRoutes.has(route);
  }

  function resolveDocRoute(route) {
    let normalized = normalizeDocPath(route);
    const seen = new Set();

    while (redirects.has(normalized) && !seen.has(normalized)) {
      seen.add(normalized);
      const next = normalizeDocPath(redirects.get(normalized));
      if (next === normalized) {
        break;
      }
      normalized = next;
    }

    return normalized;
  }

  for (const relPath of docFiles) {
    const links = collectLinks(relPath, rootDir);
    const currentRoute = routeFromFile(relPath)[0];

    for (const link of links) {
      if (link.raw.startsWith('#')) {
        const fragment = link.raw.slice(1);
        if (!anchorsFor(relPath).has(fragment)) {
          errors.push(`${relPath}:${link.line} missing local anchor #${fragment}`);
        }
        continue;
      }

      const [rawPath, fragment] = link.raw.split('#');
      if (isAssetLink(rawPath)) {
        const assetPath = rawPath.replace(/^\//, '');
        if (!fs.existsSync(path.join(rootDir, assetPath))) {
          errors.push(`${relPath}:${link.line} missing asset ${rawPath}`);
        }
        continue;
      }

      const normalizedRawPath = normalizeDocPath(rawPath);
      const redirectDestination = redirects.has(normalizedRawPath)
        ? normalizeDocPath(redirects.get(normalizedRawPath))
        : null;

      if (redirectDestination && redirectDestination !== normalizedRawPath) {
        const canonicalTarget = fragment
          ? `${redirectDestination}#${fragment}`
          : redirectDestination;
        errors.push(
          `${relPath}:${link.line} uses redirect source ${link.raw}; link to ${canonicalTarget} instead`,
        );
      }

      const resolvedRoute = resolveDocRoute(rawPath);
      const targetFile = routeToFile.get(resolvedRoute);

      if (!targetFile) {
        if (generatedRoutes.has(resolvedRoute)) {
          if (fragment) {
            errors.push(
              `${relPath}:${link.line} cannot verify anchor #${fragment} on generated API page ${resolvedRoute}; link to the page without a fragment`,
            );
          }
          continue;
        }

        errors.push(`${relPath}:${link.line} missing route ${rawPath}`);
        continue;
      }

      if (fragment) {
        const targetAnchors = anchorsFor(targetFile);
        if (!targetAnchors.has(fragment)) {
          errors.push(
            `${relPath}:${link.line} missing anchor #${fragment} in ${resolvedRoute}`,
          );
        }
      }
    }

    if (!routeToFile.has(currentRoute)) {
      errors.push(`${relPath}: failed to register route ${currentRoute}`);
    }
  }

  for (const [source, destination] of redirects.entries()) {
    if (isExternalUrl(destination)) {
      continue;
    }

    const [destinationPath, fragment] = destination.split('#');
    const resolvedDestination = resolveDocRoute(destinationPath);
    if (!hasRoute(resolvedDestination)) {
      errors.push(`docs.json redirect ${source} -> ${destination} points to a missing page`);
      continue;
    }

    const destinationFile = routeToFile.get(resolvedDestination);
    if (fragment && !destinationFile && generatedRoutes.has(resolvedDestination)) {
      errors.push(
        `docs.json redirect ${source} -> ${destination} cannot verify an anchor on generated API page ${resolvedDestination}; redirect to the page without a fragment`,
      );
      continue;
    }

    if (fragment && destinationFile && !anchorsFor(destinationFile).has(fragment)) {
      errors.push(`docs.json redirect ${source} -> ${destination} points to a missing anchor`);
    }
  }

  for (const page of collectNavigationPages(docsJson.navigation)) {
    const route = normalizeDocPath(`/${page}`);
    if (!routeToFile.has(route)) {
      errors.push(`docs.json navigation points to a missing page ${route}`);
    }
  }

  return { docFiles, errors, generatedRoutes };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--root')) {
    throw new Error('Usage: node check-internal-xrefs.mjs [--root <docs-repository-path>]');
  }
  const rootDir = path.resolve(args[1] ?? process.cwd());
  if (!fs.existsSync(path.join(rootDir, 'docs.json'))) {
    throw new Error(`No docs.json found in ${rootDir}. Supply a Mintlify documentation root with --root.`);
  }
  const { docFiles, errors, generatedRoutes } = runXrefCheck(rootDir);

  if (errors.length > 0) {
    console.error('Internal xref check failed:\n');
    for (const error of errors.sort()) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(
    `Checked internal xrefs across ${docFiles.length} docs files and ${generatedRoutes.size} generated API routes with no errors.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

export { collectOpenApiRoutes, operationIdToSlug, runXrefCheck };
