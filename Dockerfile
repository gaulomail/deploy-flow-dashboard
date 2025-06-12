# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY deploy-flow-frontend/package*.json ./
COPY deploy-flow-frontend/pnpm-lock.yaml* ./
COPY deploy-flow-frontend/yarn.lock* ./

# Install frontend dependencies
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm install; fi

# Copy frontend source files
COPY deploy-flow-frontend/ .

# Build the frontend
RUN npm run build

# Stage 2: Build the backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY deploy-flow-backend/package*.json ./

# Install backend dependencies
RUN npm install

# Copy backend source files
COPY deploy-flow-backend/ .

# Stage 3: Production image
FROM node:18-alpine

WORKDIR /app

# Copy built frontend files
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Copy backend files
COPY --from=backend-builder /app/backend /app/backend

# Install serve for frontend
RUN npm install -g serve

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app

USER appuser

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV FRONTEND_PORT=80

# Expose ports
EXPOSE 3000 80

# Create startup script
COPY <<EOF /app/start.sh
#!/bin/sh
# Start backend
cd /app/backend && npm start &
# Start frontend
serve -s /app/frontend/dist -l 80
EOF

RUN chmod +x /app/start.sh

# Start both services
CMD ["/app/start.sh"] 