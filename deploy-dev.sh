#!/bin/bash

# Deploy script for development server with database reset
# This script will reset the database on each deployment

echo "🚀 Starting development deployment with database reset..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Stop existing services
print_step "Stopping existing Docker services..."
docker-compose down --volumes --remove-orphans
print_success "Services stopped"

# Step 2: Remove any existing database volumes to force reset
print_step "Removing database volumes to force reset..."
docker volume rm irielle-platform_mongodb_data 2>/dev/null || true
docker volume rm irielle-platform_chromadb_data 2>/dev/null || true
print_success "Database volumes removed"

# Step 3: Build fresh images
print_step "Building fresh Docker images..."
docker-compose build --no-cache
print_success "Images built"

# Step 4: Start MongoDB first and wait for it
print_step "Starting MongoDB service..."
docker-compose up -d mongodb
print_success "MongoDB started"

# Wait for MongoDB to be ready
print_step "Waiting for MongoDB to be ready..."
sleep 10

# Check if MongoDB is responding
while ! docker exec irielle-platform-mongodb-1 mongosh --quiet --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
    echo "Waiting for MongoDB to be ready..."
    sleep 2
done
print_success "MongoDB is ready"

# Step 5: Seed the database
print_step "Seeding database with fresh data..."
docker exec irielle-platform-mongodb-1 mongosh --quiet /docker-entrypoint-initdb.d/seed-data.js
print_success "Database seeded successfully"

# Step 6: Start all other services
print_step "Starting all services..."
docker-compose up -d
print_success "All services started"

# Step 7: Wait for application to be ready
print_step "Waiting for application to be ready..."
sleep 15

# Check if the application is responding
while ! curl -f http://localhost:3000 >/dev/null 2>&1; do
    echo "Waiting for application to be ready..."
    sleep 3
done
print_success "Application is ready"

# Step 8: Display connection info
echo ""
echo "🎉 Development deployment completed successfully!"
echo ""
echo "📱 Access the application:"
echo "   Local: http://localhost:3000"
echo "   Production: http://89.116.170.202:3000"
echo ""
echo "🔐 Login credentials (RESET ON EACH DEPLOYMENT):"
echo "   Admin PIN: 1234"
echo "   Staff PIN: 5678"
echo ""
echo "📊 Database status:"
echo "   MongoDB: Fresh reset with sample data"
echo "   Users: 5 (1 admin, 4 staff)"
echo "   Patients: 5 with complete medical records"
echo "   Reports: 3 sample daily reports"
echo "   Communications: 4 team messages"
echo ""
echo "🔧 Services running:"
docker-compose ps

echo ""
print_warning "Database is reset on EVERY deployment - this is for development only!"
echo ""