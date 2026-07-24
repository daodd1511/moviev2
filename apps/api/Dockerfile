# syntax=docker/dockerfile:1
# Plain node/express, no build step. pnpm deploy creates a portable production
# directory whose dependency links stay inside the runtime image.

FROM node:22-slim AS deploy
WORKDIR /workspace
RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile --filter @movie/api...

COPY apps/api apps/api
RUN pnpm deploy --filter @movie/api --prod /prod/api

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=4000

COPY --from=deploy --chown=node:node /prod/api ./

# Drop root. node:* images ship an unprivileged `node` user.
USER node

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "index.js"]
