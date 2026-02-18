FROM node:20-alpine AS builder

WORKDIR /app

# Install backend dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Install frontend dependencies
COPY web/package.json web/package-lock.json ./web/
RUN cd web && npm ci

# Copy source
COPY . .

# Build backend (TypeScript)
RUN npx tsc

# Build frontend (Vite)
RUN cd web && npx vite build

# --- Production image ---
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/web/dist ./web/dist

EXPOSE 3456

CMD ["node", "dist/index.js", "web", "--port", "3456"]
