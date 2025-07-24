# Multi-stage build for Web App
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Build the application
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY apps/web ./apps/web
COPY tsconfig.json ./

# Build the application
RUN npm run build --workspace=@contentautopilot/web

# Production image using nginx
FROM nginx:alpine AS runner

# Copy built application
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup --system --gid 1001 nginx
RUN adduser --system --uid 1001 webuser

# Set ownership
RUN chown -R webuser:nginx /usr/share/nginx/html
RUN chown -R webuser:nginx /var/cache/nginx
RUN chown -R webuser:nginx /var/log/nginx
RUN chown -R webuser:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R webuser:nginx /var/run/nginx.pid

# Switch to non-root user
USER webuser

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]