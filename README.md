# SmartCampusUNGE

Sistema de gestión inteligente para campus universitario (UNGE).

## 🚀 Requisitos
- Node.js >= 18
- PostgreSQL >= 14
- npm

## 📂 Estructura del proyecto

SmartCampusUNGE/
├── backend/        # API Node.js (Express + PostgreSQL)
├── frontend/       # Interfaz web (React/Vue/Angular)
├── db/             # Scripts SQL (schema.sql, inserts.sql)
├── image/          # Recursos gráficos
├── docs/           # Documentación
└── README.md       # Instrucciones del proyecto

## ⚙️ Configuración de la base de datos
1. Crear la base de datos en PostgreSQL:
```sql
CREATE DATABASE smartcampusunge;
psql -U piangel -d smartcampusunge -f db/schema.sql


cd backend
npm install


Configurar variables en .env:

Código
DB_USER=piangel
DB_PASS=piangel
DB_HOST=localhost
DB_NAME=smartcampusunge
DB_PORT=5432
PORT=4000node

 server.js

cd frontend
npm install
