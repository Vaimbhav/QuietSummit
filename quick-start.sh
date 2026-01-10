#!/bin/bash

# QuietSummit Quick Start Script
# This script helps you get the development environment running quickly

echo "🌄 QuietSummit Quick Start"
echo "=========================="
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    exit 1
fi

echo "✅ pnpm found"
echo ""

# Setup Frontend
echo "📦 Setting up Frontend..."
cd frontend

if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit frontend/.env with your configuration"
fi

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    pnpm install
else
    echo "✅ Frontend dependencies already installed"
fi

cd ..

# Setup Backend
echo ""
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your MongoDB URI and other secrets"
fi

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    pnpm install
else
    echo "✅ Backend dependencies already installed"
fi

# Create logs directory
if [ ! -d "logs" ]; then
    mkdir logs
    echo "✅ Created logs directory"
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Configure backend/.env with your MongoDB URI"
echo "2. Start the backend: cd backend && pnpm dev"
echo "3. Start the frontend: cd frontend && pnpm dev"
echo ""
echo "🚀 Frontend will run on: http://localhost:5173"
echo "🚀 Backend will run on: http://localhost:5000"
echo ""
echo "Happy coding! 🌲"
