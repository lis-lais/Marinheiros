# Stage 1: Build
FROM node:22-slim AS builder
WORKDIR /usr/src/app

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/core ./packages/core
COPY apps/schedule-service ./apps/schedule-service

RUN npm ci --legacy-peer-deps
RUN npm run build --workspace=@marinheiros/core || true
RUN npm run build --workspace=@marinheiros/schedule-service

# Stage 2: Runner
FROM node:22-slim AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/core/package.json ./packages/core/
COPY apps/schedule-service/package.json ./apps/schedule-service/

RUN npm ci --omit=dev --legacy-peer-deps

COPY --from=builder /usr/src/app/packages/core/dist ./packages/core/dist
COPY --from=builder /usr/src/app/apps/schedule-service/dist ./apps/schedule-service/dist

USER node
EXPOSE 3002
CMD ["node", "apps/schedule-service/dist/main.js"]
