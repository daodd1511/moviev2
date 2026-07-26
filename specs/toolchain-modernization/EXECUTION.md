# Toolchain Modernization — Execution Plan

Spec: [PLAN.md](PLAN.md). Rulebook: `CLAUDE.md` → "Spec-Driven Execution Workflow".
Integration branch: `redesign`. Branch model: stacked, local-only by explicit user override
on 2026-07-25; phase branches remain local and PR CI is replaced by the equivalent local lane.

## STATUS

- Current phase: 3 — done
- Phase 1 — pnpm workspace: done
- Phase 2 — Oxfmt: done
- Phase 3 — Oxlint: done
- Phase 4 — React 19: pending
- Phase 5 — TypeScript 6 bridge: pending
- Phase 6 — TypeScript 7: pending
- Phase 7 — final audit: pending
- Verification debt: none

## Phase 1 — pnpm workspace

Branch: `toolchain-modernization/phase-1-pnpm` (off `redesign`, stacked)

The shared workspace, runtime, lockfile, Docker layout, and PR CI must land before tool or framework upgrades.

- [x] Record the pre-migration web lint/build and API syntax baseline before editing manifests, per PLAN.md → "Phase 0".
- [x] Add `pnpm-workspace.yaml`; update root `package.json` with pnpm 11.17.0, Node ≥22.20, filtered scripts, and root `typecheck`/`format:check` commands.
- [x] Rename `apps/web/package.json` to `@movie/web` and `apps/api/package.json` to `@movie/api`; align both Volta/runtime declarations to Node 22.
- [x] Generate root `pnpm-lock.yaml`; delete all three `package-lock.json` files and `apps/web/.npmrc`.
- [x] Update `apps/web/Dockerfile`, `apps/api/Dockerfile`, and `docker-compose.yml` for root build contexts, Corepack pnpm, Node 22, and `pnpm deploy --filter @movie/api --prod /prod/api`.
- [x] Update `.github/workflows/build.yml` for root Docker contexts and explicit Dockerfiles.
- [x] Add `.github/workflows/ci.yml` on `pull_request` with frozen install, format check, lint, typecheck, API syntax check, and web build; it must never publish images or use deployment secrets.
- [x] Replace active npm commands in `docs/deploy-flow.html`; leave completed historical specs unchanged.
- [x] (amended 2026-07-25) Preserve existing direct dependency resolutions in the application manifests before regenerating `pnpm-lock.yaml`, so Phase 1 does not silently upgrade application APIs.
- [x] (amended 2026-07-25) Keep Phase 1 CI checks non-mutating: split web `lint`/`lint:fix` and scope the transitional Prettier check to the three changed manifests, leaving the repository-wide formatting rewrite to Phase 2.
- [x] (amended 2026-07-25) Fix web `nginx.conf` copying for the root Docker context and add a root `.dockerignore` so dependencies, builds, environment files, and repository-only files are not sent to either image build.

**Agent gate (hard):**

- [x] `pnpm install --frozen-lockfile`
- [x] `pnpm typecheck && pnpm --filter @movie/web build`
- [x] `find apps/api -name '*.js' -not -path '*/node_modules/*' -exec node --check {} \;` (no automated test suite exists, per PLAN.md)
- [x] `docker build -f apps/web/Dockerfile . && docker build -f apps/api/Dockerfile .`
- [x] CI-equivalent local lane passes; remote PR/CI explicitly waived by the user on 2026-07-25.

**Review checklist (user, after phase):**

- [ ] `pnpm dev:web` and `pnpm dev:api` start through the new root workspace scripts.

**On completion:** run the hard gate plus the CI-equivalent local lane, update STATUS +
checkboxes, commit the phase, and stop for explicit approval before starting the next phase.

## Phase 2 — Oxfmt

Branch: `toolchain-modernization/phase-2-oxfmt` (off `toolchain-modernization/phase-1-pnpm`, stacked)

Formatting is isolated so its one-time rewrite cannot obscure lint, React, or TypeScript behavior changes.

- [x] Add root `oxfmt` and `.oxfmtrc.json` with `printWidth: 100`, import sorting off, and package sorting off to avoid unrelated manifest churn.
- [x] Configure Tailwind v4 sorting against `apps/web/src/index.css` for `cn`, `clsx`, and `cva`.
- [x] Replace root/web format scripts with Oxfmt write/check commands; remove `prettier` and `prettier-plugin-tailwindcss` from `apps/web/package.json`.
- [x] Remove or translate active Prettier editor settings, ignore files, and inline directives found by the Phase 1 baseline.
- [x] Run Oxfmt once across tracked source/config/documentation files and keep the formatting-only diff in this phase.
- [x] (amended 2026-07-25) Disable only formatter-owned rules in `apps/web/.eslintrc.cjs` that conflict with Oxfmt, retaining correctness linting until the Phase 3 Oxlint replacement.

**Agent gate (hard):**

- [x] `pnpm format`
- [x] `pnpm format:check`
- [x] `pnpm typecheck && pnpm --filter @movie/web build`
- [x] CI-equivalent local lane passes; no remote PR/CI for this spec.

**Review checklist (user, after phase):**

- [ ] Inspect representative TSX and Tailwind-heavy files and accept the one-time Oxfmt layout.

**On completion:** run the hard gate plus the CI-equivalent local lane, update STATUS +
checkboxes, commit the phase, and stop for explicit approval before starting the next phase.

## Phase 3 — Oxlint

Branch: `toolchain-modernization/phase-3-oxlint` (off `toolchain-modernization/phase-2-oxfmt`, stacked)

The linter replacement establishes the final high-signal policy before framework types change.

- [x] Add root `oxlint`, `oxlint-tsgolint`, and `.oxlintrc.json` with type-aware TypeScript, React/Hooks, JSX accessibility, import, promise, and API-only Node rules.
- [x] Configure web browser globals, API Node globals, generated-path ignores, and only the retained rules in PLAN.md → "Small, high-signal lint policy".
- [x] Add non-mutating root `lint` and safe-only `lint:fix` scripts.
- [x] Remove `apps/web/.eslintrc.cjs`, `apps/api/.eslintrc.json`, `@chernodub/eslint-config`, and every ESLint package from both application manifests.
- [x] Remove obsolete ESLint directives, including `apps/web/src/routes/Router.tsx`, and fix Oxlint findings without restoring dropped style/JSDoc rules.
- [x] (amended 2026-07-26) Add `apps/web/src/tsconfig.json` as a temporary
      type-aware-lint project using TypeScript 7-compatible options. `oxlint-tsgolint` uses
      the TypeScript 7 compiler and rejects the application’s TypeScript 4.8
      `moduleResolution: "Node"` before Phase 5 can migrate it; remove this shim when Phase 5
      updates the authoritative application configs.

**Agent gate (hard):**

- [x] `pnpm lint:fix && pnpm lint`
- [x] `pnpm typecheck && pnpm --filter @movie/web build`
- [x] `find apps/api -name '*.js' -not -path '*/node_modules/*' -exec node --check {} \;` (no automated test suite exists, per PLAN.md)
- [x] `rg -n 'eslint|@chernodub' package.json apps --glob 'package.json' --glob '.eslintrc*'` returns no matches
- [x] CI-equivalent local lane passes; no remote PR/CI for this spec.

**Review checklist (user, after phase):**

- [ ] Confirm the reduced diagnostics are useful and do not enforce JSDoc, naming, ordering, or formatting preferences.

**On completion:** run the hard gate plus the CI-equivalent local lane, update STATUS +
checkboxes, commit the phase, and stop for explicit approval before starting the next phase.

## Phase 4 — React 19

Branch: `toolchain-modernization/phase-4-react-19` (off `toolchain-modernization/phase-3-oxlint`, stacked)

React and its peer-blocking data/form packages move together so the workspace never lands with unsupported peers.

- [ ] Upgrade React/React DOM and `@types/react`/`@types/react-dom` together in `apps/web/package.json`.
- [ ] Upgrade TanStack Query/devtools to v5 and migrate `apps/web/src/stores/queries/*.ts`, `apps/web/src/App.tsx`, and all mutation consumers under `features/Auth`, `features/List`, and `shared/components/List/Menu.tsx`.
- [ ] Update TanStack v5 loading/pending state consumers across `apps/web/src/features` and `apps/web/src/shared/components`.
- [ ] Upgrade React Hook Form within v7; update `@hookform/resolvers` only if peer compatibility requires it, retaining Zod 3.
- [ ] Resolve React 19 ref/type changes in `apps/web/src/components/ui/{input,input-group,textarea}.tsx`, `apps/web/src/shared/components/ui/TextField.tsx`, hooks using `useRef`, and `apps/web/src/main.tsx`.
- [ ] Review React 19 codemod output before retaining it; do not enable React Compiler or perform speculative memo/`forwardRef` cleanup.

**Agent gate (hard):**

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm --filter @movie/web build`
- [ ] `pnpm install --frozen-lockfile` reports no unsupported React peer dependency
- [ ] CI-equivalent local lane passes; no remote PR/CI for this spec.

**Review checklist (user, after phase):**

- [ ] Verify authentication forms, search, menus/dialogs, list mutations, media/person loading, and mobile navigation in the browser.

**On completion:** run the hard gate plus the CI-equivalent local lane, update STATUS +
checkboxes, commit the phase, and stop for explicit approval before starting the next phase.

## Phase 5 — TypeScript 6 bridge

Branch: `toolchain-modernization/phase-5-typescript-6` (off `toolchain-modernization/phase-4-react-19`, stacked)

TypeScript 6 removes legacy configuration before the native compiler makes those deprecations hard errors.

- [ ] Upgrade `typescript` in `apps/web/package.json` to the latest stable 6.x release.
- [ ] Update `apps/web/tsconfig.json` and `apps/web/tsconfig.node.json` to bundler resolution with explicit `rootDir`/`types` where required; remove obsolete or forbidden options.
- [ ] Keep root/web `typecheck` on `tsc --noEmit`; resolve TypeScript 6 diagnostics without `ignoreDeprecations`, weaker strictness, broad casts, or new skip-check workarounds.
- [ ] Regenerate `pnpm-lock.yaml` and confirm no package requires the removed TypeScript 4.8 behavior.

**Agent gate (hard):**

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm --filter @movie/web build`
- [ ] `pnpm format:check`
- [ ] CI-equivalent local lane passes; no remote PR/CI for this spec.

**Review checklist (user, after phase):**

- [ ] Smoke-test the same primary routes after the compiler-only migration; no intended UI behavior changes.

**On completion:** run the hard gate plus the CI-equivalent local lane, update STATUS +
checkboxes, commit the phase, and stop for explicit approval before starting the next phase.

## Phase 6 — TypeScript 7

Branch: `toolchain-modernization/phase-6-typescript-7` (off `toolchain-modernization/phase-5-typescript-6`, stacked)

The native compiler cutover follows the clean TypeScript 6 checkpoint and removes the incompatible Vite checker API consumer.

- [ ] Remove `vite-plugin-checker` from `apps/web/package.json` and its `checker()` registration/import from `apps/web/vite.config.ts`.
- [ ] Upgrade `typescript` to the latest stable 7.x release and regenerate `pnpm-lock.yaml`.
- [ ] Resolve TypeScript 7 native compiler/configuration differences while keeping `tsc` as the authoritative typecheck/build gate.
- [ ] Confirm no TypeScript 6 compatibility alias or legacy compiler API consumer remains in manifests or tooling configuration.

**Agent gate (hard):**

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm format:check`
- [ ] `pnpm --filter @movie/web build`
- [ ] `pnpm --filter @movie/web exec tsc --version` reports the pinned TypeScript 7 release
- [ ] CI-equivalent local lane passes; no remote PR/CI for this spec.

**Review checklist (user, after phase):**

- [ ] Confirm editor TypeScript diagnostics and completion work with the TypeScript 7 language server.

**On completion:** run the hard gate plus the CI-equivalent local lane, update STATUS +
checkboxes, commit the phase, and stop for explicit approval before starting the next phase.

## Phase 7 — final audit

Branch: `toolchain-modernization/phase-7-final-audit` (off `toolchain-modernization/phase-6-typescript-7`, stacked)

The final phase removes active migration residue and proves the complete workspace and container paths from a frozen install.

- [ ] Run the PLAN.md → "Phase 7 — Final audit" repository search and remove active npm/npx, ESLint, `@chernodub`, Prettier, checker, peer, and TypeScript compatibility residue.
- [ ] Update active toolchain references in `docs/deploy-flow.html`, Docker comments, root scripts, and editor recommendations; leave completed historical specs intact.
- [ ] Verify root `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.oxlintrc.json`, and `.oxfmtrc.json` describe the final pinned toolchain.

**Agent gate (hard):**

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm format:check && pnpm lint && pnpm typecheck && pnpm --filter @movie/web build`
- [ ] `find apps/api -name '*.js' -not -path '*/node_modules/*' -exec node --check {} \;` (no automated test suite exists, per PLAN.md)
- [ ] `docker build -f apps/web/Dockerfile . && docker build -f apps/api/Dockerfile .`
- [ ] CI-equivalent local lane passes; no remote PR/CI for this spec.

**Review checklist (user, after phase):**

- [ ] Perform the final browser walkthrough; agent verification is CLI-only by explicit project directive.

**On completion:** run the hard gate plus the CI-equivalent local lane, update STATUS +
checkboxes, commit the phase, and stop for explicit approval before starting the next phase.
