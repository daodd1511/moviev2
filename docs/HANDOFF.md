# Handoff — 2026-08-10

Session baton — advisory context, not state. Git is the authoritative store
(`CLAUDE.md` → Spec-Driven Execution Workflow). Where this doc and the repo
disagree, the repo wins.

## Where things stand

Branch `dev`, **5 commits ahead of `origin/dev`, not pushed.** The user has not
authorised a push. Working tree clean at time of writing.

Run `git log --oneline origin/dev..dev` for the list. The commit bodies carry the
reasoning for each change — do not re-derive it, read them.

Two earlier commits (`fcd7913`, `9803f76` — the logo work) are already on
`origin/dev`.

## What is NOT captured in any artifact

Everything below is the reason this document exists. The rest of the session's
substance lives in the commits, `DESIGN.md`, and `docs/BACKLOG.md`.

### Verification state — read before pushing

The last full green run (`pnpm typecheck`, `pnpm lint`, 68 tests) happened
**before** the final two edits: removing a deliberately-injected bug and running
`oxfmt` on five files. Neither should change behaviour, and the injected line was
confirmed gone by inspection — but **no suite has been run since**. The user
declined a re-run when wrapping up. Get a green run on record before pushing.

Three tests in `apps/web/src/shared/components/Catalog/CatalogByDiscover.test.tsx`
are new. Their value was proven by reintroducing the `isPending` short-circuit and
watching the mount test fail. If you change that component, that test is the guard.

### Never visually verified in the running app

- `AuthShell`'s logo lockup (two call sites) and the auth forms' controls. The
  auth routes could not be reached headlessly.
- The Discover filter controls in situ. Item-3 surfaces were verified against a
  generated harness that reads its class strings straight out of
  `apps/web/src/lib/fieldStyles.ts`, not against the real page.

### A file was being edited mid-session by something other than the agent

`apps/web/src/shared/components/Logo/Logo.tsx` had classes changed under the agent
three times in a row (`uppercase` dropped, then `font-extralight` → `font-semibold`).
The changes were coherent, not random — they walked the wordmark back toward its
original style, and the user confirmed that was the intent. Resolved. Flagged only
so a fresh agent does not panic if it recurs: stop and ask rather than fighting it.

### Tooling gotchas that cost time here

- The Claude-in-Chrome extension **disconnected mid-session** and never recovered.
  Fallback that worked: headless Chrome at
  `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --headless --screenshot=… --window-size=W,H --virtual-time-budget=12000 <url>`.
- `mcp__claude-in-chrome__navigate` **rejects `file://` URLs**. Serve the directory
  (`python3 -m http.server`) and use `http://localhost:…`.
- The shell has `noclobber` set: `>` fails with "file exists". Use `>|`.
- `qlmanage -t` renders SVG at the wrong scale with white padding. Headless Chrome
  screenshotting an HTML wrapper produces correct PNGs — that is how
  `apps/web/public/apple-touch-icon.png` was made.
- **`rg -r` is a footgun**: `rg -rn "Foo" path` reads as "replace with `n`", not
  "recursive + line numbers". It silently prints `n` for every match. Bit twice.
- The web app needs the API running (`pnpm dev:api`, port 4000) or every page falls
  back to a catalog network error.

### Open question worth one real-browser check

Under headless Chrome, `/movie/discover/top_rated` and `/movie/discover/discover`
both rendered "Popular Movies" — every catalog route resolving to the default.
Unit tests at those exact paths pass, so this is plausibly a headless artifact.
Captured in `docs/BACKLOG.md`; **not confirmed as a bug.** Do not "fix" it before
reproducing in a real browser.

## Suggested skills

- **`terse-commit`** — required by `CLAUDE.md` for every commit message. Personal
  mode (Conventional Commits) applies to this repo. No AI attribution trailer, ever.
- **`react-frontend-developer`** — required by `CLAUDE.md` for any frontend code
  generation.
- **`impeccable`** — the design hook has been asking for `/impeccable document` on
  every edit; `.impeccable/design.json` is stale against `DESIGN.md`. That refresh
  is a captured backlog item.
- **`code-review`** — if the next session pushes or opens a PR, the five unpushed
  commits have had no independent review.

## Ground rules that bit during this session

From `CLAUDE.md` and the user's global preferences:

- **Never push, open a PR, or merge without a separate explicit ask** — authorisation
  for earlier work in a session does not carry forward.
- Stage files **by name**; never `git add -A` or `git add .`.
- Split unrelated changes into separate commits.
- "Investigate" means read-only. Questions get answered, not acted on.
- Capture out-of-scope findings to `docs/BACKLOG.md` and **list them in the session's
  final summary**. Never auto-commit a capture.
