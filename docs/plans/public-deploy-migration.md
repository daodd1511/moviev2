# Deploy setup

GitHub builds the images, GHCR stores them, the server pulls and runs them.
See `docs/deploy-flow.html` for the diagram.

`.github/workflows/build.yml` handles this repo's half: on push to `main` it builds
`apps/web` and `apps/api` for `linux/amd64`, pushes both to GHCR tagged `<sha>` and
`latest`, then fires a `repository_dispatch` at the private `daodd1511/deploy` repo.
Until that repo exists the dispatch step skips and the run still goes green
(publish-only mode).

## Setup — this repo

- [ ] `gh variable set VITE_APP_API_BASE_URL -R daodd1511/moviev2 -b 'https://api.themoviedb.org/3/'`
- [ ] `gh variable set VITE_APP_TMDB_API_KEY -R daodd1511/moviev2 -b '<key>'`
      (public by design — it already ships in the browser bundle)
- [ ] Push to `main`, confirm both images land in GHCR
- [ ] Make both packages public: github.com → Packages → `moviev2-web` / `moviev2-api`
      → Package settings → Change visibility. (No API for this; UI only.)

## Setup — private `daodd1511/deploy` repo

- [ ] Create it, private
- [ ] Register the self-hosted runner to it (and only it — never to a public repo)
- [ ] Add a workflow on `repository_dispatch` type `deploy`, payload `{app, tag}`:
      pull both images at `<tag>`, `docker compose up -d`, curl `/healthz` until
      green, redeploy the previous tag on failure
- [ ] Add the production compose: `image: ghcr.io/daodd1511/moviev2-{web,api}:${TAG}`,
      no `build:`, no `pull_policy: build`, keep `name: moviev2` so it updates the
      existing containers
- [ ] Fine-grained PAT scoped to only this repo, Contents: read/write →
      `gh secret set DEPLOY_TRIGGER_TOKEN -R daodd1511/moviev2`

## Setup — server

- [ ] `/srv/moviev2/.env` with `MONGO_URI` and `TOKEN_KEY`. Created by hand, never in
      git, never in an image. Compose injects it at container start.

## Notes

- Web `VITE_*` values are compiled into the JS bundle at build time, so they live in
  GitHub Actions **variables**. Never put a secret behind a `VITE_` prefix.
- API secrets are runtime container env only. The api Dockerfile has no build args.
- Deploys pin the sha tag; `latest` is convenience. Rollback = redeploy an older sha.
- `docker-compose.yml` at the repo root stays as-is for local dev.
