# ─── Stage 1: deps ───────────────────────────────────────────────────────────
FROM oven/bun:1 AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
COPY apps/site/package.json ./apps/site/

RUN bun install --frozen-lockfile

# ─── Stage 2: builder ────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock ./
COPY packages/shared ./packages/shared
COPY packages/ui ./packages/ui
COPY apps/site ./apps/site

WORKDIR /app/apps/site
RUN bun run build

# ─── Stage 3: runner ─────────────────────────────────────────────────────────
FROM oven/bun:1-slim AS runner

RUN apt-get update -qq && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*

WORKDIR /app/apps/site

COPY --from=builder /app/apps/site/build ./build
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/site/package.json ./

ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

EXPOSE 3001

CMD ["bun", "./build/index.js"]
