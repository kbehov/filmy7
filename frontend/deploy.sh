#!/bin/bash
set -e

APP_DIR="/var/www/filmy7/frontend"

echo "▶ 0. Moving to app directory..."
cd $APP_DIR

echo "▶ 1. Pulling latest code..."
git pull origin main

echo "▶ 2. Installing dependencies (clean)..."
npm ci

echo "▶ 3. Cleaning previous build..."
rm -rf .next

echo "▶ 4. Building Next.js (standalone)..."
npm run build

echo "▶ 4b. Copying static assets into standalone (required for output: 'standalone')..."
# Next standalone server.js does not include these; without them, /_next/static/* returns 404.
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

echo "▶ 5. Ensuring log directories exist..."
mkdir -p $APP_DIR/logs/pm2

echo "▶ 6. Reloading PM2 (zero-downtime)..."
pm2 reload ecosystem.config.cjs --update-env

echo "▶ 6b. Clearing nginx proxy cache..."
# Cached HTML can reference previous build's _next/static chunk names; purge so clients get fresh HTML.
sudo rm -rf /var/cache/nginx/filmy7/*

echo "▶ 7. Saving PM2 state..."
pm2 save

echo "▶ 8. Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deployment Successful"
