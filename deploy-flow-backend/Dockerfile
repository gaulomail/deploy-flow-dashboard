# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app

USER appuser

# The GITHUB_TOKEN will be passed as an environment variable during runtime
ENV NODE_ENV=production

# Expose the port Fastify listens on (default 3000)
EXPOSE 3000

# Start the Fastify server
CMD [ "npm", "start" ]