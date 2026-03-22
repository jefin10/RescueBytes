#!/bin/bash

# RescueBytes AWS Deployment Script
# This script automates the deployment process on AWS EC2

set -e  # Exit on error

echo "🚀 RescueBytes Deployment Script"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ Error: backend/.env file not found!${NC}"
    echo ""
    echo "Please create backend/.env file with required variables:"
    echo "  cp backend/.env.example backend/.env"
    echo "  nano backend/.env"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} Found backend/.env file"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo ""
    echo "Install Docker with:"
    echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "  sudo sh get-docker.sh"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker is installed"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed!${NC}"
    echo ""
    echo "Install Docker Compose with:"
    echo "  sudo apt install docker-compose -y"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker Compose is installed"
echo ""

# Ask user about MongoDB
echo -e "${YELLOW}MongoDB Configuration:${NC}"
echo "Are you using MongoDB Atlas? (y/n)"
read -r use_atlas

if [ "$use_atlas" = "y" ] || [ "$use_atlas" = "Y" ]; then
    echo -e "${GREEN}✓${NC} Using MongoDB Atlas"
    echo -e "${YELLOW}⚠${NC}  Make sure MONGO_DB_URI in backend/.env points to Atlas"
    echo ""
    
    # Comment out mongo service in docker-compose
    if grep -q "^  mongo:" docker-compose.yml; then
        echo "Disabling local MongoDB service in docker-compose.yml..."
        sed -i '/^  mongo:/,/^$/s/^/#/' docker-compose.yml
        echo -e "${GREEN}✓${NC} Local MongoDB disabled"
    fi
else
    echo -e "${GREEN}✓${NC} Using local MongoDB (Docker)"
    echo ""
fi

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down 2>/dev/null || true
echo -e "${GREEN}✓${NC} Stopped existing containers"
echo ""

# Build and start services
echo "Building and starting services..."
echo "This may take 5-10 minutes on first run..."
echo ""

docker-compose up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "Services are starting up..."
    echo ""
    
    # Wait for services to be healthy
    echo "Waiting for services to be ready (30 seconds)..."
    sleep 30
    
    # Check container status
    echo ""
    echo "Container Status:"
    docker-compose ps
    echo ""
    
    # Get EC2 public IP (if available)
    PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}🎉 RescueBytes is now running!${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Access your application:"
    echo ""
    echo "  🌐 Frontend (Web Dashboard):"
    echo "     http://$PUBLIC_IP"
    echo ""
    echo "  🔌 Backend API:"
    echo "     http://$PUBLIC_IP:3000"
    echo ""
    echo "  📊 API Health Check:"
    echo "     http://$PUBLIC_IP:3000/auth/check"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Useful commands:"
    echo "  View logs:           docker-compose logs -f"
    echo "  View backend logs:   docker-compose logs -f backend"
    echo "  View frontend logs:  docker-compose logs -f frontend"
    echo "  Restart services:    docker-compose restart"
    echo "  Stop services:       docker-compose down"
    echo ""
    echo "Next steps:"
    echo "  1. Create a rescue center: curl -X POST http://$PUBLIC_IP:3000/addRC -H 'Content-Type: application/json' -d '{\"location\":\"Kottayam\",\"contactNumber\":\"+91-1234567890\"}'"
    echo "  2. Register admin user at: http://$PUBLIC_IP/register"
    echo "  3. Update mobile app API URL to: http://$PUBLIC_IP:3000"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo ""
    echo "Check logs with: docker-compose logs"
    echo ""
    exit 1
fi
