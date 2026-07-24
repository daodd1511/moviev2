# syntax=docker/dockerfile:1
# vite 3 + React 18 SPA → nginx.
# node:22-slim matches the volta pin (22.20.0). glibc, not alpine, to avoid musl
# native-module issues in the build.

FROM node:22-slim AS build
WORKDIR /app

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

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .
# `npm run build` is `tsc && vite build`; vite-plugin-checker typechecks too.
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
