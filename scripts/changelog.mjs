import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Resolve paths from this file so the command does not depend on the current directory.
const projectDirectory = fileURLToPath(new URL('../', import.meta.url));
const changelogPath = new URL('../CHANGELOG.md', import.meta.url);

const git = (...args) => execFileSync('git', args, { cwd: projectDirectory, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

try {
  // Only release tags reachable from HEAD count. Tags on other branches are ignored.
  const versionTags = git('tag', '--merged', 'HEAD')
    .split('\n')
    .filter((tag) => /^v\d+\.\d+\.\d+$/.test(tag));
  const latestTag = versionTags.length > 0 ? git('describe', '--tags', '--abbrev=0', ...versionTags.flatMap((tag) => ['--match', tag]), 'HEAD') : undefined;

  // %s reads only the commit subject. NUL separates the entries.
  const history = git('log', '--format=%s%x00', latestTag ? `${latestTag}..HEAD` : 'HEAD');
  const messages = history
    .split('\0')
    .map((message) => message.trim())
    // Ignore the standardized CI commit so it never appears in its own changelog.
    .filter((message) => message && message !== ':memo: Update changelog');
  const entries = messages.map((message) => `- ${message}`).join('\n');

  const changelog = readFileSync(changelogPath, 'utf8');
  const unreleasedHeading = /^## \[Unreleased][ \t]*\r?$/m;
  if (!unreleasedHeading.test(changelog)) {
    throw new Error('CHANGELOG.md must contain a "## [Unreleased]" section.');
  }

  // Replace only Unreleased; keep the introduction and all published release sections.
  // Rebuilding this section makes repeated runs produce the same result.
  const sectionStart = changelog.search(unreleasedHeading);
  const afterHeading = changelog.indexOf('\n', sectionStart);
  const remainingContent = afterHeading === -1 ? '' : changelog.slice(afterHeading + 1);
  const nextSection = remainingContent.search(/^## /m);
  const publishedReleases = nextSection === -1 ? '' : remainingContent.slice(nextSection);
  const updated = `${changelog.slice(0, sectionStart)}## [Unreleased]\n\n${entries ? `${entries}\n\n` : ''}${publishedReleases}`;
  writeFileSync(changelogPath, `${updated.trimEnd()}\n`);
  process.stdout.write(`CHANGELOG.md updated: ${messages.length} commit(s) since ${latestTag ?? 'the beginning of the repository'}.\n`);
} catch (error) {
  process.stderr.write(`Changelog generation failed: ${error.message}\n`);
  process.exitCode = 1;
}
