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
  writeFileSync(join(directory, 'CHANGELOG.md'), '# Changelog\n\n## [Unreleased]\n\nOld draft\n\n## [0.0.1]\n\nPublished entry\n');
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
  expect(result).toBe('# Changelog\n\n## [Unreleased]\n\n- New feature\n- Initial commit\n\n## [0.0.1]\n\nPublished entry\n');
  generate();
  expect(readChangelog()).toBe(result);
});

it('uses the closest release tag and ignores unrelated tags', () => {
  git('tag', 'v0.1.0');
  commit('Already released');
  git('tag', 'v0.2.0');
  commit('Upcoming fix');
  git('tag', 'preview');
  generate();
  expect(readChangelog()).toContain('- Upcoming fix');
  expect(readChangelog()).not.toContain('Already released');
  expect(readChangelog()).not.toContain('Initial commit');
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

it('leaves an empty Unreleased section when HEAD is tagged', () => {
  git('tag', 'v0.1.0');
  generate();
  expect(readChangelog()).toBe('# Changelog\n\n## [Unreleased]\n\n## [0.0.1]\n\nPublished entry\n');
});

it('fails without changing a changelog that has no Unreleased section', () => {
  writeFileSync(join(directory, 'CHANGELOG.md'), '# Changelog\n');
  const result = spawnSync(process.execPath, ['scripts/changelog.mjs'], { cwd: directory });
  expect(result.status).toBe(1);
  expect(result.stderr.toString()).toContain('must contain');
  expect(readChangelog()).toBe('# Changelog\n');
});
