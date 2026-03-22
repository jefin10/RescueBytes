#!/bin/bash

# RescueBytes Management Script
# Quick commands for managing your deployment

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

show_help() {
    echo "RescueBytes Management Script"
    echo ""
    echo "Usage: ./manage.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start       - Start all services"
    echo "  stop        - Stop all services"
    echo "  restart     - Restart all services"
    echo "  logs        - View all logs"
    echo "  logs-be     - View backend logs only"
    echo "  logs-fe     - View frontend logs only"
    echo "  status      - Show container status"
    echo "  update      - Pull latest code and rebuild"
    echo "  clean       - Stop and remove all containers"
    echo "  backup-db   - Backup MongoDB data"
    echo "  health      - Check service health"
    echo "  mongo       - Open MongoDB shell"
    echo "  mongo-ui    - Show Mongo Express URL"
    echo ""
}

check_docker() {
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose not found!${NC}"
        exit 1
    fi
}

get_public_ip() {
    curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost"
}

case "$1" in
    start)
        check_docker
        echo -e "${GREEN}Starting services...${NC}"
        docker-compose up -d
        echo -e "${GREEN}✓ Services started${NC}"
        ;;
    
    stop)
        check_docker
        echo -e "${YELLOW}Stopping services...${NC}"
        docker-compose down
        echo -e "${GREEN}✓ Services stopped${NC}"
        ;;
    
    restart)
        check_docker
        echo -e "${YELLOW}Restarting services...${NC}"
        docker-compose restart
        echo -e "${GREEN}✓ Services restarted${NC}"
        ;;
    
    logs)
        check_docker
        echo -e "${GREEN}Showing all logs (Ctrl+C to exit)...${NC}"
        docker-compose logs -f
        ;;
    
    logs-be)
        check_docker
        echo -e "${GREEN}Showing backend logs (Ctrl+C to exit)...${NC}"
        docker-compose logs -f backend
        ;;
    
    logs-fe)
        check_docker
        echo -e "${GREEN}Showing frontend logs (Ctrl+C to exit)...${NC}"
        docker-compose logs -f frontend
        ;;
    
    status)
        check_docker
        echo -e "${GREEN}Container Status:${NC}"
        docker-compose ps
        echo ""
        echo -e "${GREEN}Resource Usage:${NC}"
        docker stats --no-stream
        ;;
    
    update)
        check_docker
        echo -e "${YELLOW}Updating application...${NC}"
        git pull origin main
        echo -e "${GREEN}✓ Code updated${NC}"
        echo ""
        echo -e "${YELLOW}Rebuilding containers...${NC}"
        docker-compose up -d --build
        echo -e "${GREEN}✓ Application updated${NC}"
        ;;
    
    clean)
        check_docker
        echo -e "${RED}⚠ This will stop and remove all containers${NC}"
        echo "Are you sure? (y/n)"
        read -r confirm
        if [ "$confirm" = "y" ]; then
            docker-compose down -v
            echo -e "${GREEN}✓ Cleanup complete${NC}"
        else
            echo "Cancelled"
        fi
        ;;
    
    backup-db)
        check_docker
        BACKUP_DIR="backups"
        mkdir -p $BACKUP_DIR
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        BACKUP_FILE="$BACKUP_DIR/mongo_backup_$TIMESTAMP.gz"
        
        echo -e "${YELLOW}Creating database backup...${NC}"
        docker-compose exec -T mongo mongodump --archive --gzip > $BACKUP_FILE
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
        else
            echo -e "${RED}❌ Backup failed${NC}"
        fi
        ;;
    
    health)
        check_docker
        PUBLIC_IP=$(get_public_ip)
        
        echo -e "${GREEN}Checking service health...${NC}"
        echo ""
        
        # Check frontend
        echo -n "Frontend (port 80): "
        if curl -s -o /dev/null -w "%{http_code}" http://localhost/ | grep -q "200"; then
            echo -e "${GREEN}✓ Healthy${NC}"
        else
            echo -e "${RED}✗ Unhealthy${NC}"
        fi
        
        # Check backend
        echo -n "Backend (port 3000): "
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/auth/check | grep -q "200\|401"; then
            echo -e "${GREEN}✓ Healthy${NC}"
        else
            echo -e "${RED}✗ Unhealthy${NC}"
        fi
        
        echo ""
        echo "Access URLs:"
        echo "  Frontend: http://$PUBLIC_IP"
        echo "  Backend:  http://$PUBLIC_IP:3000"
        ;;
    
    mongo)
        check_docker
        echo -e "${GREEN}Opening MongoDB shell...${NC}"
        echo "Type 'exit' to quit"
        echo ""
        docker-compose exec mongo mongosh rescuebytes
        ;;
    
    mongo-ui)
        check_docker
        PUBLIC_IP=$(get_public_ip)
        
        echo -e "${GREEN}MongoDB Admin Interface (Mongo Express)${NC}"
        echo ""
        echo "URL: http://$PUBLIC_IP:8081"
        echo ""
        echo "Login Credentials:"
        echo "  Username: admin"
        echo "  Password: admin123"
        echo ""
        echo "Make sure port 8081 is open in your AWS Security Group!"
        echo ""
        echo "To change password, edit docker-compose.yml:"
        echo "  ME_CONFIG_BASICAUTH_USERNAME"
        echo "  ME_CONFIG_BASICAUTH_PASSWORD"
        echo ""
        ;;
    
    *)
        show_help
        ;;
esac
