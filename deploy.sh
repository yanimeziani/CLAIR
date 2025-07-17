#!/bin/bash

# Deployment script for CLAIR Healthcare System with LUCIDE Analytics
# This script handles deployment of the complete system including both applications

set -e

echo "🚀 Starting deployment of CLAIR Healthcare System with LUCIDE Analytics..."

# Check if we're in the correct directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found. Please run this script from the CLAIR root directory."
    exit 1
fi

# Function to build and deploy
deploy_system() {
    echo "🏗️  Building and deploying all services..."
    
    # Stop existing services
    echo "🔄 Stopping existing services..."
    docker-compose down || true
    
    # Build all services
    echo "🔨 Building CLAIR frontend..."
    docker-compose build clair-frontend
    
    echo "🔨 Building LUCIDE Analytics..."
    docker-compose build lucide-analytics
    
    echo "🔨 Building AI Backend..."
    docker-compose build ai-backend
    
    echo "🔨 Building Ollama service..."
    docker-compose build ollama
    
    # Start all services
    echo "🚀 Starting all services..."
    docker-compose up -d
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    echo "🔍 Checking service health..."
    check_services
}

# Function to check service health
check_services() {
    local failed=0
    
    # Check MongoDB
    if docker-compose exec mongodb mongosh --quiet --eval "print('MongoDB is running')" > /dev/null 2>&1; then
        echo "✅ MongoDB is running"
    else
        echo "❌ MongoDB is not responding"
        failed=1
    fi
    
    # Check ChromaDB
    if curl -f http://localhost:8000/api/v1/heartbeat > /dev/null 2>&1; then
        echo "✅ ChromaDB is running"
    else
        echo "❌ ChromaDB is not responding"
        failed=1
    fi
    
    # Check Ollama
    if curl -f http://localhost:11434/api/version > /dev/null 2>&1; then
        echo "✅ Ollama is running"
    else
        echo "❌ Ollama is not responding"
        failed=1
    fi
    
    # Check AI Backend
    if curl -f http://localhost:8001/health > /dev/null 2>&1; then
        echo "✅ AI Backend is running"
    else
        echo "❌ AI Backend is not responding"
        failed=1
    fi
    
    # Check CLAIR Frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ CLAIR Frontend is running"
    else
        echo "❌ CLAIR Frontend is not responding"
        failed=1
    fi
    
    # Check LUCIDE Analytics
    if curl -f http://localhost:3001 > /dev/null 2>&1; then
        echo "✅ LUCIDE Analytics is running"
    else
        echo "❌ LUCIDE Analytics is not responding"
        failed=1
    fi
    
    # Check Nginx
    if curl -f http://localhost > /dev/null 2>&1; then
        echo "✅ Nginx is running"
    else
        echo "❌ Nginx is not responding"
        failed=1
    fi
    
    if [ $failed -eq 0 ]; then
        echo "🎉 All services are running successfully!"
        echo ""
        echo "🌐 Access your applications:"
        echo "   - CLAIR Healthcare System: http://localhost"
        echo "   - CLAIR Healthcare System: http://89.116.170.202:3000"
        echo "   - LUCIDE Analytics: http://localhost/analytics"
        echo "   - LUCIDE Analytics: http://89.116.170.202:3000/analytics"
        echo ""
        echo "🔧 Development access:"
        echo "   - CLAIR Frontend (direct): http://localhost:3000"
        echo "   - LUCIDE Analytics (direct): http://localhost:3001"
        echo "   - AI Backend API: http://localhost:8001"
        echo "   - MongoDB: mongodb://localhost:27017"
        echo "   - ChromaDB: http://localhost:8000"
        echo "   - Ollama: http://localhost:11434"
    else
        echo "❌ Some services are not running correctly. Check logs with:"
        echo "   docker-compose logs [service-name]"
        exit 1
    fi
}

# Function to show logs
show_logs() {
    echo "📋 Showing recent logs..."
    docker-compose logs --tail=50 "$@"
}

# Function to clean up
cleanup() {
    echo "🧹 Cleaning up..."
    docker-compose down --remove-orphans
    docker system prune -f
}

# Main execution
case "${1:-deploy}" in
    "deploy")
        deploy_system
        ;;
    "logs")
        show_logs "${@:2}"
        ;;
    "status")
        check_services
        ;;
    "cleanup")
        cleanup
        ;;
    "restart")
        echo "🔄 Restarting services..."
        docker-compose restart
        sleep 10
        check_services
        ;;
    "stop")
        echo "🛑 Stopping all services..."
        docker-compose down
        ;;
    "ssl")
        echo "🔐 Setting up SSL certificates..."
        ./clair-app/scripts/ssl-setup.sh
        ;;
    *)
        echo "Usage: $0 {deploy|logs|status|cleanup|restart|stop|ssl}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Deploy the complete system (default)"
        echo "  logs    - Show service logs"
        echo "  status  - Check service health"
        echo "  cleanup - Clean up containers and images"
        echo "  restart - Restart all services"
        echo "  stop    - Stop all services"
        echo "  ssl     - Set up SSL certificates"
        exit 1
        ;;
esac