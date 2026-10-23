// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';

let directory: string;
const git = (...args: string[]) => execFileSync('git', args, { cwd: directory, stdio: 'pipe' });
const generate = () => execFileSync(process.execPath, ['scripts/changelog.mjs'], { cwd: directory });
const readChangelog = () => readFileSync(join(directory, 'CHANGELOG.md'), 'utf8');
const commit = (message: string) => git('commit', '--allow-empty', '-m', message);

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'scplantae-changelog-'));
  mkdirSync(join(directory, 'scripts'));
  copyFileSync(new URL('../changelog.mjs', import.meta.url), join(directory, 'scripts/changelog.mjs'));
  writeFileSync(join(directory, 'CHANGELOG.md'), '# Changelog\n\n## [Unreleased]\n\nOld draft\n\n## [0.0.1]\n\n- Published entry\n');
  git('init');
  git('config', 'user.name', 'Changelog test');
  git('config', 'user.email', 'changelog@example.test');
  git('config', 'commit.gpgsign', 'false');
  commit('Initial commit');
});

afterEach(() => {
  rmSync(directory, { recursive: true, force: true });
});

it('includes only subjects without tags, preserves releases and is repeatable', () => {
  commit('New feature\n\nDetailed explanation\nSecond line');
  generate();
  const result = readChangelog();
  expect(result).toBe('# Changelog\n\n## [Unreleased]\n\nOld draft\n\n### Maintenance\n\n- New feature\n- Initial commit\n\n## [0.0.1]\n\n- Published entry\n');
  generate();
  expect(readChangelog()).toBe(result);
});

it('excludes titles already listed in published releases and ignores tags', () => {
  commit('Published entry');
  git('tag', 'v0.1.0');
  commit('Upcoming fix');
  generate();
  expect(readChangelog()).toContain('- Upcoming fix');
  expect(readChangelog()).toContain('- Initial commit');
  expect(readChangelog().match(/^- Published entry$/gm)).toHaveLength(1);
  expect(readChangelog()).toContain('## [0.0.1]\n\n- Published entry');
});

it('ignores automated changelog commits, including on subsequent runs', () => {
  generate();
  const result = readChangelog();
  commit(':memo: Update changelog');
  generate();
  expect(readChangelog()).toBe(result);
  commit('Real change');
  generate();
  expect(readChangelog()).toContain('- Real change');
  expect(readChangelog()).not.toContain(':memo: Update changelog');
});

it('deduplicates identical commit titles and preserves manual entries', () => {
  commit('Repeated title');
  commit('Repeated title');
  generate();
  expect(readChangelog().match(/^- Repeated title$/gm)).toHaveLength(1);
  expect(readChangelog()).toContain('Old draft');
  const result = readChangelog();
  generate();
  expect(readChangelog()).toBe(result);
});

it('preserves the file exactly when every title is already documented', () => {
  const content = '# Changelog\n\n## [Unreleased]\n\nManual note\n\n## [0.1.0]\n\n- Initial commit\n';
  writeFileSync(join(directory, 'CHANGELOG.md'), content);
  generate();
  expect(readChangelog()).toBe(content);
});

it('fails without changing a changelog that has no Unreleased section', () => {
  writeFileSync(join(directory, 'CHANGELOG.md'), '# Changelog\n');
  const result = spawnSync(process.execPath, ['scripts/changelog.mjs'], { cwd: directory });
  expect(result.status).toBe(1);
  expect(result.stderr.toString()).toContain('must contain');
  expect(readChangelog()).toBe('# Changelog\n');
});

it('groups Unicode and shortcode Gitmoji in category order and omits empty categories', () => {
  commit(':sparkles: Add feature');
  commit('✨ Add another feature');
  commit(':recycle: Refactor');
  commit('🚑 Fix outage');
  commit(':wastebasket: Deprecate API');
  commit('🔥 Remove old API');
  commit(':construction_worker: Update CI');
  generate();
  const result = readChangelog();
  expect(result).toContain('### Added\n\n- ✨ Add another feature\n- :sparkles: Add feature');
  expect(result).toContain('### Changed\n\n- :recycle: Refactor');
  expect(result).toContain('### Fixed\n\n- 🚑 Fix outage');
  expect(result).toContain('### Deprecated\n\n- :wastebasket: Deprecate API');
  expect(result).toContain('### Removed\n\n- 🔥 Remove old API');
  expect(result).toContain('### Maintenance\n\n- :construction_worker: Update CI\n- Initial commit');
  expect([...result.matchAll(/^### (.+)$/gm)].map((match) => match[1])).toEqual(['Added', 'Changed', 'Fixed', 'Deprecated', 'Removed', 'Maintenance']);
  generate();
  expect(readChangelog()).toBe(result);
});

it('merges new entries into existing categories without touching published releases', () => {
  const published = '## [0.1.0]\n\n### Fixed\n\n- Published entry\n';
  writeFileSync(join(directory, 'CHANGELOG.md'), `# Changelog\n\n## [Unreleased]\n\n### Added\n\n- Manual feature\n\n${published}`);
  commit(':sparkles: New feature');
  generate();
  commit('🐛 Correct behavior');
  commit('✨ Another feature');
  generate();
  const result = readChangelog();
  expect(result.match(/^### Added$/gm)).toHaveLength(1);
  expect(result).toContain('### Added\n\n- ✨ Another feature\n- :sparkles: New feature\n- Manual feature');
  expect(result).toContain('### Fixed\n\n- 🐛 Correct behavior');
  expect(result).not.toContain('### Deprecated');
  expect(result.endsWith(published)).toBe(true);
});

it('categorizes legacy flat entries while preserving manual notes and custom sections', () => {
  writeFileSync(join(directory, 'CHANGELOG.md'), '# Changelog\n\n## [Unreleased]\n\nManual note\n\n- ✨ Existing feature\n- 🐛 Existing fix\n\n### Notes\n\n- Keep this note\n');
  generate();
  const result = readChangelog();
  expect(result).toContain('Manual note');
  expect(result).toContain('### Notes\n\n- Keep this note');
  expect(result).toContain('### Added\n\n- ✨ Existing feature');
  expect(result).toContain('### Fixed\n\n- 🐛 Existing fix');
  commit(':sparkles: Next feature');
  generate();
  expect(readChangelog()).toContain('### Added\n\n- :sparkles: Next feature\n- ✨ Existing feature');
});
