#!/bin/bash
# Generate VAPID keys for Web Push notifications
# This script requires web-push to be installed locally.

echo "Generating VAPID keys..."

# Ensure web-push is available
if ! npx web-push --version >/dev/null 2>&1; then
  echo "Error: web-push is not installed or not available."
  echo "Please install it locally with: npm install -D web-push"
  exit 1
fi

# Generate keys and capture output
KEYS=$(npx web-push generate-vapid-keys)

echo ""
echo "VAPID keys generated:"
echo "$KEYS"

# Extract public and private keys
PUBLIC_KEY=$(echo "$KEYS" | grep "Public Key:" | awk '{print $3}')
PRIVATE_KEY=$(echo "$KEYS" | grep "Private Key:" | awk '{print $3}')

echo ""
echo "IMPORTANT: Add these to your environment variables:"
echo "  NEXT_PUBLIC_VAPID_PUBLIC_KEY=$PUBLIC_KEY"
echo "  VAPID_PRIVATE_KEY=$PRIVATE_KEY"
echo ""
echo "Also add them to your Vercel environment variables (Site Settings → Environment Variables)."
echo "WARNING: Never commit the private key to version control."
