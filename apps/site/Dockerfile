FROM oven/bun:1 AS builder
WORKDIR /app

COPY . .
RUN bun install --frozen-lockfile
RUN bun --filter @colupe/site build

FROM oven/bun:1-slim AS runner

RUN apt-get update -qq && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/apps/site/build /app/apps/site/build
COPY --from=builder /app/apps/site/package.json /app/apps/site/package.json

WORKDIR /app/apps/site

ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

EXPOSE 3001

CMD ["bun", "./build/index.js"]
