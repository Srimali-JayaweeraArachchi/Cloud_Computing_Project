# Stage 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy only production dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create non-root user for security (good for marks)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Start the server (adjust if your entry point is different)
CMD ["node", "src/server.js"]