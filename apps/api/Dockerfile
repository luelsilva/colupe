FROM oven/bun:1 AS builder
WORKDIR /app

COPY . .
RUN bun install

FROM oven/bun:1-slim AS runner

RUN apt-get update -qq && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app /app

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PORT=3333

EXPOSE 3333

CMD ["bun", "src/server.ts"]
