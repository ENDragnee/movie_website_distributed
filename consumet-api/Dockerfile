# --- Stage 1: Builder ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install build tools needed for some Node modules (gyp, python, etc)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for building)
RUN npm install

# Copy source code
COPY . .

# Build the project (if the Consumet version uses TypeScript)
# This flag ensures it doesn't fail if no build script exists
RUN npm run build --if-present

# --- Stage 2: Runner (Production) ---
FROM node:20-alpine AS runner

LABEL version="1.0.0"
LABEL description="Consumet API (Distributed System)"

WORKDIR /app

# Set Environment Variables
ENV NODE_ENV=production
ENV PORT=8000
# Redis variables will be injected by Kubernetes
ENV REDIS_HOST=${REDIS_HOST}
ENV REDIS_PORT=${REDIS_PORT}
ENV REDIS_PASSWORD=${REDIS_PASSWORD}

# Create non-root user for security
RUN addgroup -g 1001 nodejs && \
  adduser -S -u 1001 -G nodejs nodejs

# Copy dependencies and built files from builder
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
# Copy the rest of the app (src/dist)
COPY --from=builder --chown=nodejs:nodejs /app ./

# Switch to non-root user
USER nodejs

# Expose the specific Consumet port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
  CMD npm run healthcheck-manual || exit 1

# Start
CMD ["npm", "start"]
