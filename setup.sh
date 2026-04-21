#!/bin/bash

# ============================================================
# ClinicCraft - Quick Start Script
# ============================================================

echo ""
echo "🏥 ClinicCraft - Clinic Website Builder"
echo "========================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ required. Current: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client (psql) not found in PATH."
    echo "   Please ensure PostgreSQL is installed and running."
fi

echo ""
echo "📦 Installing backend dependencies..."
cd backend && npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend npm install failed"
    exit 1
fi

echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend npm install failed"
    exit 1
fi

cd ..

# Check .env
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo ""
    echo "⚠️  Created backend/.env from .env.example"
    echo "   Please edit backend/.env with your PostgreSQL credentials!"
    echo ""
    echo "   Required settings:"
    echo "   DB_PASSWORD=your_postgres_password"
    echo "   JWT_SECRET=any-long-random-string"
fi

echo ""
echo "============================================================"
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Edit backend/.env with your database credentials"
echo ""
echo "2. Create the database:"
echo "   psql -U postgres -c 'CREATE DATABASE clinic_builder;'"
echo ""
echo "3. Run the schema:"
echo "   psql -U postgres -d clinic_builder -f database/schema.sql"
echo ""
echo "4. Start the backend (Terminal 1):"
echo "   cd backend && npm run dev"
echo ""
echo "5. Start the frontend (Terminal 2):"
echo "   cd frontend && npm run dev"
echo ""
echo "6. Open: http://localhost:5173"
echo "============================================================"
echo ""
