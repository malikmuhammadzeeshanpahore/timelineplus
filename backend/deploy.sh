#!/bin/bash
# Production deployment script

cd /var/www/timelineplus/backend

# Stash local changes if any
git stash

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Sync database
npx prisma db push

echo "✅ Deployment complete!"
