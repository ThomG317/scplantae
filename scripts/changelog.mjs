import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Resolve paths from this file so the command does not depend on the current directory.
const projectDirectory = fileURLToPath(new URL('../', import.meta.url));
const changelogPath = new URL('../CHANGELOG.md', import.meta.url);

const git = (...args) => execFileSync('git', args, { cwd: projectDirectory, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

try {
  const changelog = readFileSync(changelogPath, 'utf8');
  const unreleasedHeading = /^## \[Unreleased][ \t]*\r?$/m;
  if (!unreleasedHeading.test(changelog)) {
    throw new Error('CHANGELOG.md must contain a "## [Unreleased]" section.');
  }

  // Compare exact titles against list entries in every section, including published releases.
  const knownTitles = new Set([...changelog.matchAll(/^[ \t]*[-*+] (.+)\r?$/gm)].map((match) => match[1].trim()));
  const history = git('log', '--format=%s%x00', 'HEAD');
  const newTitles = [];
  for (const subject of history.split('\0')) {
    const title = subject.trim();
    if (!title || title === ':memo: Update changelog' || knownTitles.has(title)) {
      continue;
    }
    newTitles.push(title);
    // Also avoid duplicates when several commits in the history have the same title.
    knownTitles.add(title);
  }

  if (newTitles.length > 0) {
    // Insert new entries below the heading, preserving all existing content verbatim.
    const entries = newTitles.map((title) => `- ${title}`).join('\n');
    const updated = changelog.replace(unreleasedHeading, (heading) => `${heading.trimEnd()}\n\n${entries}`);
    writeFileSync(changelogPath, updated.endsWith('\n') ? updated : `${updated}\n`);
  }
  process.stdout.write(`CHANGELOG.md updated: ${newTitles.length} new commit title(s).\n`);
} catch (error) {
  process.stderr.write(`Changelog generation failed: ${error.message}\n`);
  process.exitCode = 1;
}
