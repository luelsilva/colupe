# ─── Stage 1: deps ───────────────────────────────────────────────────────────
FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ─── Stage 2: build ──────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

# Run svelte-kit sync then build (svelte-adapter-bun produces ./build)
RUN bun run build

# ─── Stage 3: runner ─────────────────────────────────────────────────────────
FROM oven/bun:1-slim AS runner

# wget necessário para o healthcheck do Docker
RUN apt-get update -qq && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# svelte-adapter-bun outputs a self-contained build directory
COPY --from=builder /app/build ./build

# The adapter may need these at runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
# PORT used by svelte-adapter-bun at runtime (default 3000)
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

CMD ["bun", "./build/index.js"]
