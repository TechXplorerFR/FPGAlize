# Use node as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

RUN pwd
RUN ls

# Copy package files
COPY Code/Frontend/package.json Code/Frontend/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy app source
COPY Code/Frontend ./

# Build the app
RUN npm run build

# Expose the port
EXPOSE 4173

# Run preview server
CMD ["npm", "run", "preview"]