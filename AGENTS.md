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

- React and React DOM, using stable releases;
- TypeScript;
- Vite;
- React Router in declarative mode;
- Zustand;
- npm;
- Tailwind CSS with the Vite plugin;
- native CSS with CSS Modules for component styles;
- BEM-style naming for custom CSS classes, with the modifier convention defined below;
- Vitest;
- React Testing Library.

Use React's built-in state for local component state. Use Zustand when shared state is needed; do not create stores before they have a concrete use.

Do not use:

- Sass/SCSS or another CSS preprocessor;
- a UI component library unless explicitly approved.

The frontend is intended to connect to Supabase later. Do not implement or configure Supabase until requested.

The application must remain compatible with static hosting such as GitHub Pages.

## Initial setup

Keep the initial project minimal.

Do not create demo pages, demo components, sample assets, counters, or other starter content.

Use a conventional React project structure, but create directories such as `components`, `views`, `stores`, `hooks`, `services`, or `types` only when they are actually needed.

Configure the `@/` alias for `src/`.

## Naming

React component files use PascalCase and the `.tsx` extension:

- `ProducerCard.tsx`
- `ProducerDetails.tsx`

TypeScript files use camelCase where appropriate:

- `useProducer.ts`
- `producerService.ts`

Use function components with PascalCase names. Custom hook names start with `use`.

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

Use Tailwind CSS and native CSS, without Sass/SCSS.

Use Tailwind utility classes directly in JSX for layout, spacing, sizing, positioning, alignment, and their responsive variants.

Use custom classes with `@apply` for visual styling: colors, typography, borders, radii, shadows, transitions, and visual states. Keep responsive variants of visual styles in these classes too.

Exception: static text within a page may use Tailwind typography and text color utilities directly in JSX, including responsive variants. A custom class is not required solely to style static page text. Continue using project tokens.

Write one `@apply` statement for the base appearance and one separate statement per state (hover, active, focus-visible, disabled, etc.). Prefer native states where available. Guard hover and active styles with `enabled:` when they should not apply to disabled controls.

Add smooth transitions for interactive visual state changes (hover, active, focus, disabled, etc.). Default to `duration-200 ease-out`, target only the properties that change, and include `motion-reduce:transition-none`. Keep focus indicators immediately visible. For state overlays, transition the registered color property `--_state-overlay`, not `background-image`; keep the composed background layers present in the base style so transitions also work when leaving a state. Avoid `transition-all`.

When listing internal properties containing underscores in `transition-property`, use a native CSS declaration; Tailwind arbitrary values interpret unescaped underscores as spaces.

Complex layouts may use a custom class with `@apply`. Use plain CSS declarations when they express a complex rule more clearly; do not force everything into utilities or arbitrary values.

Keep global styles in `src/assets/css/`, with `main.css` as the single entry imported by `src/main.tsx`. This directory contains the Tailwind integration and, when defined, design tokens and global base styles. Create additional files only when needed and import them from this entry. Tailwind Preflight provides the initial reset; do not add another reset without a demonstrated need and validation.

Use CSS Modules named after the component, such as `ProducerCard.module.css`, for component styles. Access custom classes through the imported module in JSX, including modifier classes. When using Tailwind directives such as `@apply`, add `@reference` pointing to the global Tailwind entry (`src/assets/css/main.css`), using the appropriate relative path.

Name custom classes as `block` and `block__element`. Add modifiers as separate classes named `-modifier`, and always qualify their selectors with the base class: `.block.-modifier` or `.block__element.-modifier`. Never define standalone global modifier selectors.

Design tokens use CSS custom properties as their source of truth: primitive palette values feed semantic tokens. Expose all semantic color tokens through explicit `@utility` definitions: `--bg-*` maps to `bg-*` (`background-color`), `--text-*` to `text-*` (`color`), and `--border-*` to `border-*` (`border-color`). Utilities must reference the semantic CSS custom property, not its resolved palette value. Custom CSS consumes the same properties. Do not duplicate tokens in another variable system.

Keep palette values in `src/assets/css/palette.css`, semantic colors and state overlays in `tokens/colors.css`, typography in `tokens/typography.css`, shadows in `tokens/shadows.css`, background gradients in `tokens/gradients.css`, and custom Tailwind mappings in `utilities.css`. Import all token files from `main.css`. The palette is available only to define semantic tokens; do not expose palette utilities or consume raw palette values in components. The default `:root` semantic values represent the light theme. Future light/dark theming must override these same semantic properties so component classes remain unchanged. Do not invent dark values or choose a theme switching mechanism before requested.

Use semantic tokens for component appearance rather than raw palette values. The user defines token names and values; do not invent or rename them without validation.

Define font sizes (`--text-*`), font weights (`--font-weight-*`), and box shadows (`--shadow-*`) in `@theme` in their respective token files. Keep size and weight separate: combine utilities such as `text-xl font-extrabold` in custom component classes. Do not add line heights unless defined by the user. Reset the default `--color-*`, `--text-*`, `--font-weight-*`, and `--shadow-*` theme namespaces to `initial` in their respective token files before defining project values, so the default catalogs do not remain alongside project tokens. Preserve Tailwind's layout, spacing, and responsive defaults.

State overlay tokens (`--state-on-*`) use `color-mix()` with a semantic background token and transparency. Their matching `state-on-*` utilities compose a uniform overlay above the background gradient, preserving the background color and content opacity. Apply them through the appropriate hover/active variants. Background gradient tokens (`--bg-gradient-*`) map to matching `bg-gradient-*` utilities. Gradient and state utilities share a two-layer `background-image` composition using non-inheriting internal CSS properties (`--_state-overlay` and `--_bg-gradient`), with transparent defaults so they also work independently and do not leak into descendants. The overlay property is registered as `<color>` so it can interpolate smoothly. Other background images require explicit composition. The `on-dark` suffix describes the background they are used on, not the application's color mode.

Prefer semantic HTML and accessible native elements over custom equivalents.

Target WCAG 2.2 AA.

Do not introduce design tokens, a Design System, or UI abstractions before they are needed or explicitly defined.

## ESLint and Prettier

Use the recommended JavaScript, TypeScript, and React Hooks ESLint configurations, along with the React Refresh Vite configuration, as the baseline.

Apply these conventions:

- single quotes;
- semicolons;
- trailing commas everywhere supported;
- print width: 200;
- indentation: 2 spaces;
- line endings: LF;
- arrow function parentheses: always;
- quote properties: as needed;
- JSX attributes: one per line when multiline;
- `console`: warning;
- `debugger`: error;
- explicit `any`: warning;
- unused variables: error;
- require strict equality (`===`);
- disallow `var`;
- prefer `const` when possible;
- do not enforce artificial import ordering;
- do not mutate React props or state.

Formatting concerns should be handled by Prettier rather than duplicated in ESLint where possible.

## Tests

Use Vitest and React Testing Library.

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
4. Write the corresponding `CHANGELOG.md` entry from the changes included in the release.
5. Commit the version bump on the release branch.
6. Merge the release branch into `main` after validation.

`package.json` is the source of truth for the application version.

The application version should be made available to the frontend at build time without maintaining a duplicate version manually in an environment file.

A merge into `main` is intended to trigger the production deployment.

Do not infer major/minor/patch automatically from Gitmoji or commit messages.

## CHANGELOG

Update `CHANGELOG.md` only when preparing a release. Do not add entries during ordinary development tasks. During release preparation, summarize the changes included in that release.

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
