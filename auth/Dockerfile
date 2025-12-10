FROM node:20-alpine AS base

# 1. Install system libs (Required for Prisma on Alpine)
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app
RUN npm install -g pnpm

# --- BUILDER STAGE ---
FROM base AS builder
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy ALL source files (Ensures prisma.config.ts is included)
COPY . .

# Dummy env var to allow generation to pass without crashing
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Generate Client & Build
RUN pnpm prisma generate
RUN pnpm build

# --- RUNNER STAGE ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# System libs again
RUN apk add --no-cache openssl libc6-compat

# Create User
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY package.json pnpm-lock.yaml ./

# 2. Install Deps + TSX + Dotenv
# We need 'tsx' to execute prisma.config.ts and 'dotenv' because the config imports it
RUN pnpm install --frozen-lockfile --prod && \
  pnpm add -D tsx dotenv prisma

# Copy Next.js Build
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 3. Copy Prisma Assets Explicitly
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated

# --- CRITICAL FIX: Ensure config exists in the root ---
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
