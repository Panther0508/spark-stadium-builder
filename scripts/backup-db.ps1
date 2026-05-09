# HallsSports Database Backup Script (PowerShell)
# ================================================
# This script creates a timestamped backup of your Supabase database.
# Supabase free tier has no automatic backups — run this manually!
#
# USAGE:
#   1. Ensure PostgreSQL client tools are installed (includes pg_dump)
#   2. Set your SUPABASE_DATABASE_URL environment variable
#   3. Run in PowerShell: .\scripts\backup-db.ps1
#
# The backup will be saved to: backups\hallsports_backup_YYYYMMDD_HHMMSS.sql
# Keep these files safe — they contain all your match data, chats, and settings.

# Stop on error
$ErrorActionPreference = "Stop"

# Check environment variable
if (-not $env:SUPABASE_DATABASE_URL) {
    Write-Host "ERROR: SUPABASE_DATABASE_URL environment variable not set." -ForegroundColor Red
    Write-Host "Get it from your Supabase dashboard: Project Settings -> Database -> Connection String"
    exit 1
}

# Generate timestamp
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = "backups\hallsports_backup_$Timestamp.sql"

Write-Host "Starting backup..."
Write-Host "Output file: $BackupFile"

# Run pg_dump with custom format (-Fc)
try {
    pg_dump $env:SUPABASE_DATABASE_URL --clean --if-exists -Fc > $BackupFile

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Backup completed successfully!" -ForegroundColor Green
        $FileSize = (Get-Item $BackupFile).Length / 1KB
        Write-Host "File size: {0:N2} KB" -f $FileSize
        Write-Host ""
        Write-Host "To restore this backup, run:"
        Write-Host "  pg_restore -d `$env:SUPABASE_DATABASE_URL $BackupFile"
    }
    else {
        Write-Host "Backup FAILED. Check your SUPABASE_DATABASE_URL and pg_dump installation." -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
    Write-Host "Make sure pg_dump is in your PATH (install PostgreSQL client tools)."
    exit 1
}
