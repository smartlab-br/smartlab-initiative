# Build stage
FROM node:20-alpine as builder

WORKDIR /app
# Copy package files
COPY --chown=node:node package*.json ./
# Install dependencies
RUN npm ci
# Copy source code
COPY --chown=node:node . .
# Build the application for production
RUN npx nuxi build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY --from=builder --chown=node:node /app/package*.json ./
RUN npm ci --production

# Copy the built output
COPY --from=builder --chown=node:node /app/.output /app/.output
COPY --from=builder --chown=node:node /app/nuxt.config.ts ./

# Switch to non-root user
USER node

# Set host and port environment variables
ENV HOST=0.0.0.0
ENV PORT=80

# Expose the port your application runs on
EXPOSE 8080

ENTRYPOINT ["node"]
CMD [".output/server/index.mjs"]