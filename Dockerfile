ARG BUN_VERSION=1.2
FROM oven/bun:${BUN_VERSION}-slim AS base

LABEL fly_launch_runtime="Bun"

WORKDIR /app

ENV NODE_ENV="production"

FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python-is-python3

COPY --link bun.lockb package.json ./
RUN bun install --ci

COPY --link . .

FROM base

COPY --from=build /app /app

EXPOSE 3000
CMD [ "bun", "dev" ]

RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/*