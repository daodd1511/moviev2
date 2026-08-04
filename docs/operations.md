# Operations

Operational reference for running, deploying, and maintaining moviev2: CI/CD jobs,
scheduled jobs, migrations, and backup/restore.

## CI/CD jobs

**`.github/workflows/ci.yml`** — runs on every PR. One `verify` job, in order:
install (frozen lockfile) → format check → lint → typecheck → API syntax check
(`pnpm check:api`) → unit tests (`pnpm test:unit`) → web build. All steps are
deterministic; anything environment-dependent (load tests, backup verification) is
deliberately excluded from this workflow — see "Load testing" and "Backup and restore"
below for where those run instead.

**`.github/workflows/build.yml`** — runs on push to `main` only (never on a fork PR,
since there's no self-hosted runner registered here). Builds and pushes the `web` and
`api` Docker images to GHCR, then dispatches a deploy event to the private
`daodd1511/deploy` repo. Runs publish-only (green, no dispatch) until
`DEPLOY_TRIGGER_TOKEN` is configured.

## Scheduled jobs

**`apps/api/src/jobs/sync-tracked-releases.js`** — syncs upcoming release dates for
tracked catalog items (Calendar feature). Supports `--cursor`, `--limit`, and
`--execute` (dry-run by default); state and audit counts persist in
`apps/api/src/model/catalog-sync-state.js`. Invoke via `pnpm sync:tracked-releases`.

## Migrations

Schema/data migrations are one-off scripts under `apps/api/scripts/`, run manually
against a target `MONGO_URI` — there is no automatic migration runner. Each supports
`--execute` (writes) with dry-run as the default, and prints a JSON audit summary
(scanned/created/collision counts) to stdout for the operator to capture as evidence
before targeting production.

**Historical:** the legacy embedded `User.lists` → canonical `Collection` migration
(`migrate-lists-to-collections.js`) ran to completion on 2026-08-04 — see
`specs/product-capability-roadmap/EXECUTION.md`'s Phase 15 entry for the audit
evidence (counts, idempotency re-run). The script and its embedded-list read paths
were removed once the migration was confirmed complete; there is nothing left to
migrate.

## Backup and restore

MongoDB Atlas provides the underlying backup mechanism for the production cluster.
`scripts/verify-mongo-backup.sh` verifies a backup is actually _restorable_ — it's a
drill, not the backup mechanism itself:

```
MONGO_BACKUP_SOURCE_URI='<uri to back up — may be production>' \
MONGO_BACKUP_TARGET_URI='<disposable local database — never production>' \
scripts/verify-mongo-backup.sh
```

It `mongodump`s the source (read-only), `mongorestore`s into the target (which it
drops and overwrites), then diffs per-collection document counts between the two via
`apps/api/scripts/verify-mongo-backup-counts.mjs`. It refuses to run if either URI is
unset, if they're equal, or if the target host isn't `localhost`/`127.0.0.1` (override
with `ALLOW_REMOTE_BACKUP_VERIFY=1` only if you're certain). Requires the
[MongoDB Database Tools](https://www.mongodb.com/docs/database-tools/) (`mongodump`,
`mongorestore`) — install via `brew install mongodb-database-tools` on macOS. If
unavailable, the phase's gate item that runs this is marked `[~]` deferred per
`specs/RULEBOOK.md`, with an operator run recorded as substitute evidence.

Run this drill periodically (e.g. before a major migration, or on a recurring
schedule) — a backup that has never been restored is unverified.

## Load testing

`pnpm load:test` runs `tests/load/{catalog,library,collections,notifications}.mjs`
against `API_BASE_URL` (default `http://localhost:4000/api`). Each script documents
its own p95-latency/error-rate thresholds inline and authenticates at most one
synthetic user (register + login) to stay under the auth route's 10-request/15-minute
rate limit. Refuses a non-localhost `API_BASE_URL` unless `ALLOW_REMOTE_LOAD_TEST=1` —
these scripts write real data, so point them at a disposable local stack (a local API
process plus a throwaway MongoDB, e.g. via `mongodb-memory-server`), never a shared or
production API.
