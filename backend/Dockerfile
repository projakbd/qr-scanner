# Node.js version 24-alpine
FROM node:24-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN node ace build --ignore-ts-errors

# Final stage
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy built files from build stage
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

# Install production dependencies only in the build directory
RUN npm install --omit=dev

# Expose port
EXPOSE 8000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000
ENV HOST=0.0.0.0

# Start the server
CMD ["node", "build/bin/server.js"]
