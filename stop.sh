#!/bin/bash
echo "Arrêt des services Spring Boot et React..."
fuser -k 8080/tcp 2>/dev/null || true
fuser -k 5174/tcp 2>/dev/null || true
pkill -f "spring-boot:run" || true
pkill -f "vite" || true
echo "✅ Tous les services ont été arrêtés."