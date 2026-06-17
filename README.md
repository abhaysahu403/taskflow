# ⚡ TaskFlow — Full-Stack Task Management System

> A production-ready, Kubernetes-native task management application built with React, Node.js, MySQL, and Redis. Designed as a complete learning platform for mastering Kubernetes from basics to advanced concepts.

[![Kubernetes Ready](https://img.shields.io/badge/Kubernetes-Ready-326CE5?logo=kubernetes)](https://kubernetes.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docker.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://mysql.com)

---

## 📋 Project Architecture

```
┌─────────────────────────────────────────────────┐
│                   INTERNET                       │
└─────────────────┬───────────────────────────────┘
                  │
         ┌────────▼────────┐
         │  Nginx Ingress  │  (Port 80/443)
         └────────┬────────┘
          ┌───────┴────────┐
          │                │
  ┌───────▼──────┐  ┌──────▼──────┐
  │   Frontend   │  │   Backend   │
  │  React/Vite  │  │  Express.js │
  │   Port: 80   │  │  Port: 5000 │
  └──────────────┘  └──────┬──────┘
                     ┌─────┴─────┐
              ┌──────▼───┐  ┌────▼────┐
              │  MySQL   │  │  Redis  │
              │  8.0     │  │  Cache  │
              │ Port 3307│  │Port 6379│
              └──────────┘  └─────────┘

  Host Ports (Docker Compose):
  • Frontend:  http://localhost:3000
  • Backend:   http://localhost:5001
  • MySQL:     localhost:3307
  • Redis:     localhost:6379
```

---

## 🚀 Tech Stack

| Layer       | Technology          | Version |
|-------------|---------------------|---------|
| Frontend    | React + Vite        | 18 / 5  |
| Backend     | Node.js + Express   | 20 / 4  |
| Database    | MySQL               | 8.0     |
| Cache       | Redis               | 7       |
| Container   | Docker + Compose    | Latest  |
| Orchestration | Kubernetes        | 1.29+   |

---

## 📁 Folder Structure

```
taskflow/
├── frontend/                  # React + Vite application
│   ├── src/
│   │   ├── components/        # Layout, shared UI
│   │   ├── pages/             # Dashboard, Tasks, Products, Users
│   │   ├── hooks/             # useAuth (React Context)
│   │   └── utils/             # Axios API client
│   ├── Dockerfile             # Multi-stage: Node build → Nginx serve
│   ├── nginx.conf             # SPA + API proxy config
│   └── vite.config.js
│
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── config/            # database.js, redis.js
│   │   ├── middleware/        # auth.js (JWT)
│   │   ├── routes/            # users.js, login.js, products.js, tasks.js
│   │   └── index.js           # Entry point
│   └── Dockerfile             # Multi-stage Node build
│
├── mysql-init/
│   └── 01-init.sql            # Schema + seed data
│
├── k8s/                       # Kubernetes manifests (manual deployment)
│   ├── 00-namespace.yaml
│   ├── 01-configmap-secret.yaml
│   ├── 02-storage.yaml        # PV + PVC + StorageClass
│   ├── 03-mysql.yaml
│   ├── 04-redis.yaml
│   ├── 05-backend.yaml        # Deployment + Service + HPA
│   ├── 06-frontend.yaml       # Deployment + Service + HPA
│   └── 07-ingress.yaml
│
├── taskflow-chart/            # Helm Chart (recommended deployment)
│   ├── Chart.yaml             # Chart metadata
│   ├── values.yaml            # Configurable values
│   └── templates/             # Kubernetes manifest templates
│       ├── configmap.yaml
│       ├── secret.yaml
│       ├── pvc.yaml
│       ├── mysql.yaml
│       ├── redis.yaml
│       ├── backend.yaml
│       ├── frontend.yaml
│       ├── frontend-config.yaml
│       └── ingress.yaml
│
├── docker-compose.yml         # Local development
├── HELM_DEPLOYMENT_SUMMARY.md # Helm troubleshooting guide
└── README.md
```

---

## 🌐 API Endpoints

| Method | Endpoint              | Auth | Description          |
|--------|-----------------------|------|----------------------|
| POST   | /api/login            | No   | Sign in              |
| POST   | /api/login/register   | No   | Register new user    |
| GET    | /api/login/me         | Yes  | Get current user     |
| GET    | /api/users            | Yes  | List all users       |
| GET    | /api/users/:id        | Yes  | Get user by ID       |
| PUT    | /api/users/:id        | Yes  | Update user          |
| DELETE | /api/users/:id        | Yes  | Delete user (admin)  |
| GET    | /api/products         | Yes  | List products        |
| POST   | /api/products         | Yes  | Create product       |
| PUT    | /api/products/:id     | Yes  | Update product       |
| DELETE | /api/products/:id     | Yes  | Delete product       |
| GET    | /api/tasks            | Yes  | List my tasks        |
| POST   | /api/tasks            | Yes  | Create task          |
| PUT    | /api/tasks/:id        | Yes  | Update task          |
| PATCH  | /api/tasks/:id/status | Yes  | Update task status   |
| DELETE | /api/tasks/:id        | Yes  | Delete task          |
| GET    | /api/tasks/stats/summary | Yes | Task statistics   |
| GET    | /health               | No   | Health check         |

---

## ⚙️ Environment Variables

### Backend
| Variable        | Description            | Default       |
|-----------------|------------------------|---------------|
| PORT            | Server port            | 5000          |
| MYSQL_HOST      | MySQL hostname         | localhost     |
| MYSQL_PORT      | MySQL port             | 3306          |
| MYSQL_USER      | MySQL user             | —             |
| MYSQL_PASSWORD  | MySQL password         | —             |
| MYSQL_DATABASE  | Database name          | taskflow_db   |
| REDIS_HOST      | Redis hostname         | localhost     |
| REDIS_PORT      | Redis port             | 6379          |
| JWT_SECRET      | JWT signing secret     | —             |
| JWT_EXPIRES_IN  | JWT expiry             | 7d            |
| FRONTEND_URL    | CORS allowed origin    | *             |

### Frontend
| Variable       | Description         | Default              |
|----------------|---------------------|----------------------|
| VITE_API_URL   | Backend API URL     | (empty = same origin)|

---

## 🛠️ Running Locally

### Option 1 — Docker Compose (Recommended)

```bash
# Clone and start everything
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
docker compose up --build

# App runs at:
# Frontend → http://localhost:3000
# Backend  → http://localhost:5001
# MySQL    → localhost:3307
# Redis    → localhost:6379
# Health   → http://localhost:5001/health
```

### Option 2 — Manual (Development)

```bash
# 1. Start MySQL and Redis (Docker)
docker run -d --name mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=taskflow_db \
  -e MYSQL_USER=taskflow_user \
  -e MYSQL_PASSWORD=taskflow_password \
  -p 3307:3306 mysql:8.0

docker run -d --name redis -p 6379:6379 redis:7-alpine

# 2. Backend
cd backend
cp .env.example .env   # Edit values (use MYSQL_PORT=3307)
npm install
npm run dev            # http://localhost:5001

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env   # Set VITE_API_URL=http://localhost:5001
npm install
npm run dev            # http://localhost:3000
```

### Demo Credentials
| Role  | Email                 | Password  |
|-------|-----------------------|-----------|
| Admin | admin@taskflow.dev    | demo1234  |
| User  | demo@taskflow.dev     | demo1234  |
| User  | jane@taskflow.dev     | demo1234  |

> ⚠️ **Security Note:** The credentials in this repository are for **demo/development purposes only**. In production:
> - Use Kubernetes Secrets with encryption at rest
> - Use external secret management (Vault, AWS Secrets Manager, etc.)
> - Never commit real credentials to version control
> - Use strong, randomly generated passwords
> - Enable network policies and RBAC

---

## 🎯 Helm Deployment (Recommended)

### Why Helm?
Helm is the package manager for Kubernetes. Instead of managing 10+ YAML files manually, Helm:
- Packages all resources into a single chart
- Enables version control and rollback
- Makes environment-specific deployments easy
- Industry standard for production Kubernetes

### Quick Start with Helm

```bash
# 1. Create namespace
kubectl create namespace taskflow-helm

# 2. Install the chart
cd taskflow-chart
helm install taskflow . -n taskflow-helm

# 3. Check status
helm status taskflow -n taskflow-helm
kubectl get all -n taskflow-helm
```

### Helm Commands Reference

```bash
# Validate chart
helm lint .

# Preview manifests
helm template taskflow . -n taskflow-helm

# Install release
helm install taskflow . -n taskflow-helm

# Upgrade release
helm upgrade taskflow . -n taskflow-helm

# Rollback to previous version
helm rollback taskflow -n taskflow-helm

# Uninstall release
helm uninstall taskflow -n taskflow-helm

# List installed releases
helm list -n taskflow-helm
```

### Access Helm Deployment

Add to your hosts file (`C:\Windows\System32\drivers\etc\hosts` or `/etc/hosts`):
```
127.0.0.1  taskflow-helm.local
```

Then access:
- Frontend: http://taskflow-helm.local
- Backend API: http://taskflow-helm.local/api

---

## ☸️ Kubernetes Deployment (Manual YAML)

### Step 1 — Create KIND cluster
```bash
kind create cluster --name taskflow
kubectl cluster-info --context kind-taskflow
```

### Step 2 — Apply manifests in order
```bash
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-configmap-secret.yaml
kubectl apply -f k8s/02-storage.yaml
kubectl apply -f k8s/03-mysql.yaml
kubectl apply -f k8s/04-redis.yaml
kubectl apply -f k8s/05-backend.yaml
kubectl apply -f k8s/06-frontend.yaml
kubectl apply -f k8s/07-ingress.yaml
```

### Step 3 — Verify
```bash
kubectl get all -n taskflow
kubectl get pvc -n taskflow
kubectl get ingress -n taskflow
```

### Step 4 — Access
```bash
# Port-forward frontend
kubectl port-forward svc/frontend-service 3000:80 -n taskflow

# Port-forward backend
kubectl port-forward svc/backend-service 5001:5000 -n taskflow

# Access at:
# Frontend: http://localhost:3000
# Backend:  http://localhost:5001
```

---

## 🎯 Kubernetes Learning Roadmap

This project covers every concept:

| Step | Concept            | File/Command                    |
|------|--------------------|---------------------------------|
| 1    | Namespace          | `k8s/00-namespace.yaml`         |
| 2    | Deployments        | `k8s/03-mysql.yaml` etc.        |
| 3    | ClusterIP Services | All service definitions         |
| 4    | ConfigMaps/Secrets | `k8s/01-configmap-secret.yaml`  |
| 5    | PV/PVC/StorageClass| `k8s/02-storage.yaml`           |
| 6    | Ingress            | `k8s/07-ingress.yaml`           |
| 7    | Helm Chart         | `taskflow-chart/`               |
| 8    | HPA                | Inside `05-backend.yaml`        |
| 9    | Prometheus/Grafana | Add monitoring stack            |
| 10   | ArgoCD             | GitOps deployment               |

---

## 📊 Kubernetes Deployment Readiness Score: 9/10

| Criteria                    | Status |
|-----------------------------|--------|
| Dockerfiles present         | ✅     |
| docker-compose.yml          | ✅     |
| No hardcoded secrets        | ✅     |
| Environment variable based  | ✅     |
| Health check endpoints      | ✅     |
| Persistent storage ready    | ✅     |
| Kubernetes manifests        | ✅     |
| HPA configured              | ✅     |
| Ingress configured          | ✅     |
| Multi-stage Docker builds   | ✅     |

---

## 👨‍💻 About This Project

**TaskFlow** was built as a portfolio project to demonstrate full-stack development skills and DevOps/Kubernetes expertise. It showcases:

- **Frontend**: Modern React with hooks, context API, React Router, Axios
- **Backend**: RESTful API design, JWT authentication, Redis caching
- **Database**: MySQL with relational schema, foreign keys, migrations
- **DevOps**: Multi-stage Docker builds, docker-compose, Kubernetes manifests
- **Security**: Environment-variable secrets, JWT, bcrypt password hashing
- **Architecture**: Microservices-friendly design, stateless backend, persistent DB

---

*Built with ❤️ for learning Kubernetes*
