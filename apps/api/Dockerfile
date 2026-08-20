# Wam Mfugo API — multi-stage build for the NestJS app in the npm-workspace monorepo.
FROM node:22-alpine AS build
WORKDIR /app

# 1. Install workspace deps (cached until package manifests change).
#    Copy the full shared package too: its "prepare" hook (tsc) runs during
#    npm ci and needs tsconfig.build.json + src present.
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY packages/shared/ packages/shared/
RUN npm ci

# 2. Generate Prisma client (needs the schema before building)
COPY apps/api/prisma apps/api/prisma
RUN npx prisma generate --schema apps/api/prisma/schema.prisma

# 3. Build the shared package (API imports its prebuilt dist)
RUN npm run build -w @wam-mfugo/shared

# 4. Build the API
COPY apps/api apps/api
RUN npm run build -w @wam-mfugo/api

# ---------- runtime ----------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/apps/api ./apps/api
COPY --from=build /app/package.json /app/package-lock.json ./

EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]