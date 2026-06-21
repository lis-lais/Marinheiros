# Stage 1: Build
FROM node:22-slim AS builder
WORKDIR /usr/src/app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api-gateway ./apps/api-gateway

RUN npm ci --legacy-peer-deps
RUN npm run build --workspace=@marinheiros/api-gateway

# Stage 2: Runner
FROM node:22-slim AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api-gateway/package.json ./apps/api-gateway/

RUN npm ci --omit=dev --legacy-peer-deps

COPY --from=builder /usr/src/app/apps/api-gateway/dist ./apps/api-gateway/dist

USER node
EXPOSE 3000
CMD ["node", "apps/api-gateway/dist/main.js"]
