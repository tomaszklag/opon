# ── Stage 1: install all dependencies ──────────────────────────
FROM node:22-alpine AS deps

RUN npm install -g pnpm@10.33.2

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/

RUN pnpm install --frozen-lockfile --filter=@opony/api...

# ── Stage 2: build ──────────────────────────────────────────────
FROM deps AS builder

COPY apps/api/ ./apps/api/

RUN pnpm --filter=@opony/api build

# ── Stage 3: production image ───────────────────────────────────
FROM node:22-alpine AS runner

RUN npm install -g pnpm@10.33.2

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/

# Full install so prisma CLI is available for migrations
RUN pnpm install --frozen-lockfile --filter=@opony/api...

# Copy compiled output + prisma schema/migrations
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Re-generate Prisma client against final schema
RUN pnpm --filter=@opony/api prisma:generate

EXPOSE 4000

# Run DB migrations then start the server
CMD sh -c "pnpm --filter=@opony/api exec prisma migrate deploy && node apps/api/dist/main"
