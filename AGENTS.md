# AGENTS.md

## Project context

This repository contains the frontend of a personal project for an internal tool used by a small agricultural consulting company (~3 users).

The product is currently in the discovery and business-requirements phase. Functional scope is not final.

Read `PROJECT.md` before making significant product or architectural decisions.

## Decision making

Do not make undefined structural decisions arbitrarily.

When a task requires a decision that is not already documented:

1. Identify the main relevant alternatives.
2. Briefly explain their advantages and drawbacks in the context of this project.
3. Ask for validation before implementing one of them.

Validation is required for decisions affecting:

- stack or dependencies;
- architecture;
- data model;
- project-wide conventions;
- UX/UI;
- business rules;
- security;
- deployment or infrastructure;
- functional scope.

If a decision is not required to complete the current task, leave it undefined so it can be handled manually later.

Local, reversible implementation choices that follow existing conventions do not require validation.

Never turn an assumption into a project decision.

## Frontend stack

Use:

- Vue 3;
- TypeScript;
- Vite;
- Vue Router;
- Pinia;
- npm;
- SCSS;
- BEM for CSS class naming;
- Vitest;
- Vue Test Utils.

Do not use:

- Tailwind CSS;
- a UI component library unless explicitly approved.

The frontend is intended to connect to Supabase later. Do not implement or configure Supabase until requested.

The application must remain compatible with static hosting such as GitHub Pages.

## Initial setup

Keep the initial project minimal.

Do not create demo pages, demo components, sample assets, counters, or other starter content.

Initially, `App.vue` must only render:

`Test`

Use a conventional Vue project structure, but create directories such as `components`, `views`, `stores`, `composables`, `services`, or `types` only when they are actually needed.

Configure the `@/` alias for `src/`.

## Naming

Vue component files use PascalCase:

- `ProducerCard.vue`
- `ProducerDetails.vue`

TypeScript files use camelCase where appropriate:

- `useProducer.ts`
- `producerService.ts`

Vue component names should be multi-word except for `App`.

## TypeScript

Use strict TypeScript.

Prefer type inference by default. Do not add explicit types when TypeScript can clearly infer them.

Explicit types are primarily expected for:

- business entities such as `Producer`, `Visit`, or `Document`;
- external contracts and APIs;
- cases where an explicit type materially improves safety or readability.

Avoid overtyping local variables and obvious return values.

`any` should produce a warning. Prefer a meaningful type or `unknown` when appropriate.

## Styling

Use SCSS and BEM.

Do not introduce Tailwind CSS or another styling system without validation.

Prefer semantic HTML and accessible native elements over custom equivalents.

Target WCAG 2.2 AA.

Do not introduce design tokens, a Design System, or UI abstractions before they are needed or explicitly defined.

## ESLint and Prettier

Use the recommended Vue and TypeScript ESLint configurations as the baseline.

Apply these conventions:

- single quotes;
- semicolons;
- trailing commas everywhere supported;
- print width: 200;
- indentation: 2 spaces;
- line endings: LF;
- arrow function parentheses: always;
- quote properties: as needed;
- Vue attributes: one per line when multiline;
- `console`: warning;
- `debugger`: error;
- explicit `any`: warning;
- unused variables: error;
- require strict equality (`===`);
- disallow `var`;
- prefer `const` when possible;
- do not enforce artificial import ordering;
- do not mutate Vue props.

Formatting concerns should be handled by Prettier rather than duplicated in ESLint where possible.

## Tests

Use Vitest and Vue Test Utils.

Test meaningful behavior. Do not write tests solely to increase coverage.

Do not introduce an arbitrary coverage target.

Do not add E2E tooling such as Playwright unless explicitly approved.

## README

Keep `README.md` minimal.

It should document only the essential commands for:

- installing dependencies with `npm install`;
- starting local development;
- creating a production build.

Add further documentation only when it becomes useful.

## Git

Use Gitmoji for commit messages.

Use these branch conventions:

- `feat/*`
- `fix/*`
- `refactor/*`
- `chore/*`
- `release/x.y.z`

Feature, fix, refactor, and chore branches merge into `develop`.

`develop` represents the current state of the next version.

Release branches are created from `develop` and merge into `main`.

`main` represents the production version.

After a release, synchronize `main` back into `develop` when necessary so release-specific changes are not lost.

## Versioning and releases

Use Semantic Versioning.

Version selection is manual.

When preparing a release:

1. Create `release/x.y.z` from `develop`.
2. Default to incrementing the patch version unless another version is explicitly chosen.
3. Update the version in `package.json` and related lockfile metadata.
4. Finalize the corresponding `CHANGELOG.md` entry.
5. Commit the version bump on the release branch.
6. Merge the release branch into `main` after validation.

`package.json` is the source of truth for the application version.

The application version should be made available to the frontend at build time without maintaining a duplicate version manually in an environment file.

A merge into `main` is intended to trigger the production deployment.

Do not infer major/minor/patch automatically from Gitmoji or commit messages.

## CHANGELOG

Maintain `CHANGELOG.md`.

During development, changes belong to the upcoming release.

The final version number is chosen manually when the release is prepared.

Do not introduce automatic version selection.

## CI/CD

The project should be compatible with GitHub Actions.

Pull requests should eventually support automated checks for:

- lint;
- TypeScript type checking;
- tests;
- production build;
- AI-assisted code review.

Do not choose or configure an AI code-review provider without explicit validation.

Deployment is intended to occur automatically when a release is merged into `main`.

GitHub-specific repository settings such as branch protection, secrets, permissions, and Pages configuration are managed separately from application code.

## General principles

Prefer simple solutions appropriate for a very small user base.

Avoid unnecessary dependencies and premature abstractions.

Keep the project easy to understand and maintain.

Do not implement speculative features.

Do not introduce paid services or dependencies without explicit validation.

Before significant implementation work:

1. inspect the existing project;
2. read the relevant documentation and conventions;
3. reuse existing patterns;
4. identify unresolved decisions;
5. ask for validation when required;
6. implement only what the task requires;
7. run the relevant lint, type-check, tests, and build checks afterward.
