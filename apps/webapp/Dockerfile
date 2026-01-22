# Base image for building
FROM node:22-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm@10.14.0

# Set working directory
WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY .npmrc* ./

# Copy all package.json files for dependency installation
COPY packages/*/package.json ./packages/
COPY apps/webapp/package.json ./apps/webapp/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code for all required packages
COPY packages ./packages
COPY apps/webapp ./apps/webapp

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_KEY
ARG VITE_SENTRY_ENABLED
ARG VITE_SENTRY_DSN

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_KEY=$VITE_SUPABASE_KEY
ENV VITE_SENTRY_ENABLED=$VITE_SENTRY_ENABLED
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN

# Build the webapp
WORKDIR /app/apps/webapp
RUN pnpm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy built files from base stage
COPY --from=base /app/apps/webapp/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY apps/webapp/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
