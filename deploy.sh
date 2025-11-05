#!/bin/bash

# Deployment script for Kimkles API
# This script helps automate the deployment process

set -e  # Exit on error

echo "🚀 Starting Kimkles API Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Please create a .env file with all required environment variables."
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}📦 Installing server dependencies...${NC}"
cd server
npm install
cd ..

# Create logs directory if it doesn't exist
mkdir -p logs

# Build React application
echo -e "${YELLOW}🔨 Building React application...${NC}"
npm run build

if [ ! -d "build" ]; then
    echo -e "${RED}❌ Error: Build directory not created!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 not found. Installing PM2 globally...${NC}"
    npm install -g pm2
fi

# Stop existing PM2 process if running
echo -e "${YELLOW}🛑 Stopping existing PM2 processes...${NC}"
pm2 stop kimkles-api 2>/dev/null || true
pm2 delete kimkles-api 2>/dev/null || true

# Start application with PM2
echo -e "${YELLOW}🚀 Starting application with PM2...${NC}"
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "Application Status:"
pm2 status kimkles-api
echo ""
echo "View logs with: pm2 logs kimkles-api"
echo "View monitoring: pm2 monit"

