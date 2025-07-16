#!/bin/bash

# Setup SSL Certificate Auto-Renewal Cron Job
# Run this script once on your server to set up automatic SSL renewal

PROJECT_PATH="/actions-runner/_work/irielle/irielle"
CRON_LOG="/var/log/ssl-renewal.log"

echo "🔧 Setting up SSL certificate auto-renewal cron job..."

# Create the cron job that runs twice daily
CRON_JOB="0 0,12 * * * cd $PROJECT_PATH && ./scripts/renew-ssl.sh >> $CRON_LOG 2>&1"

# Add to crontab if not already there
if ! crontab -l 2>/dev/null | grep -q "renew-ssl.sh"; then
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ SSL auto-renewal cron job added successfully"
    echo "📝 Renewal will run twice daily at 00:00 and 12:00"
    echo "📋 Logs will be written to: $CRON_LOG"
else
    echo "⚠️  SSL auto-renewal cron job already exists"
fi

# Display current crontab
echo ""
echo "📊 Current crontab:"
crontab -l

echo ""
echo "🔍 To monitor SSL renewal logs:"
echo "   tail -f $CRON_LOG"
echo ""
echo "🧪 To test SSL renewal manually:"
echo "   cd $PROJECT_PATH && ./scripts/renew-ssl.sh"