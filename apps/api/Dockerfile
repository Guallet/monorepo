
# Base image
FROM node:24.20-alpine AS base

RUN npm install -g pnpm@12.4.1 --ignore-scripts

WORKDIR /app

# Copy API files and its local workspace dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY .npmrc* ./

# Copy API source and package.json
COPY apps/api/package.json ./apps/api/
COPY apps/api ./apps/api
COPY packages/tsconfig ./packages/tsconfig
COPY packages/guallet-money ./packages/guallet-money

# Install dependencies (only for API)
RUN pnpm install --filter ./apps/api... --frozen-lockfile

# Build the API
WORKDIR /app/apps/api
RUN pnpm run build

# Install only the production dependencies required by the API.
FROM node:24.20-alpine AS production-dependencies

RUN npm install -g pnpm@12.4.1 --ignore-scripts

WORKDIR /app

# Install runtime dependencies with the workspace package available for linking.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY .npmrc* ./
COPY apps/api/package.json ./apps/api/
COPY packages/tsconfig ./packages/tsconfig
COPY packages/guallet-money/package.json ./packages/guallet-money/
COPY packages/guallet-money/src ./packages/guallet-money/src
RUN pnpm install --prod --filter ./apps/api... --frozen-lockfile

# Production stage
FROM node:24.20-alpine AS production

RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built app and workspace-hoisted dependencies
COPY --from=production-dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=production-dependencies --chown=nodejs:nodejs /app/packages/guallet-money/package.json ./packages/guallet-money/package.json
COPY --from=base --chown=nodejs:nodejs /app/packages/guallet-money/dist ./packages/guallet-money/dist
COPY --from=base --chown=nodejs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=base --chown=nodejs:nodejs /app/apps/api/package.json ./apps/api/package.json

WORKDIR /app/apps/api

# Switch to non-root user
USER nodejs

EXPOSE 5000

CMD ["node", "dist/main.js"]
