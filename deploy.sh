#!/bin/bash

# Deployment script for CLAIR Healthcare System
# This script handles deployment of the unified healthcare management system

set -e

echo "🚀 Starting deployment of CLAIR Healthcare System..."

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
        echo ""
        echo "🔧 Development access:"
        echo "   - CLAIR Frontend (direct): http://localhost:3000"
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

# Function to create backup
create_backup() {
    local backup_type="${1:-manual}"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="./backups"
    local backup_file="clair_backup_${backup_type}_${timestamp}.tar.gz"
    
    echo "💾 Creating ${backup_type} backup: ${backup_file}"
    
    # Create backup directory
    mkdir -p "$backup_dir"
    
    # Create temporary directory for backup
    local temp_dir=$(mktemp -d)
    
    # Backup MongoDB data
    echo "📦 Backing up MongoDB..."
    docker-compose exec -T mongodb mongodump --authenticationDatabase admin \
        --username admin --password securepassword \
        --out /data/backup/mongo_${timestamp} 2>/dev/null || {
        echo "❌ MongoDB backup failed"
        rm -rf "$temp_dir"
        return 1
    }
    
    # Copy MongoDB backup from container
    docker cp $(docker-compose ps -q mongodb):/data/backup/mongo_${timestamp} "$temp_dir/"
    
    # Backup configuration files
    echo "📦 Backing up configuration..."
    cp -r .env docker-compose.yml "$temp_dir/" 2>/dev/null || true
    
    # Create compressed archive
    echo "🗜️  Compressing backup..."
    tar -czf "$backup_dir/$backup_file" -C "$temp_dir" . 2>/dev/null || {
        echo "❌ Backup compression failed"
        rm -rf "$temp_dir"
        return 1
    }
    
    # Cleanup temp directory
    rm -rf "$temp_dir"
    
    # Cleanup old backups (keep last 10)
    echo "🧹 Cleaning old backups..."
    ls -t "$backup_dir"/clair_backup_*.tar.gz | tail -n +11 | xargs -r rm -f
    
    echo "✅ Backup created successfully: $backup_dir/$backup_file"
    echo "📊 Backup size: $(du -h "$backup_dir/$backup_file" | cut -f1)"
}

# Function to restore from backup
restore_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        echo "❌ Please provide backup file path"
        echo "Available backups:"
        ls -la ./backups/clair_backup_*.tar.gz 2>/dev/null || echo "No backups found"
        return 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        echo "❌ Backup file not found: $backup_file"
        return 1
    fi
    
    echo "🔄 Restoring from backup: $backup_file"
    
    # Stop services
    echo "🛑 Stopping services..."
    docker-compose down
    
    # Create temporary directory for restore
    local temp_dir=$(mktemp -d)
    
    # Extract backup
    echo "📦 Extracting backup..."
    tar -xzf "$backup_file" -C "$temp_dir" || {
        echo "❌ Failed to extract backup"
        rm -rf "$temp_dir"
        return 1
    }
    
    # Start MongoDB only
    echo "🚀 Starting MongoDB..."
    docker-compose up -d mongodb
    sleep 10
    
    # Restore MongoDB data
    echo "🔄 Restoring MongoDB..."
    local mongo_backup_dir=$(find "$temp_dir" -name "mongo_*" -type d | head -1)
    if [ -n "$mongo_backup_dir" ]; then
        docker cp "$mongo_backup_dir" $(docker-compose ps -q mongodb):/data/restore/
        docker-compose exec mongodb mongorestore --authenticationDatabase admin \
            --username admin --password securepassword \
            --drop /data/restore/$(basename "$mongo_backup_dir") || {
            echo "❌ MongoDB restore failed"
            rm -rf "$temp_dir"
            return 1
        }
    fi
    
    # Restore configuration if available
    echo "🔧 Restoring configuration..."
    [ -f "$temp_dir/.env" ] && cp "$temp_dir/.env" .env
    [ -f "$temp_dir/docker-compose.yml" ] && cp "$temp_dir/docker-compose.yml" docker-compose.yml
    
    # Cleanup temp directory
    rm -rf "$temp_dir"
    
    # Start all services
    echo "🚀 Starting all services..."
    docker-compose up -d
    sleep 30
    
    # Check services
    check_services
    
    echo "✅ Restore completed successfully"
}

# Function to show monitoring
show_monitoring() {
    echo "📊 CLAIR System Monitoring"
    echo "=========================="
    echo ""
    
    # System resources
    echo "💻 System Resources:"
    echo "CPU Usage: $(top -l 1 | grep "CPU usage" | awk '{print $3}' 2>/dev/null || echo "N/A")"
    echo "Memory: $(free -h 2>/dev/null | grep Mem | awk '{print $3 "/" $2}' || echo "N/A")"
    echo "Disk: $(df -h . | tail -1 | awk '{print $3 "/" $2 " (" $5 " used)"}')"
    echo ""
    
    # Docker containers
    echo "🐳 Container Status:"
    docker-compose ps
    echo ""
    
    # Service health
    echo "🏥 Service Health:"
    check_services
    echo ""
    
    # Database stats
    echo "💾 Database Stats:"
    docker-compose exec mongodb mongosh --quiet --eval "
        print('Users: ' + db.users.countDocuments());
        print('Patients: ' + db.patients.countDocuments());
        print('Reports: ' + db.dailyreports.countDocuments());
        print('Audit Logs: ' + db.auditlogs.countDocuments());
    " 2>/dev/null || echo "❌ Cannot connect to database"
    echo ""
    
    # Recent logs
    echo "📋 Recent Error Logs:"
    docker-compose logs --tail=5 | grep -i error || echo "No recent errors"
    echo ""
    
    # Backup status
    echo "💾 Backup Status:"
    if [ -d "./backups" ]; then
        echo "Latest backup: $(ls -t ./backups/clair_backup_*.tar.gz 2>/dev/null | head -1 | xargs basename 2>/dev/null || echo "None")"
        echo "Total backups: $(ls ./backups/clair_backup_*.tar.gz 2>/dev/null | wc -l)"
    else
        echo "No backup directory found"
    fi
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
    "backup")
        echo "💾 Creating system backup..."
        create_backup "${2:-manual}"
        ;;
    "restore")
        echo "🔄 Restoring from backup..."
        restore_backup "$2"
        ;;
    "monitor")
        echo "📊 System monitoring..."
        show_monitoring
        ;;
    *)
        echo "Usage: $0 {deploy|logs|status|cleanup|restart|stop|ssl|backup|restore|monitor}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Deploy the complete system (default)"
        echo "  logs    - Show service logs"
        echo "  status  - Check service health"
        echo "  cleanup - Clean up containers and images"
        echo "  restart - Restart all services"
        echo "  stop    - Stop all services"
        echo "  ssl     - Set up SSL certificates"
        echo "  backup  - Create system backup (optional: auto|manual)"
        echo "  restore - Restore from backup (provide backup file)"
        echo "  monitor - Show system monitoring"
        exit 1
        ;;
esac