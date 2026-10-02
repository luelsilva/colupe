# ─── Stage 1: deps ───────────────────────────────────────────────────────────
FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ─── Stage 2: runner ─────────────────────────────────────────────────────────
FROM oven/bun:1-slim AS runner

# wget necessário para o healthcheck do Docker
RUN apt-get update -qq && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy installed deps from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY src ./src
COPY tsconfig.json ./
COPY package.json ./

# Runtime environment (can be overridden via docker-compose / env file)
ENV NODE_ENV=production
ENV PORT=3333

EXPOSE 3333

CMD ["bun", "src/index.ts"]
