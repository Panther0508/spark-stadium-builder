# Generate VAPID keys for Web Push notifications
# Requires web-push to be installed locally.

Write-Host "Generating VAPID keys..." -ForegroundColor Cyan

# Check if web-push is available
try {
    npx web-push --version | Out-Null
} catch {
    Write-Host "Error: web-push is not installed or not available." -ForegroundColor Red
    Write-Host "Please install it locally with: npm install -D web-push" -ForegroundColor Yellow
    exit 1
}

# Generate keys
$keys = npx web-push generate-vapid-keys

Write-Host ""
Write-Host "VAPID keys generated:" -ForegroundColor Green
Write-Host $keys

# Extract keys
$publicKey = ($keys -split "`n" | Where-Object { $_ -match "Public Key:" }) -replace ".*Public Key:\s+", ""
$privateKey = ($keys -split "`n" | Where-Object { $_ -match "Private Key:" }) -replace ".*Private Key:\s+", ""

Write-Host ""
Write-Host "IMPORTANT: Add these to your environment variables:" -ForegroundColor Cyan
Write-Host "  NEXT_PUBLIC_VAPID_PUBLIC_KEY=$publicKey"
Write-Host "  VAPID_PRIVATE_KEY=$privateKey"
Write-Host ""
Write-Host "Also add them to your Vercel environment variables (Site Settings → Environment Variables)."
Write-Host "WARNING: Never commit the private key to version control." -ForegroundColor Yellow
