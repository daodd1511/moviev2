# Toolchain Modernization Plan

Written 2026-07-24 for the `moviev2` repository.

## Outcome

Replace the current JavaScript toolchain completely:

- npm → pnpm 11 workspace
- ESLint → Oxlint
- Prettier → Oxfmt
- React 18 → React 19.2
- TypeScript 4.8 → TypeScript 7

The final repository must contain no npm lockfiles, ESLint packages/configs,
Prettier packages/configs, or `@chernodub/eslint-config`.

## Decisions

### Full replacement, not a hybrid

ESLint and Prettier may be used temporarily to compare output during a phase,
but neither remains in the final dependency graph or scripts. Oxlint and Oxfmt
become the only lint and format tools.

### Small, high-signal lint policy

Do not reproduce the old configuration rule-for-rule. Keep rules that catch
likely defects and remove rules that primarily enforce taste or ceremony.

Keep:

- Oxlint correctness and suspicious diagnostics
- unused variables/imports
- explicit rejection of `any` in application TypeScript
- floating and misused promise checks
- React Hooks correctness
- React/JSX correctness
- practical JSX accessibility checks
- Node and promise correctness for the API
- `tsc` strict mode as the authoritative type check

Remove:

- all `@chernodub/eslint-config` rules
- JSDoc-required rules
- function return-type requirements
- naming conventions and member ordering
- function/component declaration-style rules
- arrow-paren, spacing, linebreak, and other formatting rules
- maximum line/function/class-count rules
- the custom AST selectors enforcing readonly `Props`
- strict boolean-expression rules that reject ordinary, safe truthiness
- rules duplicated by TypeScript, Oxfmt, or the React compiler/runtime

Do not enable Oxlint's JavaScript-plugin compatibility layer unless a concrete,
high-value missing rule is identified. Prefer native Oxlint plugins.

### TypeScript 7 is a deliberate second jump

TypeScript 7 has no legacy programmatic compiler API. The current
`vite-plugin-checker` imports that API and must be removed before TypeScript 7
is installed.

Use TypeScript 6 temporarily as a migration bridge:

1. Upgrade 4.8 → 6 and resolve deprecations/configuration errors.
2. Remove `vite-plugin-checker`.
3. Upgrade 6 → 7 and resolve native-compiler differences.

TypeScript 6 is an implementation checkpoint, not the final pinned version.

### Dependency scope

Upgrade React and the packages directly blocking React 19:

- `react`
- `react-dom`
- `@types/react`
- `@types/react-dom`
- `@tanstack/react-query`
- `@tanstack/react-query-devtools`
- `react-hook-form`
- `@hookform/resolvers` only if required by the selected form stack

Do not combine unrelated major migrations such as React Router 6 → 7, Jotai
1 → 2, or Zod 3 → 4 with this work. Report them as follow-up dependency debt.

### Runtime baseline

Standardize local development and both Docker builds on Node 22. pnpm 11
requires Node 22 when installed through Node, Vite 8 already supports it, and
using one version avoids separate web/API package-manager behavior.

Pin the exact package manager in the root manifest:

```json
{
  "packageManager": "pnpm@11.17.0",
  "engines": {
    "node": ">=22.20.0"
  }
}
```

### Verification boundary

The agent performs CLI verification only. Do not open or test the application
in a browser. The user owns visual and interaction testing.

No test suite currently exists. Do not create a test framework as a toolchain
migration side task, and do not treat the API's intentionally failing
placeholder `test` script as a valid gate.

Execution is local-only by explicit user direction on 2026-07-25. Keep the
stacked phase branches and commits, but replace phase PR/CI checkpoints with
the equivalent frozen-install, format, lint, typecheck, syntax, build, and
container checks run locally. Do not claim remote CI ran.

## Target structure

```text
moviev2/
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── .oxlintrc.json
├── .oxfmtrc.json
└── apps/
    ├── api/
    │   └── package.json
    └── web/
        ├── package.json
        └── tsconfig*.json
```

Use unique workspace package names:

- root: `moviev2`
- web: `@movie/web`
- API: `@movie/api`

Developer-wide tools (`oxlint`, `oxlint-tsgolint`, and `oxfmt`) live in the
root `devDependencies`. Application dependencies remain in their package
manifests.

## Phase 0 — Baseline and dependency audit

Before changing manifests:

- Confirm the worktree state and preserve unrelated user changes.
- Record current versions and peer ranges.
- Run the existing web lint and production build.
- Run syntax checks over API JavaScript files.
- Record current Docker build commands.
- Identify inline `eslint-*` and `prettier-*` directives.

Hard gate:

- Existing web lint passes.
- Existing web build passes.
- Any pre-existing API syntax failure is documented before migration.

## Phase 1 — pnpm workspace and Node 22

### Workspace

- Add `pnpm-workspace.yaml` with `apps/*`.
- Add the pinned `packageManager` and Node engine to the root manifest.
- Rename the two application packages to unique scoped names.
- Replace root `npm --prefix` scripts with pnpm filters.
- Add root scripts for development, build, typecheck, lint, and formatting.
- Remove `install:all`; a root `pnpm install` installs the workspace.
- Remove `apps/web/.npmrc`; `legacy-peer-deps` is an npm workaround and must
  not survive the migration.

### Lockfiles

- Generate one root `pnpm-lock.yaml`.
- Remove:
  - `/package-lock.json`
  - `/apps/web/package-lock.json`
  - `/apps/api/package-lock.json`
- Run `pnpm install --frozen-lockfile` after generation to verify
  reproducibility.

### Docker and CI

A single workspace lockfile requires the Docker build context to be the
repository root.

- Change Compose web/API build contexts to `.` and select each Dockerfile.
- Change GitHub Actions Docker contexts to `.` and set each `file`.
- Update both Dockerfiles to enable the pinned pnpm through Corepack.
- Copy the root manifest, workspace file, lockfile, and package manifests
  before installation to preserve layer caching.
- Web image: install the filtered web dependency graph and run the web build.
- API image: use `pnpm deploy --prod` or another verified portable deployment
  layout so runtime symlinks never point outside the copied image tree.
- Move the API build/runtime image from Node 20 to Node 22.
- Update stale npm commands in active deployment documentation. Historical
  completed specs may retain old command text when clearly historical.

Hard gate:

- `pnpm install --frozen-lockfile`
- filtered web build
- API production dependency deployment
- both Docker images build
- no active npm command remains in manifests, Dockerfiles, Compose, or CI
- no `package-lock.json` remains

## Phase 2 — Oxfmt replacement

- Add root `oxfmt`.
- Add `.oxfmtrc.json`.
- Remove `prettier` and `prettier-plugin-tailwindcss`.
- Replace format scripts with:
  - `format`: write formatting
  - `format:check`: check without writing
- Configure the intended style explicitly rather than relying on defaults.
- Use `printWidth: 100`; the codebase contains long Tailwind class lists.
- Enable Tailwind v4 sorting with:
  - stylesheet: `apps/web/src/index.css`
  - functions: `cn`, `clsx`, and `cva`
- Disable import sorting initially. Import movement is unrelated to formatting
  and can reorder side-effect-sensitive code.
- Decide explicitly whether package manifest sorting is enabled; do not accept
  an accidental manifest-wide reorder.
- Replace or remove formatter-specific editor settings and directives.
- Run Oxfmt once in a dedicated formatting change so functional migrations
  remain reviewable.

Hard gate:

- `pnpm format:check`
- second `pnpm format` produces no diff
- Tailwind classes still compile in the web production build
- no Prettier dependency or active configuration remains

## Phase 3 — Oxlint replacement

### Configuration

- Add one root `.oxlintrc.json`.
- Enable native plugins required by the repository:
  - TypeScript
  - React/React Hooks
  - JSX accessibility
  - import
  - promise
  - Node for the API override
- Enable type-aware linting with `oxlint-tsgolint`.
- Apply browser/React globals only to `apps/web`.
- Apply Node globals and Node rules only to `apps/api`.
- Ignore generated output, dependencies, coverage, and documentation assets.

### Removal

Remove all ESLint dependencies from both applications, including:

- `eslint`
- `@chernodub/eslint-config`
- `@typescript-eslint/eslint-plugin`
- `eslint-config-standard-with-typescript`
- `eslint-config-standard`
- `eslint-plugin-import`
- `eslint-plugin-n`
- `eslint-plugin-promise`
- `eslint-plugin-react`

Remove:

- `apps/web/.eslintrc.cjs`
- `apps/api/.eslintrc.json`
- obsolete inline ESLint directives

Do not retain ESLint as a fallback. If an old rule has no native equivalent,
either replace it with a simpler high-value rule or drop it.

### Scripts

- `lint`: diagnostics only; it must never mutate files.
- `lint:fix`: safe Oxlint fixes.
- Do not enable `--fix-suggestions` or `--fix-dangerously` in package scripts.

Hard gate:

- `pnpm lint`
- `pnpm lint:fix`, followed by `pnpm lint`, is stable
- `pnpm typecheck`
- no ESLint or `@chernodub` package/config remains
- no JSDoc-only or formatting-only lint rule is reintroduced

## Phase 4 — React 19.2

- Upgrade React, React DOM, and their type packages together.
- Upgrade TanStack Query to a React-19-compatible v5 release and migrate its
  object signatures, status names, cache timing options, and devtools usage.
- Upgrade React Hook Form within v7 to a React-19-compatible release.
- Upgrade resolvers only when needed for peer compatibility; do not introduce
  a Zod 4 migration implicitly.
- Run the official React 19 type codemods where useful, then review every
  generated change.
- Fix React 19 type errors without casts that hide incompatibility.
- Keep existing `forwardRef` components working during the upgrade. Refactor
  them to ref-as-prop only when the result is simpler and behavior-preserving.
- Do not enable React Compiler in this phase.
- Do not remove existing memoization as an unmeasured cleanup.

Codebase-specific checks:

- Root creation remains on `createRoot`.
- Ref callbacks do not accidentally return values.
- `useRef` calls have valid initial values.
- No removed React DOM API or legacy JSX namespace remains.
- Query invalidation and loading/error states preserve current behavior.

Hard gate:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm --filter @movie/web build`
- no unsupported React peer dependency remains in the lockfile report

User review after the phase:

- Authentication forms
- search
- menus/dialogs
- list mutations
- movie/TV/person data loading
- mobile navigation

## Phase 5 — TypeScript 6 bridge

- Upgrade TypeScript 4.8 to the latest TypeScript 6 release temporarily.
- Change Vite projects to `moduleResolution: "Bundler"`.
- Remove obsolete or forbidden compiler settings.
- Resolve deprecations instead of suppressing them with
  `ignoreDeprecations`.
- Make `rootDir`, `types`, and project-reference behavior explicit where
  required.
- Add a dedicated `typecheck` script using `tsc --noEmit`.
- Fix new diagnostics with explicit types and valid narrowing; do not weaken
  strict mode, add broad casts, or enable `skipLibCheck` as a new workaround.

Hard gate:

- TypeScript 6 typecheck and build pass without deprecation suppression.

## Phase 6 — TypeScript 7 cutover

- Remove `vite-plugin-checker` from dependencies and `vite.config.ts`.
- Upgrade TypeScript to the latest stable 7.x release.
- Confirm `tsc` resolves to the native TypeScript 7 executable.
- Resolve native compiler/configuration differences.
- Keep `tsc` as the build/typecheck authority; Oxlint type checking is an
  additional diagnostic layer, not the sole production gate.
- Update editor recommendations for the TypeScript 7 language server if the
  repository contains editor configuration.

Hard gate:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm format:check`
- `pnpm --filter @movie/web build`
- `vite-plugin-checker` is absent
- no TypeScript 6 compatibility alias remains

## Phase 7 — Final audit

Run:

- frozen pnpm install from a clean dependency state
- Oxfmt check
- Oxlint, including type-aware rules
- TypeScript typecheck
- web production build
- API JavaScript syntax checks
- web Docker build
- API Docker build

Audit the repository:

```text
npm / npx commands in active automation
package-lock.json
.eslintrc*
eslint packages or directives
@chernodub/eslint-config
prettier packages or directives
vite-plugin-checker
legacy-peer-deps
React 18 peer constraints
TypeScript 6 compatibility aliases
```

Expected final state:

- one pnpm workspace
- one lockfile
- Node 22 across development and images
- Oxlint only
- Oxfmt only
- React 19.2
- TypeScript 7
- CLI gates green
- browser verification explicitly left to the user

## Commit boundaries

Do not commit unless the user asks. When asked, keep these logical boundaries:

1. pnpm workspace, Node, Docker, and CI
2. Oxfmt migration and one-time formatting
3. Oxlint migration and lint fixes
4. React 19 and directly coupled dependency migrations
5. TypeScript 6 configuration bridge
6. TypeScript 7 and `vite-plugin-checker` removal
7. final documentation cleanup, if needed

Never mix the one-time formatter rewrite with React or TypeScript behavior
changes.
