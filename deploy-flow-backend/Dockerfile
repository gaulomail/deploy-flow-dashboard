# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port Fastify listens on (default 3000)
EXPOSE 3000

# Start the Fastify server
CMD [ "npm", "run", "start" ]