#!/bin/bash

# Automated Backup Script for CLAIR Healthcare System
# This script performs automated backups with rotation and health checks

set -e

# Configuration
BACKUP_DIR="/opt/clair/backups"
LOG_FILE="/var/log/clair-backup.log"
RETENTION_DAYS=30
REMOTE_BACKUP_ENABLED=false
REMOTE_BACKUP_PATH=""
HEALTHCHECK_URL=""

# Create directories
mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$BACKUP_DIR"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR: $1"
    exit 1
}

# Health check function
health_check() {
    log "Starting health check..."
    
    # Check if CLAIR directory exists
    if [ ! -d "/opt/clair" ]; then
        error_exit "CLAIR directory not found"
    fi
    
    cd /opt/clair
    
    # Check if docker-compose is running
    if ! docker-compose ps | grep -q "Up"; then
        error_exit "Docker services are not running"
    fi
    
    # Check MongoDB connectivity
    if ! docker-compose exec -T mongodb mongosh --quiet --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        error_exit "MongoDB is not responding"
    fi
    
    log "Health check passed"
}

# Backup function
create_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="clair_backup_auto_${timestamp}.tar.gz"
    local temp_dir=$(mktemp -d)
    
    log "Starting backup: $backup_file"
    
    # Backup MongoDB
    log "Backing up MongoDB database..."
    if ! docker-compose exec -T mongodb mongodump --authenticationDatabase admin \
        --username admin --password securepassword \
        --out /data/backup/mongo_${timestamp} 2>/dev/null; then
        rm -rf "$temp_dir"
        error_exit "MongoDB backup failed"
    fi
    
    # Copy MongoDB backup from container
    local container_id=$(docker-compose ps -q mongodb)
    if ! docker cp "$container_id:/data/backup/mongo_${timestamp}" "$temp_dir/"; then
        rm -rf "$temp_dir"
        error_exit "Failed to copy MongoDB backup"
    fi
    
    # Backup configuration files
    log "Backing up configuration files..."
    cp -r .env docker-compose.yml "$temp_dir/" 2>/dev/null || true
    
    # Backup uploaded files if they exist
    if [ -d "./uploads" ]; then
        log "Backing up uploaded files..."
        cp -r ./uploads "$temp_dir/" 2>/dev/null || true
    fi
    
    # Create compressed archive
    log "Creating compressed backup..."
    if ! tar -czf "$BACKUP_DIR/$backup_file" -C "$temp_dir" . 2>/dev/null; then
        rm -rf "$temp_dir"
        error_exit "Backup compression failed"
    fi
    
    # Cleanup temp directory
    rm -rf "$temp_dir"
    
    # Verify backup integrity
    log "Verifying backup integrity..."
    if ! tar -tzf "$BACKUP_DIR/$backup_file" > /dev/null 2>&1; then
        error_exit "Backup verification failed"
    fi
    
    local backup_size=$(du -h "$BACKUP_DIR/$backup_file" | cut -f1)
    log "Backup created successfully: $backup_file (Size: $backup_size)"
    
    # Remote backup if enabled
    if [ "$REMOTE_BACKUP_ENABLED" = true ] && [ -n "$REMOTE_BACKUP_PATH" ]; then
        log "Uploading to remote storage..."
        if rsync -av "$BACKUP_DIR/$backup_file" "$REMOTE_BACKUP_PATH/"; then
            log "Remote backup successful"
        else
            log "WARNING: Remote backup failed"
        fi
    fi
    
    echo "$backup_file"
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups (retention: $RETENTION_DAYS days)..."
    
    local deleted_count=0
    
    # Clean local backups
    if [ -d "$BACKUP_DIR" ]; then
        find "$BACKUP_DIR" -name "clair_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
        deleted_count=$(find "$BACKUP_DIR" -name "clair_backup_*.tar.gz" -mtime +$RETENTION_DAYS | wc -l)
    fi
    
    # Clean remote backups if enabled
    if [ "$REMOTE_BACKUP_ENABLED" = true ] && [ -n "$REMOTE_BACKUP_PATH" ]; then
        ssh $(echo "$REMOTE_BACKUP_PATH" | cut -d: -f1) \
            "find $(echo "$REMOTE_BACKUP_PATH" | cut -d: -f2) -name 'clair_backup_*.tar.gz' -mtime +$RETENTION_DAYS -delete" 2>/dev/null || true
    fi
    
    log "Cleanup completed. Deleted $deleted_count old backups"
}

# Send health check ping if configured
send_healthcheck() {
    if [ -n "$HEALTHCHECK_URL" ]; then
        curl -fsS -m 10 --retry 3 "$HEALTHCHECK_URL" > /dev/null 2>&1 || log "WARNING: Health check ping failed"
    fi
}

# Database maintenance
perform_maintenance() {
    log "Performing database maintenance..."
    
    # Compact database
    docker-compose exec -T mongodb mongosh --quiet --eval "
        db.runCommand({compact: 'users'});
        db.runCommand({compact: 'patients'});
        db.runCommand({compact: 'dailyreports'});
        db.runCommand({compact: 'auditlogs'});
    " 2>/dev/null || log "WARNING: Database compaction failed"
    
    # Update statistics
    docker-compose exec -T mongodb mongosh --quiet --eval "
        db.runCommand({reIndex: 'auditlogs'});
    " 2>/dev/null || log "WARNING: Index rebuild failed"
    
    log "Database maintenance completed"
}

# Main execution
main() {
    log "=========================================="
    log "Starting automated backup process"
    log "=========================================="
    
    # Change to CLAIR directory
    cd /opt/clair || error_exit "Cannot change to CLAIR directory"
    
    # Perform health check
    health_check
    
    # Perform database maintenance (weekly only)
    if [ "$(date +%u)" = "7" ]; then  # Sunday
        perform_maintenance
    fi
    
    # Create backup
    local backup_file=$(create_backup)
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Send success notification
    send_healthcheck
    
    log "Backup process completed successfully"
    log "Current backup: $backup_file"
    log "=========================================="
}

# Command line options
case "${1:-backup}" in
    "backup")
        main
        ;;
    "cleanup")
        log "Manual cleanup requested"
        cleanup_old_backups
        ;;
    "health")
        health_check
        log "Health check completed"
        ;;
    "maintenance")
        log "Manual maintenance requested"
        cd /opt/clair || error_exit "Cannot change to CLAIR directory"
        perform_maintenance
        ;;
    "test")
        log "Testing backup process..."
        # Set test retention to 1 day for testing
        RETENTION_DAYS=1
        main
        ;;
    *)
        echo "Usage: $0 {backup|cleanup|health|maintenance|test}"
        echo ""
        echo "Commands:"
        echo "  backup      - Perform full backup (default)"
        echo "  cleanup     - Clean old backups only"
        echo "  health      - Perform health check only"
        echo "  maintenance - Perform database maintenance"
        echo "  test        - Test backup with short retention"
        exit 1
        ;;
esac