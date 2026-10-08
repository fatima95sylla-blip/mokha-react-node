#!/bin/bash

echo "=========================================="
echo "  Démarrage de l'application Fullstack    "
echo "=========================================="

# 1. Démarrer le Backend (Spring Boot) en arrière-plan
echo "[1/2] Lancement du Backend (Spring Boot)..."
cd backend  # Adapte si ton dossier a un autre nom
./mvnw.cmd spring-boot:run &
BACKEND_PID=$!
cd ..

# Petite pause pour laisser respirer le backend
sleep 5

# 2. Démarrer le Frontend (React / Vite sur le port 5174)
echo "[2/2] Lancement du Frontend (React)..."
cd frontend  # Adapte si ton dossier a un autre nom
npm run dev -- --port 5174 &
FRONTEND_PID=$!
cd ..

echo "=========================================="
echo "🚀 Application lancée !"
echo "=========================================="

wait