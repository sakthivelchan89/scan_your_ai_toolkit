# ── Maiife Toolkit — MCP Server Container ──
# Build from toolkit root:  docker build -f packages/ai-stack/Dockerfile -t ghcr.io/sakthivelchan89/maiife-ai-stack .
# Run:  docker run -i ghcr.io/sakthivelchan89/maiife-ai-stack

# ── Stage 1: Install dependencies ──
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/ai-stack/package.json ./packages/ai-stack/
RUN pnpm install --frozen-lockfile

# ── Stage 2: Build ──
FROM deps AS builder
COPY packages/shared/ ./packages/shared/
COPY packages/ai-stack/ ./packages/ai-stack/
RUN pnpm --filter @maiife-ai-pub/shared build 2>/dev/null || true
RUN pnpm --filter @maiife-ai-pub/ai-stack build

# ── Stage 3: Production runner ──
FROM node:20-alpine AS runner
RUN addgroup -g 1001 -S maiife && adduser -S maiife -u 1001
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/packages/ai-stack/dist/ ./dist/
COPY --from=builder /app/packages/ai-stack/package.json ./
COPY --from=builder /app/node_modules/ ./node_modules/
# Copy shared package if it exists in deps
COPY --from=builder /app/packages/shared/dist/ ./node_modules/@maiife-ai-pub/shared/dist/

USER maiife

# MCP servers use stdio transport — no port exposed
CMD ["node", "dist/mcp/index.js"]
