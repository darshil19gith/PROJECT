# Use official Node.js LTS lightweight image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package metadata
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production || npm install

# Copy application files
COPY . .

# Expose server port
EXPOSE 3000

# Set environment
ENV PORT=3000

# Start server
CMD ["node", "server.js"]
