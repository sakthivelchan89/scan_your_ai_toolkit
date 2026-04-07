# ── Maiife Toolkit — Multi-package MCP Server Container ──
# Usage:  docker build --build-arg PACKAGE=probe -t maiife/probe .
#         docker build --build-arg PACKAGE=mcp-audit -t maiife/mcp-audit .
#
# Run:    docker run -i maiife/probe
#         (stdio transport — attach to stdin/stdout for MCP communication)

ARG PACKAGE=probe

# ── Stage 1: Install dependencies ──
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
ARG PACKAGE
COPY packages/${PACKAGE}/package.json ./packages/${PACKAGE}/
RUN pnpm install --frozen-lockfile --shamefully-hoist

# ── Stage 2: Build ──
FROM deps AS builder
ARG PACKAGE
COPY packages/shared/ ./packages/shared/
COPY packages/${PACKAGE}/ ./packages/${PACKAGE}/
RUN pnpm --filter @maiife-ai-pub/shared build 2>/dev/null || true
RUN pnpm --filter @maiife-ai-pub/${PACKAGE} build

# ── Stage 3: Production runner ──
FROM node:20-alpine AS runner
RUN addgroup -g 1001 -S maiife && adduser -S maiife -u 1001
WORKDIR /app
ENV NODE_ENV=production

ARG PACKAGE
COPY --from=builder /app/packages/${PACKAGE}/dist/ ./dist/
COPY --from=builder /app/packages/${PACKAGE}/package.json ./
COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/packages/shared/dist/ ./node_modules/@maiife-ai-pub/shared/dist/ 2>/dev/null || true
COPY --from=builder /app/packages/shared/package.json ./node_modules/@maiife-ai-pub/shared/package.json 2>/dev/null || true

USER maiife

# MCP servers communicate over stdio — no port needed
# The entrypoint runs the MCP server (not CLI)
CMD ["node", "dist/mcp/index.js"]
