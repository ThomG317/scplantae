# SCPlantae

## Commands

- Install dependencies: `npm install`
- Start local development: `npm run dev`
- Create a production build: `npm run build`
- Generate the upcoming changelog: `npm run changelog`

## CI and deployment

The workflows are separated by purpose: `CI` validates pushes and pull requests, `Release source` checks PRs targeting `main`, and `Deploy` handles pushes to `main`. Deploy reuses CI and waits for successful checks.

To redeploy production manually, open **Actions → Deploy → Run workflow**, select **main**, and confirm. The workflow rebuilds and validates `main` before deploying it. The workflow file must also exist on the repository's default branch for the manual trigger to be available.

## Changelog

`npm run changelog` adds missing commit subjects (without their descriptions) to `[Unreleased]`, grouped by Gitmoji into Added, Changed, Fixed, Deprecated, Removed, and Maintenance, newest first within each category. Merge commits and application version bumps are excluded; dependency updates are retained. It reads commits after the latest application version-bump commit reachable from `HEAD` (recognized from its subject using the same flexible rule as excluded bumps), or the full history if none exists. No release tag is needed.

Titles are compared exactly against Markdown list entries in every changelog section (`- title`, `* title`, or `+ title`). Existing entries and manual content are preserved. Running the command again does not append duplicates; distinct commits with the same title produce only one entry. Rewording an entry can cause the original title to be added again on a subsequent run.

The script is in `scripts/changelog.mjs` and uses only Node.js and Git. It reads the history, formats each message as a Markdown list item, and writes the section. It does not choose or change the application version, create commits, or create tags.

Changelog generation is manual and does not run in CI. When preparing a release, update the version in `package.json` and the lockfile, run `npm run changelog`, review and edit the generated entries, finalize `[Unreleased]` with the manually chosen version and date, and leave an empty `[Unreleased]` section above it. Run the command before committing the new bump: a bump already at `HEAD` becomes the boundary and produces no new entries. Include the changelog in the version-bump commit; no separate changelog commit is required. Tags may still identify published versions, but they do not affect changelog generation.
