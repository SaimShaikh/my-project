# Install dependencies and build
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY . .
# Install using pnpm if lockfile exists; fallback to npm
RUN if [ -f pnpm-lock.yaml ]; then \
      corepack enable && corepack prepare pnpm@latest --activate && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then \
      corepack enable && corepack prepare yarn@stable --activate && yarn install --frozen-lockfile; \
    else \
      npm ci --omit=dev=false; \
    fi
RUN npm run build || (echo "If using Next.js, ensure a Next.js build is configured"; exit 0)

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Copy all app files
COPY --from=builder /app ./

# App expects env variables for DB connection:
# DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, DB_NAME

# Start the app at port 3000.
# If using Next.js build output:
CMD ["npm", "start"]
