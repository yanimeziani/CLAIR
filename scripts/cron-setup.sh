#!/bin/bash

# CLAIR Automated Backup Cron Setup Script
# This script sets up automated backups using cron

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAIR_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_SCRIPT="$SCRIPT_DIR/backup-automated.sh"

echo "🕐 Setting up automated backups for CLAIR..."

# Ensure backup script is executable
chmod +x "$BACKUP_SCRIPT"

# Create log directory
sudo mkdir -p /var/log/clair
sudo chown $(whoami):$(id -gn) /var/log/clair

# Create backup directory
sudo mkdir -p /opt/clair/backups
sudo chown $(whoami):$(id -gn) /opt/clair/backups

# Check if cron is installed
if ! command -v crontab > /dev/null 2>&1; then
    echo "❌ Cron is not installed. Please install cron first."
    exit 1
fi

# Backup existing crontab
echo "📋 Backing up existing crontab..."
crontab -l > /tmp/crontab_backup_$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "No existing crontab found"

# Create new crontab entries
echo "⚙️ Setting up cron jobs..."

# Create temporary crontab file
TEMP_CRON=$(mktemp)

# Add existing crontab entries (if any)
crontab -l 2>/dev/null | grep -v "CLAIR Backup" >> "$TEMP_CRON" || true

# Add CLAIR backup jobs
cat >> "$TEMP_CRON" << EOF

# CLAIR Backup Jobs
# Daily backup at 2:00 AM
0 2 * * * cd $CLAIR_DIR && $BACKUP_SCRIPT backup >> /var/log/clair/backup.log 2>&1

# Weekly maintenance on Sunday at 1:00 AM
0 1 * * 0 cd $CLAIR_DIR && $BACKUP_SCRIPT maintenance >> /var/log/clair/maintenance.log 2>&1

# Monthly cleanup on the 1st at 3:00 AM
0 3 1 * * cd $CLAIR_DIR && $BACKUP_SCRIPT cleanup >> /var/log/clair/cleanup.log 2>&1

# Health check every 6 hours
0 */6 * * * cd $CLAIR_DIR && $BACKUP_SCRIPT health >> /var/log/clair/health.log 2>&1

EOF

# Install new crontab
crontab "$TEMP_CRON"

# Cleanup
rm "$TEMP_CRON"

echo "✅ Cron jobs installed successfully!"
echo ""
echo "📅 Scheduled backup jobs:"
echo "  - Daily backup: 2:00 AM"
echo "  - Weekly maintenance: Sunday 1:00 AM"
echo "  - Monthly cleanup: 1st of month 3:00 AM"
echo "  - Health checks: Every 6 hours"
echo ""
echo "📁 Log files location:"
echo "  - Backup logs: /var/log/clair/backup.log"
echo "  - Maintenance logs: /var/log/clair/maintenance.log"
echo "  - Cleanup logs: /var/log/clair/cleanup.log"
echo "  - Health logs: /var/log/clair/health.log"
echo ""
echo "🔧 View current cron jobs:"
echo "  crontab -l | grep CLAIR"
echo ""
echo "📋 View active cron jobs:"
echo "  crontab -l"
echo ""
echo "🗑️ To remove CLAIR backup jobs:"
echo "  crontab -l | grep -v 'CLAIR Backup' | crontab -"

# Test the backup script
echo "🧪 Testing backup script..."
if "$BACKUP_SCRIPT" health; then
    echo "✅ Backup script test passed"
else
    echo "❌ Backup script test failed"
    exit 1
fi

echo ""
echo "🎉 Automated backup setup completed!"
echo "💡 Tip: Run '$BACKUP_SCRIPT test' to perform a test backup"