# moviev2

Movie browser: React SPA (`apps/web`) + Express API (`apps/api`). Redesign in
progress — design authority is `DESIGN.md` (root); execution spec in
`specs/projection-room-redesign/`.

## Domain Model & Decisions

<!-- domain-rulebook v1 -->

`CONTEXT.md` (repo root) is the project's glossary. Use its canonical terms — and avoid the
synonyms it marks `_Avoid_` — in code, docs, specs, and UI copy. It is a glossary only:
never add schema, file references, or implementation detail to it.

Recording a new term, or a decision worth keeping? Read `docs/DOMAIN-RULEBOOK.md` first — it
routes between `CONTEXT.md`, `docs/adr/`, and a spec's `PLAN.md`, and defines what does and
doesn't qualify as an ADR.

## Backlog

`docs/BACKLOG.md` is the single inbox for fixes, features, and ideas (no separate
features doc). Capture via the `capture` skill: one line per item, `- [ ] <desc> (<date>)`,
appended to the matching section. Agents may capture proactively when they notice
out-of-scope issues, but must list those additions in the session's final summary.
Never auto-commit a capture. Delete a line only when the item ships or graduates into a
`docs/specs/<feature>/` plan.

## Spec-Driven Execution Workflow

Specs live in `specs/<feature>/`. Flow: `/grill-me` → `PLAN.md` → `/spec-plan` →
`EXECUTION.md` → `/spec-phase` per phase.

Binding on all work in this repo, spec skill or not:

- **Git is the authoritative state store.** Branch `<feature-slug>/phase-<n>-<desc>` encodes
  spec + phase and commits encode progress. Never infer spec state from prose, and never
  rewrite history to make it tidy.
- **One spec in flight.** Do not start or resume a second spec's phase while another has an
  unfinished one.
- **Never push, open a PR, or merge without a separate explicit ask** — regardless of what
  earlier work in the session was authorized.

Doing spec work? Read `specs/RULEBOOK.md` first — the state model (`done-with-debt`,
`[~]`, verification debt), the phase/spec gate tiers, branch model, checkpoints,
fresh-review triggers, and capability baseline are defined there, not here. Don't improvise
substitutes for those terms from this summary.

## Coding Standards

- Always use `react-frontend-developer` skill for frontend code generation.

### Reuse First

- Prefer existing components, hooks, utilities, and models before creating new ones.
- Before creating a new component, check both [packages/web/src/shared/components](packages/web/src/shared/components) and the relevant feature module for a compatible pattern.
- Create new shared components only when reuse is likely across multiple screens/features.
- If a new component is required, keep it small, composable, and aligned with existing naming and folder conventions.

### TypeScript Strictness

- Keep TypeScript strict. Prefer precise types, discriminated unions, and generics over broad fallback types.
- Avoid `any`. If unavoidable, limit scope to the smallest boundary and include a short justification comment with a follow-up improvement note.
- Prefer `unknown` plus narrowing over `any` when handling untyped data.
- Do not silence type errors with unsafe assertions unless there is no practical typed alternative.

### Documentation Expectations

- Add concise documentation for exported functions, exported types/interfaces, and exported constants when behavior is not obvious.
- At minimum, document purpose, inputs, output/return value, and important side effects or constraints.
- Keep documentation accurate when behavior changes; update or remove stale comments in the same change.
- For complex business rules, link to canonical docs instead of duplicating long explanations.

## Safety Rules

- Report outcomes faithfully: distinguish completed actions, not-run checks, and blockers.
  Never claim something was run or verified when it was not.
- Stop and ask before: destructive/irreversible actions, bulk edits that are hard to review,
  deploy/release/push/merge, or changes to auth, payments, CI/CD, or production config.
- When a decision materially affects behavior or scope and confidence is low, ask instead of guessing.
- Never hardcode secrets or place sensitive client/personal data in source, logs, tests, or docs;
  use synthetic data in tests and redact sensitive values in output.
- Before any `gh` operation (`gh repo view`, `gh pr create`, etc.), check `gh auth status`
  and ensure the active account is the one that owns this repo — otherwise `gh` can't
  resolve it. (Specific account handles are in agent memory, not this tracked file.)
