# Base image
FROM node:22-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm@10.14.0

# Set working directory
WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY .npmrc* ./

# Copy all package.json files for dependency installation
COPY packages/eslint-config-custom/package.json ./packages/eslint-config-custom/
COPY packages/guallet-api-react/package.json ./packages/guallet-api-react/
COPY packages/guallet-auth/package.json ./packages/guallet-auth/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/guallet-money/package.json ./packages/guallet-money/
COPY packages/guallet-ui-react/package.json ./packages/guallet-ui-react/
COPY packages/guallet-api-client/package.json ./packages/guallet-api-client/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code for all required packages
COPY packages ./packages
COPY apps/api ./apps/api

# Build the API
WORKDIR /app/apps/api
RUN pnpm run build

# Production stage
FROM node:22-alpine AS production

# Install pnpm
RUN npm install -g pnpm@10.14.0

# Install wget for healthcheck
RUN apk add --no-cache wget

WORKDIR /app

# Copy dependencies from base stage
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=base /app/packages ./packages

# Copy built application
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/apps/api/package.json ./apps/api/

# Set working directory to API
WORKDIR /app/apps/api

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "dist/main.js"]
