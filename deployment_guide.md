# 🚀 QR Scanner Deployment Guide: Step-by-Step

This guide walks you through the manual steps required to set up your AWS infrastructure and connect it to the automated GitHub Actions pipeline.

---

## 🏗️ Step 1: AWS Infrastructure Setup

### 1.1 AWS RDS (PostgreSQL)
1. Go to **AWS RDS Console** -> **Create Database**.
2. Select **Standard Create** -> **PostgreSQL**.
3. Choose **Free Tier** (if applicable) or a production-sized instance.
4. **Settings**: Set `Master username` and `Master password`.
5. **Connectivity**: Ensure it's in a Security Group that allows inbound traffic on port `5432` from your EC2's IP.
6. Once created, copy the **Endpoint** URL.

### 1.2 AWS EC2 (Backend Server)
1. Launch an instance with **Ubuntu 24.04 LTS**.
2. **Security Groups**: Allow inbound traffic on:
   - `80` (HTTP)
   - `443` (HTTPS)
   - `22` (SSH - restricted to your IP)
3. Assign an **Elastic IP** to the instance so the address doesn't change on reboot.

---

## ⚙️ Step 2: EC2 Server Preparation

Connect to your EC2 via SSH and run the following:

### 2.1 Install Docker & Docker Compose
```bash
# Update and install Docker
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker ubuntu
# Log out and log back in for group changes to take effect
```

### 2.2 Prepare Application Directory
```bash
mkdir -p ~/app
cd ~/app
# Create the .env file (see Step 4)
```

---

## 🔐 Step 3: GitHub Secrets Configuration

Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions** and add:

| Secret Name | Value |
| :--- | :--- |
| `AWS_EC2_IP` | Your EC2 Elastic IP |
| `AWS_SSH_KEY` | Content of your `.pem` private key |
| `VERCEL_TOKEN` | Your Vercel API Token |
| `VERCEL_ORG_ID` | Your Vercel Organization ID |
| `VERCEL_PROJECT_ID` | Your Vercel Project ID |
| `VITE_API_URL` | `https://api.yourdomain.com` (Production API URL) |

---

## 📝 Step 4: Backend Environment Setup

On the EC2 server, create `~/app/.env` based on `backend/.env.production.example`:

```bash
# ~/app/.env
PORT=8000
HOST=0.0.0.0
NODE_ENV=production
APP_KEY= # Generate with 'node ace generate:key' locally
DB_HOST= # Your RDS Endpoint
DB_PORT=5432
DB_USER= # RDS Username
DB_PASSWORD= # RDS Password
DB_DATABASE= # RDS Database Name
```

---

## 🔒 Step 5: SSL/TLS Setup (Certbot)

1. **Point your domain** (e.g., `api.yourdomain.com`) to your EC2 IP.
2. On the EC2 server:
```bash
sudo apt install certbot
sudo certbot certonly --standalone -d api.yourdomain.com
```
3. Update `nginx.conf` in your local repo to use your actual domain in the SSL paths.

---

## 🚀 Step 6: Initial Deployment

1. **Push to GitHub**: Push your code to the `main` branch.
2. **Watch Actions**: Check the **Actions** tab in GitHub to see the build and deploy progress.
3. **Internal Sync**: The workflow will SSH into EC2, pull the Docker image, and run `docker compose up -d`.

---

## ✅ Step 7: Verification

1. Visit `https://api.yourdomain.com` (Should resolve or show a 404/JSON response from Adonis).
2. Open your Vercel deployment and test the Login/Scanner functionality.
3. Verify that scans are appearing in the History view (confirming RDS connection).

---

## 🛠️ Manual Maintenance Commands
- **View Logs**: `docker compose logs -f app`
- **Restart**: `docker compose restart`
- **Check Status**: `docker compose ps`
