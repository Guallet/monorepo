# Base image for building
FROM node:24-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm@11.24.0 --ignore-scripts

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
COPY apps/webapp/package.json ./apps/webapp/

# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code for all required packages
COPY packages ./packages
COPY apps/webapp ./apps/webapp

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_SENTRY_ENABLED
ARG VITE_SENTRY_DSN

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SENTRY_ENABLED=$VITE_SENTRY_ENABLED
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN

# Build the webapp
WORKDIR /app/apps/webapp
RUN pnpm run build

# Production stage with Nginx
FROM nginx:1.25-alpine AS production

# Create non-root user
RUN addgroup -S nonroot && adduser -S nonroot -G nonroot

# Change ownership of nginx directories and create necessary pid/cache dirs
# Nginx typically uses /var/run/nginx.pid, we need to allow writing to it.
RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nonroot:nonroot /var/cache/nginx /var/run /var/log/nginx /var/run/nginx.pid /usr/share/nginx/html /etc/nginx/conf.d && \
    chmod -R 755 /usr/share/nginx/html

# Use non-root user
USER nonroot

# Copy built files from base stage ensuring nonroot ownership
COPY --chown=nonroot:nonroot --from=base /app/apps/webapp/dist /usr/share/nginx/html

# Copy custom nginx configuration ensuring nonroot ownership
COPY --chown=nonroot:nonroot apps/webapp/nginx.conf /etc/nginx/conf.d/default.conf

# Expose non-privileged port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
