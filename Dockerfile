# =============================================
# Stage 1: Builder (build only - discarded after)
# =============================================
FROM node:23.7.0-alpine AS builder

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json .

# Copy only necessary files for build
COPY .babelrc .
COPY .prettierrc.js .
COPY eslint.config.js .
COPY *.js .
COPY *.json .
COPY scripts/ ./scripts
COPY config/ ./config
COPY src/ ./src

# Install all dependencies (including devDependencies for build)
RUN npm install

# Build the application
RUN npm run build

# =============================================
# Stage 2: Development (for docker-compose)
# =============================================
FROM node:23.7.0-alpine AS development

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copy all necessary files for development
COPY package*.json .
COPY .babelrc .
COPY .prettierrc.js .
COPY eslint.config.js .
COPY *.js .
COPY *.json .
COPY scripts/ ./scripts
COPY config/ ./config
COPY src/ ./src
COPY .env* .

# Install all dependencies (including devDependencies)
RUN npm install

# Expose application port
EXPOSE ${PORT:-3000}

# Healthcheck for container monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Start development server with hot reload
CMD ["npm", "run", "start-develop"]

# =============================================
# Stage 3: Production (lean image for Kubernetes)
# =============================================
FROM node:23.7.0-alpine AS production

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copy only package files for production dependencies
COPY package*.json .
COPY scripts/ ./scripts
COPY .env* .

# Install only production dependencies (excludes devDependencies)
RUN npm install --only=production

# Copy only built files from builder stage (lean)
COPY --from=builder /app/dist ./dist

# Expose application port
EXPOSE ${PORT:-3000}

# Healthcheck for container monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Start production server from built files
CMD ["node", "dist/index.js"]