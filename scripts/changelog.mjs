import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Resolve paths from this file so the command does not depend on the current directory.
const projectDirectory = fileURLToPath(new URL('../', import.meta.url));
const changelogPath = new URL('../CHANGELOG.md', import.meta.url);

const git = (...args) => execFileSync('git', args, { cwd: projectDirectory, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

// Keep technical work together; unknown or missing Gitmoji also belong to Maintenance.
const categories = new Map([
  ['Added', ['✨', ':sparkles:', '🎉', ':tada:']],
  ['Changed', ['♻️', ':recycle:', '🏗️', ':building_construction:', '💄', ':lipstick:', '⚡', ':zap:']],
  ['Fixed', ['🐛', ':bug:', '🚑', ':ambulance:']],
  ['Deprecated', ['🗑️', ':wastebasket:']],
  ['Removed', ['🔥', ':fire:']],
  ['Maintenance', []],
]);
const categoryFor = (title) => {
  const normalized = title.replaceAll('\uFE0F', '');
  for (const [category, prefixes] of categories) {
    if (prefixes.some((prefix) => normalized.startsWith(prefix.replaceAll('\uFE0F', '')))) {
      return category;
    }
  }
  return 'Maintenance';
};

const isVersionBump = (title) => {
  // Accept handwritten release titles with Gitmoji and optional conventional prefixes.
  const message = title
    .replace(/^(?:\s|:[a-z_+-]+:|[^\p{L}\p{N}])+/u, '')
    .replace(/^(?:chore|build|release)(?:\([^)]*\))?\s*:\s*/i, '')
    .replace(/^bump\s*[:–-]\s*/i, 'bump ');
  return /^(?:bump(?:\s+(?:to\s+)?(?:the\s+)?(?:(?:app|application|package)\s+)?version\b|\s+(?:to\s+)?v?\d+\.\d+|\s*$)|version\s+bump\b)/i.test(message);
};

const groupEntries = (body, titles) => {
  const sections = new Map([...categories.keys()].map((category) => [category, []]));
  const preserved = [];
  let currentCategory;
  let hasHeading = false;
  for (const line of body.split('\n')) {
    const heading = /^### (.+?)\s*$/.exec(line);
    if (heading) {
      hasHeading = true;
      currentCategory = sections.has(heading[1]) ? heading[1] : undefined;
      if (currentCategory) continue;
    }
    const entry = /^[ \t]*[-*+] (.+)$/.exec(line);
    if (!hasHeading && entry) {
      sections.get(categoryFor(entry[1])).push(line);
    } else if (currentCategory) {
      sections.get(currentCategory).push(line);
    } else {
      preserved.push(line);
    }
  }
  for (const category of categories.keys()) {
    const entries = titles.filter((title) => categoryFor(title) === category).map((title) => `- ${title}`);
    const existing = sections.get(category).join('\n').trim();
    sections.set(category, [...entries, ...(existing ? [existing] : [])]);
  }
  const grouped = [...sections].filter(([, lines]) => lines.length > 0).map(([category, lines]) => `### ${category}\n\n${lines.join('\n')}`);
  return [...(preserved.join('\n').trim() ? [preserved.join('\n').trim()] : []), ...grouped].join('\n\n');
};

try {
  const changelog = readFileSync(changelogPath, 'utf8');
  const unreleasedHeading = /^## \[Unreleased][ \t]*\r?$/m;
  if (!unreleasedHeading.test(changelog)) {
    throw new Error('CHANGELOG.md must contain a "## [Unreleased]" section.');
  }

  // Compare exact titles against list entries in every section, including published releases.
  const knownTitles = new Set([...changelog.matchAll(/^[ \t]*[-*+] (.+)\r?$/gm)].map((match) => match[1].trim()));
  // Use the same subject recognition for the release boundary and excluded bumps.
  const lastBump = git('log', '--topo-order', '--no-merges', '--format=%H%x09%s', 'HEAD')
    .split('\n')
    .find((line) => isVersionBump(line.slice(line.indexOf('\t') + 1)))
    ?.split('\t')[0];
  const history = git('log', '--no-merges', '--format=%s%x00', lastBump ? `${lastBump}..HEAD` : 'HEAD');
  const newTitles = [];
  for (const subject of history.split('\0')) {
    const title = subject.trim();
    if (!title || title === ':memo: Update changelog' || isVersionBump(title) || knownTitles.has(title)) {
      continue;
    }
    newTitles.push(title);
    // Also avoid duplicates when several commits in the history have the same title.
    knownTitles.add(title);
  }

  if (newTitles.length > 0) {
    // Only rewrite Unreleased; published releases remain verbatim.
    const heading = unreleasedHeading.exec(changelog);
    const bodyStart = heading.index + heading[0].length;
    const remaining = changelog.slice(bodyStart);
    const nextRelease = remaining.search(/^## /m);
    const body = nextRelease < 0 ? remaining : remaining.slice(0, nextRelease);
    const releases = nextRelease < 0 ? '' : remaining.slice(nextRelease);
    const updated = `${changelog.slice(0, bodyStart)}\n\n${groupEntries(body, newTitles)}\n\n${releases}`;
    writeFileSync(changelogPath, updated.endsWith('\n') ? updated : `${updated}\n`);
  }
  process.stdout.write(`CHANGELOG.md updated: ${newTitles.length} new commit title(s).\n`);
} catch (error) {
  process.stderr.write(`Changelog generation failed: ${error.message}\n`);
  process.exitCode = 1;
}
