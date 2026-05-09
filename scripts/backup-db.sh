#!/bin/bash
# HallsSports Database Backup Script
# ===================================
# This script creates a timestamped backup of your Supabase database.
# No automatic backups exist on the free tier — run this regularly!
#
# USAGE:
#   1. Ensure pg_dump is installed (comes with PostgreSQL)
#   2. Set your SUPABASE_DATABASE_URL environment variable
#   3. Run: ./scripts/backup-db.sh
#
# The backup will be saved to: backups/hallsports_backup_YYYYMMDD_HHMMSS.sql
# Keep these files safe — they contain all your match data, chats, and settings.

set -e  # Exit on error

# Read connection string from environment
if [ -z "$SUPABASE_DATABASE_URL" ]; then
    echo "ERROR: SUPABASE_DATABASE_URL environment variable not set."
    echo "Get it from your Supabase dashboard: Project Settings -> Database -> Connection String"
    exit 1
fi

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/hallsports_backup_${TIMESTAMP}.sql"

echo "Starting backup..."
echo "Output file: $BACKUP_FILE"

# Run pg_dump
# -Fc = custom format (compressed, restoreable with pg_restore)
# --clean = includes DROP commands (rebuilds schema cleanly)
# --if-exists = prevents errors if objects don't exist during restore
pg_dump "$SUPABASE_DATABASE_URL" --clean --if-exists -Fc > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Backup completed successfully!"
    echo "File size: $(du -h "$BACKUP_FILE" | cut -f1)"
    echo ""
    echo "To restore this backup, run:"
    echo "  pg_restore -d \$SUPABASE_DATABASE_URL $BACKUP_FILE"
else
    echo "Backup FAILED. Check your SUPABASE_DATABASE_URL and pg_dump installation."
    exit 1
fi
