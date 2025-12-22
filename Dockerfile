# Multi-stage Dockerfile for Golden Raspberry Awards API
# Stage 1: Base - Install production dependencies
FROM node:24-alpine AS base

WORKDIR /app

# Ensure npm is at the requested version
RUN npm install -g npm@11.6.2

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Build - Compile TypeScript
FROM node:24-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Stage 3: Test (optional - can be skipped in production builds)
FROM node:24-alpine AS test

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY jest.config.js ./

# Install all dependencies
RUN npm ci

# Copy source and tests
COPY src ./src
COPY tests ./tests

# Run tests
RUN npm run test

# Stage 4: Production - Minimal runtime image
FROM node:24-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy production dependencies from base stage
COPY --from=base --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy compiled code from build stage
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist

# Copy package.json for metadata
COPY --chown=nodejs:nodejs package*.json ./

# Copy data directory
COPY --chown=nodejs:nodejs data ./data

# Create logs directory
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/server.js"]
