# ── Maiife Toolkit — MCP Server Container ──
# Build from toolkit root:  docker build -f packages/probe/Dockerfile -t ghcr.io/sakthivelchan89/maiife-probe .
# Run:  docker run -i ghcr.io/sakthivelchan89/maiife-probe

# ── Stage 1: Install dependencies ──
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/probe/package.json ./packages/probe/
RUN pnpm install --frozen-lockfile --shamefully-hoist

# ── Stage 2: Build ──
FROM deps AS builder
COPY packages/shared/ ./packages/shared/
COPY packages/probe/ ./packages/probe/
RUN pnpm --filter @maiife-ai-pub/shared build 2>/dev/null || true
RUN pnpm --filter @maiife-ai-pub/probe build

# ── Stage 3: Production runner ──
FROM node:20-alpine AS runner
RUN addgroup -g 1001 -S maiife && adduser -S maiife -u 1001
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/packages/probe/dist/ ./dist/
COPY --from=builder /app/packages/probe/package.json ./
COPY --from=builder /app/node_modules/ ./node_modules/
# Copy shared package if it exists in deps
COPY --from=builder /app/packages/shared/dist/ ./node_modules/@maiife-ai-pub/shared/dist/

USER maiife

# MCP servers use stdio transport — no port exposed
CMD ["node", "dist/mcp/index.js"]
