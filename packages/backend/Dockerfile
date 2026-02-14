FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy workspace config files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY tsconfig.base.json ./
COPY packages/shared/ packages/shared/
COPY packages/backend/ packages/backend/

# Build
RUN pnpm --filter @tresty/shared build
RUN pnpm --filter @tresty/backend build

# Production stage
FROM node:20-alpine AS runner

RUN apk add --no-cache python3 make g++

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/

RUN pnpm install --frozen-lockfile --prod

# Copy built files
COPY --from=builder /app/packages/shared/dist packages/shared/dist/
COPY --from=builder /app/packages/backend/dist packages/backend/dist/

# Create data directory for SQLite
RUN mkdir -p /data

ENV NODE_ENV=production
ENV SQLITE_PATH=/data/tresty-cache.db
ENV PORT=3001

EXPOSE 3001

CMD ["node", "packages/backend/dist/index.js"]
