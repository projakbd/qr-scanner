# Full-Stack QR/Barcode Scanner PWA

A professional, high-performance web application built for seamless QR code and barcode scanning. Features an offline-first architecture, background sync, and a production-ready cloud deployment pipeline.

## 🚀 Tech Stack

### Backend
- **Framework**: [AdonisJS 7](https://docs.adonisjs.com/) (Node.js)
- **Database**: PostgreSQL (AWS RDS)
- **Validation**: VineJS
- **ORM**: Lucid
- **Auth**: Token-based Authentication

### Frontend
- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **UI**: Tailwind CSS (Lucide Icons)
- **Charts**: Recharts
- **PWA**: `vite-plugin-pwa` (Service Workers and background sync)
- **State**: React Hooks + Context API

### Infrastructure & DevOps
- **Backend Deployment**: AWS EC2 (Ubuntu 24.04 LTS) + Docker
- **Reverse Proxy**: Nginx with Let's Encrypt SSL
- **Frontend Deployment**: Vercel
- **CI/CD**: GitHub Actions
- **Containerization**: Docker & Docker Compose

---

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js 24+
- Docker & Docker Compose
- PostgreSQL (Local or RDS)

### 2. Backend Setup
1. CD into the `backend/` directory.
2. Install dependencies: `npm install`
3. Create `.env` from `.env.example`: `cp .env.example .env`
4. Generate APP_KEY: `node ace generate:key`
5. Run migrations: `node ace migration:run`
6. Start dev server: `npm run dev`

### 3. Frontend Setup
1. CD into the `frontend/` directory.
2. Install dependencies: `npm install`
3. Create `.env` with `VITE_API_URL=http://localhost:8000`
4. Start dev server: `npm run dev`

---

## 🌍 Environment Variables

### Backend (`backend/.env`)
- `PORT`: Server port (default 8000)
- `HOST`: Server host (default localhost)
- `NODE_ENV`: `development` or `production`
- `APP_KEY`: Secret key for hashing
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`: PostgreSQL connection
- `LIMITER_STORE`: `database` (Required for rate limiting)

### Frontend (`frontend/.env`)
- `VITE_API_URL`: The URL of the backend API (e.g., `https://api.yourdomain.com`)

---

## 🚢 Deployment (Production)

### CI/CD Secrets
Add the following secrets to your GitHub repository:

#### Backend
- `AWS_EC2_IP`: IP of your EC2 instance.
- `AWS_SSH_KEY`: Private SSH key for EC2.
- `GITHUB_TOKEN`: Provided by GitHub Actions.

#### Frontend
- `VERCEL_TOKEN`: Vercel Personal Access Token.
- `VERCEL_ORG_ID`: Vercel Organization ID.
- `VERCEL_PROJECT_ID`: Vercel Project ID.
- `VITE_API_URL`: Production backend URL.

### EC2 Preparation
1. Clone the repo to `/home/ubuntu/app` on your EC2.
2. Create `backend/.env` with production RDS credentials.
3. Ensure Docker and Docker Compose are installed.
4. CI/CD will automatically build the Docker image and deploy it on push to `main`.

---

## 📱 PWA Features
- **Offline Mode**: Access recent scans and analytics without internet.
- **Background Sync**: Scans performed offline are automatically uploaded once back online.
- **Installable**: Add to home screen on iOS and Android.

---

## 📄 License
MIT
