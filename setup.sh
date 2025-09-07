#!/bin/bash

echo "🎮 VYRAL Setup Script 🎮"
echo "=========================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 16+ first.${NC}"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed. Please install PostgreSQL first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Install root dependencies
echo -e "${BLUE}📦 Installing root dependencies...${NC}"
npm install

# Install server dependencies
echo -e "${BLUE}📦 Installing server dependencies...${NC}"
cd server
npm install
cd ..

# Install client dependencies
echo -e "${BLUE}📦 Installing client dependencies...${NC}"
cd client
npm install
cd ..

# Set up environment files
echo -e "${BLUE}⚙️ Setting up environment files...${NC}"

# Server .env
if [ ! -f server/.env ]; then
    cp server/.env.example server/.env
    echo -e "${YELLOW}📝 Created server/.env from example. Please update with your database credentials.${NC}"
fi

# Client .env
if [ ! -f client/.env ]; then
    cp client/.env.example client/.env
    echo -e "${YELLOW}📝 Created client/.env from example.${NC}"
fi

# Database setup instructions
echo -e "${YELLOW}"
echo "🗄️ Database Setup Required:"
echo "1. Create a PostgreSQL database called 'vyral_db'"
echo "2. Update the DATABASE_URL in server/.env"
echo "3. Run: npm run seed (to create tables and add sample data)"
echo ""
echo "Example DATABASE_URL:"
echo "DATABASE_URL=postgresql://username:password@localhost:5432/vyral_db"
echo -e "${NC}"

# JWT Secret generation
if grep -q "your-super-secret-jwt-key" server/.env 2>/dev/null; then
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-super-secret-jwt-key-make-it-long-and-random/$JWT_SECRET/" server/.env
    else
        # Linux
        sed -i "s/your-super-secret-jwt-key-make-it-long-and-random/$JWT_SECRET/" server/.env
    fi
    echo -e "${GREEN}✅ Generated secure JWT secret${NC}"
fi

echo -e "${GREEN}"
echo "🎉 VYRAL Setup Complete!"
echo ""
echo "Next Steps:"
echo "1. Set up your PostgreSQL database"
echo "2. Update server/.env with your database credentials"
echo "3. Run: npm run seed (to initialize database)"
echo "4. Run: npm run dev (to start both server and client)"
echo ""
echo "The app will be available at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:5000"
echo ""
echo "Demo Account:"
echo "- Email: alex@vyral.com"
echo "- Password: password123"
echo -e "${NC}"

echo -e "${BLUE}🚀 Ready to go VYRAL!${NC}"