FROM node:24.20-alpine AS base

RUN npm install -g pnpm@12.4.1 --ignore-scripts
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/mcp-server/package.json ./apps/mcp-server/
COPY packages/guallet-finance-core/package.json ./packages/guallet-finance-core/
COPY packages/tsconfig/package.json ./packages/tsconfig/
RUN pnpm install --filter ./apps/mcp-server... --frozen-lockfile

COPY apps/mcp-server ./apps/mcp-server
COPY packages/guallet-finance-core ./packages/guallet-finance-core
COPY packages/tsconfig ./packages/tsconfig
WORKDIR /app/apps/mcp-server
RUN pnpm --filter @guallet/finance-core build && pnpm build

FROM node:24.20-alpine AS production
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
WORKDIR /app/apps/mcp-server
COPY --from=base --chown=nodejs:nodejs /app/node_modules /app/node_modules
COPY --from=base --chown=nodejs:nodejs /app/apps/mcp-server/node_modules ./node_modules
COPY --from=base --chown=nodejs:nodejs /app/apps/mcp-server/dist ./dist
COPY --from=base --chown=nodejs:nodejs /app/apps/mcp-server/package.json ./
COPY --from=base --chown=nodejs:nodejs /app/packages/guallet-finance-core/package.json /app/packages/guallet-finance-core/
COPY --from=base --chown=nodejs:nodejs /app/packages/guallet-finance-core/dist /app/packages/guallet-finance-core/dist
USER nodejs
EXPOSE 5100
CMD ["node", "dist/main.js"]
