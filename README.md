# SCPlantae

## Commands

- Install dependencies: `npm install`
- Start local development: `npm run dev`
- Create a production build: `npm run build`
- Generate the upcoming changelog: `npm run changelog`

## CI and deployment

The workflows are separated by purpose: `CI` validates pushes and pull requests, `Release source` checks PRs targeting `main`, `Changelog` handles pushes to `release/*`, and `Deploy` handles pushes to `main`. Changelog and Deploy reuse CI and wait for successful checks.

To redeploy production manually, open **Actions → Deploy → Run workflow**, select **main**, and confirm. The workflow rebuilds and validates `main` before deploying it. The workflow file must also exist on the repository's default branch for the manual trigger to be available.

## Changelog

`npm run changelog` reads the full Git history and adds missing commit subjects (without their descriptions), newest first, at the top of `[Unreleased]`. It compares titles exactly against Markdown list entries in every changelog section (`- title`, `* title`, or `+ title`). Existing entries and manual content are preserved. Running it again does not append duplicates; distinct commits with the same title produce only one entry. Rewording an entry can cause the original title to be added again. No release tag is needed.

The script is in `scripts/changelog.mjs` and uses only Node.js and Git. It reads the history, formats each message as a Markdown list item, and writes the section. It does not choose or change the application version, create commits, or create tags.

On every push to a `release/*` branch, CI runs the command after successful checks and commits only `CHANGELOG.md` if it changed, using `:memo: Update changelog`. This exact commit subject is excluded from generated entries. CI fetches the full history, and uses its `GITHUB_TOKEN` with write access for this job; its push does not trigger another workflow run. Repository rules must allow this bot push. If the branch moves before the push, the job fails rather than overwriting newer commits; the workflow for the newer push will generate the updated changelog.

When preparing a release, run the command before the release commit, finalize `[Unreleased]` with the manually chosen version and date, and leave an empty `[Unreleased]` section above it. Tags may still identify published versions, but they do not affect changelog generation.
