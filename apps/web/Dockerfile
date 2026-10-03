# ─── Stage 1: deps ───────────────────────────────────────────────────────────
FROM oven/bun:1 AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
COPY apps/web/package.json ./apps/web/

RUN bun install --frozen-lockfile

# ─── Stage 2: builder ────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock ./
COPY packages/shared ./packages/shared
COPY packages/ui ./packages/ui
COPY apps/web ./apps/web

WORKDIR /app/apps/web
RUN bun run build

# ─── Stage 3: runner ─────────────────────────────────────────────────────────
FROM oven/bun:1-slim AS runner

RUN apt-get update -qq && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*

WORKDIR /app/apps/web

COPY --from=builder /app/apps/web/build ./build
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/web/package.json ./

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

CMD ["bun", "./build/index.js"]
