#!/bin/bash

# Deployment script for Irielle Platform
set -e

echo "Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
npm ci

# Build the application
npm run build

# Build Docker image
docker build -t irielle-platform:latest .

# Stop and remove existing container
docker stop irielle-platform 2>/dev/null || true
docker rm irielle-platform 2>/dev/null || true

# Run new container
docker run -d \
  --name irielle-platform \
  --restart unless-stopped \
  -p 3000:3000 \
  irielle-platform:latest

# Clean up old images
docker image prune -f

echo "Deployment completed successfully!"
echo "Application is running on http://localhost:3000"