#!/bin/bash

# test-setup.sh - Test the Docker setup
set -e

echo "🚀 Testing Irielle Docker Setup..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    exit 1
fi

echo "✅ Docker is running"

# Check if docker-compose.yml is valid
if ! docker compose config --quiet; then
    echo "❌ docker-compose.yml is invalid"
    exit 1
fi

echo "✅ docker-compose.yml is valid"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  .env.production not found, copying from example"
    cp .env.production.example .env.production
    echo "📝 Please edit .env.production with your actual values"
fi

echo "✅ Environment file exists"

# Test nginx configuration
echo "🔧 Testing nginx configuration..."
mkdir -p /tmp/test-ssl
openssl req -x509 -nodes -newkey rsa:2048 -days 1 -keyout /tmp/test-ssl/dummy.key -out /tmp/test-ssl/dummy.crt -subj "/CN=localhost" > /dev/null 2>&1
docker run --rm -v $(pwd)/docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro -v $(pwd)/docker/nginx/conf.d:/etc/nginx/conf.d:ro -v /tmp/test-ssl:/etc/nginx/ssl:ro nginx:alpine nginx -t
rm -rf /tmp/test-ssl

echo "✅ Nginx configuration is valid"

# Start core services
echo "🔧 Starting core services..."
docker compose up -d mongodb chromadb

echo "⏳ Waiting for databases to initialize..."
sleep 30

# Check database health
echo "🔧 Checking database connectivity..."

# Test MongoDB
if docker compose exec -T mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB is responding"
else
    echo "⚠️  MongoDB may still be initializing"
fi

# Test ChromaDB
if curl -s http://localhost:8000/api/v1/heartbeat > /dev/null 2>&1; then
    echo "✅ ChromaDB is responding"
else
    echo "⚠️  ChromaDB may still be initializing"
fi

# Build and start application services
echo "🔧 Building and starting application services..."
docker compose build ai-backend frontend
docker compose up -d ai-backend frontend

echo "⏳ Waiting for application services..."
sleep 20

# Start nginx
echo "🔧 Starting nginx reverse proxy..."
docker compose up -d nginx

echo "⏳ Waiting for nginx..."
sleep 10

# Test health endpoint
echo "🔧 Testing health endpoint..."
if curl -k -s https://localhost/health | grep -q "healthy"; then
    echo "✅ Health endpoint is responding"
else
    echo "⚠️  Health endpoint may not be ready yet"
fi

# Test HTTP to HTTPS redirect
echo "🔧 Testing HTTP to HTTPS redirect..."
if curl -s -I http://localhost/ | grep -q "301"; then
    echo "✅ HTTP to HTTPS redirect is working"
else
    echo "⚠️  HTTP redirect may not be configured correctly"
fi

# Show service status
echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "🎉 Basic setup test completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env.production with your actual values"
echo "2. If you have a domain, run: ./docker/certbot/init-letsencrypt.sh yourdomain.com admin@yourdomain.com 1"
echo "3. For production SSL: ./docker/certbot/init-letsencrypt.sh yourdomain.com admin@yourdomain.com 0"
echo "4. Access your application at https://localhost (with self-signed cert warning)"
echo ""
echo "📖 For detailed setup instructions, see: docker/README.md"