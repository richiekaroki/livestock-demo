# Wam Mfugo Web — build the Vite SPA then serve it from nginx.
FROM node:22-alpine AS build
WORKDIR /app

ARG VITE_API_BASE_URL=http://localhost:4000/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# 1. Install workspace deps (cached until package manifests change).
#    Copy the full shared package too: its "prepare" hook (tsc) runs during
#    npm ci and needs tsconfig.build.json + src present.
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY packages/shared/ packages/shared/
RUN npm ci

# 2. Build the shared package
RUN npm run build -w @wam-mfugo/shared

# 3. Build the web app (VITE_API_BASE_URL is inlined at build time)
COPY apps/web apps/web
RUN npm run build -w wam-mfugo-web

# ---------- runtime ----------
FROM nginx:alpine AS runtime
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80