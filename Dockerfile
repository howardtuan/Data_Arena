FROM node:22-bookworm-slim

WORKDIR /app

ENV PORT=8080 \
    DB_PATH=/app/data/data-arena.sqlite \
    PYTHON_BIN=python3

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod=false
COPY . .
RUN pnpm build

RUN mkdir -p /app/data

ENV NODE_ENV=production

EXPOSE 8080

CMD ["pnpm", "start"]
