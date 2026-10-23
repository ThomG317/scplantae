# SCPlantae

## Commands

- Install dependencies: `npm install`
- Start local development: `npm run dev`
- Create a production build: `npm run build`
- Generate the upcoming changelog: `npm run changelog`

## Changelog

`npm run changelog` replaces the `[Unreleased]` section in `CHANGELOG.md` with all commit subjects (without their descriptions), newest first, since the closest reachable release tag `vX.Y.Z`. Without a release tag, it includes the entire history. Published sections are preserved; running the command again does not append duplicates. Manual edits inside `[Unreleased]` are replaced.

The script is in `scripts/changelog.mjs` and uses only Node.js and Git. It reads the history, formats each message as a Markdown list item, and writes the section. It does not choose or change the application version, create commits, or create tags.

On every push to a `release/*` branch, CI runs the command after successful checks and commits only `CHANGELOG.md` if it changed, using `:memo: Update changelog`. This exact commit subject is excluded from generated entries. CI fetches the full history and tags, and uses its `GITHUB_TOKEN` with write access for this job; its push does not trigger another workflow run. Repository rules must allow this bot push. If the branch moves before the push, the job fails rather than overwriting newer commits; the workflow for the newer push will generate the updated changelog.

When preparing a release, run the command before the release commit, finalize `[Unreleased]` with the manually chosen version and date, and leave an empty `[Unreleased]` section above it. Once the release is validated and merged, tag its commit with the same version (for example, `git tag v0.1.0`). The next generation will include only commits after that tag. Release tags must be available locally.
