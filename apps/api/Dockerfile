
# Base image
FROM node:24.20-alpine AS base

RUN npm install -g pnpm@11.24.0

WORKDIR /app

# Copy only API workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY .npmrc* ./

# Copy API source and package.json
COPY apps/api/package.json ./apps/api/
COPY apps/api ./apps/api

# Install dependencies (only for API)
RUN pnpm install --filter ./apps/api... --frozen-lockfile

# Build the API
WORKDIR /app/apps/api
RUN pnpm run build

# Production stage
FROM node:24.20-alpine AS production

RUN npm install -g pnpm@11.24.0
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app/apps/api

# Copy built app and dependencies
COPY --from=base --chown=nodejs:nodejs /app/apps/api/node_modules ./node_modules
COPY --from=base --chown=nodejs:nodejs /app/apps/api/dist ./dist
COPY --from=base --chown=nodejs:nodejs /app/apps/api/package.json ./

# Switch to non-root user
USER nodejs

EXPOSE 5000

CMD ["node", "dist/main.js"]
