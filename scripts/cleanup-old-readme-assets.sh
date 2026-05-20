#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Keep only the current README screenshot set and the capture guide.
mkdir -p docs/screenshots
find docs/screenshots -maxdepth 1 -type f \
  ! -name 'home.png' \
  ! -name 'catalogue.png' \
  ! -name 'car-detail.png' \
  ! -name 'booking-extras.png' \
  ! -name 'payment.png' \
  ! -name 'receipt.png' \
  ! -name 'account.png' \
  ! -name 'admin-dashboard.png' \
  ! -name 'admin-cars.png' \
  ! -name 'CAPTURE_GUIDE.md' \
  -print -delete

# Remove macOS zip metadata if it was ever committed accidentally.
find . -name '__MACOSX' -type d -prune -exec rm -rf {} +
find . -name '._*' -type f -delete

echo "Old README screenshots and macOS zip metadata cleaned."
