# syntax=docker/dockerfile:1
# Plain node/express, no build step. Deps are not bundled, so the runtime stage
# installs production node_modules rather than copying a single file.
#
# node:20, not 22: volta pinned 16.18.0 and mongoose is v6. 20 is a modest, supported
# jump; 22 would be two majors past anything this has run on.

FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=4000

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY index.js ./
COPY src ./src

# Drop root. node:* images ship an unprivileged `node` user.
USER node

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "index.js"]
