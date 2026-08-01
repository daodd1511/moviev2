# Spec-Driven Execution Workflow

<!-- rulebook v3 -->

Large/architectural changes flow: `/grill-me` → `specs/<feature>/PLAN.md` →
`specs/<feature>/EXECUTION.md` (via the `spec-plan` skill) → phased implementation
(via the `spec-phase` skill).

This is the full rulebook. The spec skills read it when they run; it is deliberately kept
out of `CLAUDE.md` so sessions doing ordinary work don't carry it. The few invariants that
must bind agents who never trigger a spec skill live in `CLAUDE.md` → "Spec-Driven
Execution Workflow", which points here for everything else.

## State model

- **Git is the authoritative state store**: branch name encodes spec+phase
  (`<feature-slug>/phase-<n>-<desc>`), commits encode progress. Each `EXECUTION.md` opens
  with a **STATUS block** (current phase, per-phase state, verification debt) — the only
  prose trusted as state. **On any conflict, git wins silently** for mechanical facts
  (branch, commits, merged-or-not); STATUS is trusted only for what git can't express
  (debt, park reasons). `HANDOFF.md` is a session baton from `/handoff` — advisory context,
  never authority; do not resume from it.
- Phase states: `pending` / `in-progress` / `done` / `done-with-debt`. Gate items are
  `[ ]`/`[x]`; an item may be `[~]` (deferred) only when environment-blocked (missing
  tool/credentials, not effort), with substitute evidence inline and a mirrored STATUS debt
  entry. A phase is in-progress iff it has unchecked **non-deferred** items.

## Branch model — stacked by default

- **Default: stacked.** Each phase branches off the **previous phase's branch** (phase 1
  off the integration branch, currently `main`; resolve at plan time, never hardcode).
  Push → PR to the previous phase's branch (or to the integration branch if the previous
  phase already merged) → continue to the next phase without waiting for review/merge.
  Rebase onto the integration branch after an earlier phase's PR merges.
- **Sequential (off the integration branch, wait for merge) is opt-in only** — use it only
  when the user explicitly says so for this spec (e.g. "do phases sequentially" / "wait for
  merge before the next phase"). When opted in: each phase branches off the integration
  branch → push → PR → user reviews & merges → pull → next phase branches off the updated
  integration branch.
- After a phase's PR merges, ask before deleting the merged phase branch (local + remote).

## Checkpoints

- Starting a phase authorizes its commits — nothing else.
- Gate pass → one ask: "push + open PR?". Remote actions are never bundled with anything
  else.
- **Evidence before claims.** If you have not run the command in this message, you cannot
  say it passes. This binds every status claim: tests pass ⇒ runner output with 0 failures;
  build succeeds ⇒ exit 0; bug fixed ⇒ the original symptom retested; phase complete ⇒ the
  gate actually run. A prior run, a partial run, or "should pass" is not evidence, and
  checking a box is not running a command.
- A phase is complete only when its **agent gate** (typecheck, tests, build) actually
  passed **and the phase PR's CI is green**. The local gate is a pre-PR smoke check; CI's
  full run is authoritative, and red CI on a phase PR is the agent's to fix before the
  phase is done. Manual verification scenarios are the **review checklist**, listed in the
  PR description for the user to walk through before merging — they are the user's, not
  agent debt.
- **One spec in flight at a time.** Do not start or resume a different spec's phase while
  another has an unfinished phase. Finish the current phase, or explicitly **park** it with
  the user's go-ahead: a `WIP: parked <date>` commit on the phase branch plus a STATUS note
  (never `git stash` — stashes are invisible to a cold agent and easy to orphan).

Procedure lives in the skills — planning in the `spec-plan` skill and execution and resume
in the `spec-phase` skill — invoke the relevant one rather than re-deriving it.
