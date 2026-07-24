# syntax=docker/dockerfile:1
# React SPA → nginx. node:22-slim matches the workspace runtime baseline.

FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable

# Compiled into the browser bundle — PUBLIC values only. Anything passed here is
# readable in the shipped JS and in the image.
ARG VITE_APP_BACKEND_API_URL=/api
ARG VITE_APP_API_BASE_URL
ARG VITE_APP_TMDB_API_KEY
ARG VITE_APP_IS_PRODUCTION=true
ARG APP_COMMIT=""
ENV VITE_APP_BACKEND_API_URL=$VITE_APP_BACKEND_API_URL \
    VITE_APP_API_BASE_URL=$VITE_APP_API_BASE_URL \
    VITE_APP_TMDB_API_KEY=$VITE_APP_TMDB_API_KEY \
    VITE_APP_IS_PRODUCTION=$VITE_APP_IS_PRODUCTION \
    APP_COMMIT=$APP_COMMIT

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile --filter @movie/web...

COPY apps/web apps/web
RUN pnpm --filter @movie/web build

FROM nginx:alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
