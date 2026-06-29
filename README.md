# 🛍️ Boutique Microservices — DevOps Demo Project

A full-stack luxury e-commerce application built with microservices architecture, containerised with Docker, orchestrated with Kubernetes, and automated with a CI/CD pipeline using GitHub Actions.

> Built as a hands-on DevOps portfolio project following a phased approach — from local Docker Compose through to Kubernetes and CI/CD automation.

---

## 📐 Architecture Overview

```
Browser (index.html)
        ↓  localhost:8080
   port-forward
        ↓
   Nginx Ingress  (172.18.0.6)
        ↓
  ┌─────┬──────┬─────────┬──────────────┐
  │     │      │         │              │
:3001 :3002  :3003     :3004
product cart  payment  notification
service service service   service
```

### Services

| Service | Port | Responsibility | Tech |
|---|---|---|---|
| `product-service` | 3001 | Product catalogue | Node.js + Express |
| `cart-service` | 3002 | Cart session management | Node.js + Express |
| `payment-service` | 3003 | Payment processing (Stripe mock) | Node.js + Express |
| `notification-service` | 3004 | Order confirmation events | Node.js + Express |
| `frontend` | 80 | Luxury boutique UI | HTML + CSS + JS |

---

## 🗂️ Project Structure

```
boutique-microservices/
├── .github/
│   └── workflows/
│       └── ci-cd.yml              # GitHub Actions CI/CD pipeline
├── product-service/
│   ├── src/index.js
│   ├── Dockerfile
│   └── package.json
├── cart-service/
│   ├── src/index.js
│   ├── Dockerfile
│   └── package.json
├── payment-service/
│   ├── src/index.js
│   ├── Dockerfile
│   └── package.json
├── notification-service/
│   ├── src/index.js
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── index.html
│   └── Dockerfile
├── manifests/
│   ├── product-service/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── cart-service/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── payment-service/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── notification-service/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── frontend/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   └── ingress.yaml
└── docker-compose.yml
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | v20+ | Run services locally |
| Docker Desktop | Latest | Build and run containers |
| kubectl | Latest | Manage Kubernetes cluster |
| Kind | Latest | Local Kubernetes cluster |
| Git | Latest | Version control |

---

## 📦 Phase 1 — Local Development (Docker Compose)

Run all services locally with a single command.

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/boutique-microservices.git
cd boutique-microservices
```

### 2. Install dependencies for all services

```bash
cd product-service      && npm install && cd ..
cd cart-service         && npm install && cd ..
cd payment-service      && npm install && cd ..
cd notification-service && npm install && cd ..
```

### 3. Start all services

```bash
docker compose up --build
```

### 4. Verify all services are running

```bash
curl http://localhost:8080/health
curl http://localhost:8080/products
curl http://localhost:8080/cart/test-session
curl http://localhost:8080/notifications
```

### 5. Test the full payment flow

```bash
# Add item to cart
curl -X POST http://localhost:8080/cart/session-123/items \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"name":"Wireless Headphones","price":79.99,"quantity":1}'

# Process payment (success)
curl -X POST http://localhost:8080/payments/process \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"session-123","cardNumber":"4242424242424242","amount":79.99,"customerEmail":"test@example.com"}'

# Test declined card (any card ending in 0000)
curl -X POST http://localhost:8080/payments/process \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"session-123","cardNumber":"4111111111110000","amount":79.99,"customerEmail":"test@example.com"}'
```

---

## ☸️ Phase 2 — Kubernetes Deployment

Deploy the full stack to a local Kind Kubernetes cluster.

### 1. Create Kind cluster

```bash
kind create cluster --name boutique
```

### 2. Build and push Docker images

```bash
docker build -t YOUR_DOCKERHUB_USERNAME/product-service:v1.0      ./product-service
docker build -t YOUR_DOCKERHUB_USERNAME/cart-service:v1.0         ./cart-service
docker build -t YOUR_DOCKERHUB_USERNAME/payment-service:v1.0      ./payment-service
docker build -t YOUR_DOCKERHUB_USERNAME/notification-service:v1.0 ./notification-service
docker build -t YOUR_DOCKERHUB_USERNAME/boutique-frontend:v1.0    ./frontend

docker push YOUR_DOCKERHUB_USERNAME/product-service:v1.0
docker push YOUR_DOCKERHUB_USERNAME/cart-service:v1.0
docker push YOUR_DOCKERHUB_USERNAME/payment-service:v1.0
docker push YOUR_DOCKERHUB_USERNAME/notification-service:v1.0
docker push YOUR_DOCKERHUB_USERNAME/boutique-frontend:v1.0
```

### 3. Deploy all services

```bash
kubectl apply -f manifests/product-service/
kubectl apply -f manifests/cart-service/
kubectl apply -f manifests/payment-service/
kubectl apply -f manifests/notification-service/
kubectl apply -f manifests/frontend/
```

### 4. Install Nginx Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml

# Wait for it to be ready
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s
```

### 5. Apply the Ingress

```bash
kubectl apply -f manifests/ingress.yaml
```

### 6. Verify all pods are running

```bash
kubectl get pods,services
```

Expected output:
```
NAME                                        READY   STATUS    RESTARTS   AGE
pod/cart-service-xxx                        1/1     Running   0          5m
pod/notification-service-xxx               1/1     Running   0          5m
pod/payment-service-xxx                    1/1     Running   0          5m
pod/product-service-xxx                    1/1     Running   0          5m
pod/frontend-xxx                           1/1     Running   0          5m
```

### 7. Access the application

```bash
# Start port-forward (keep this terminal open)
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8080:80

# Open browser at http://localhost:8080
```

### 8. Test all routes

```bash
curl http://localhost:8080/products
curl http://localhost:8080/cart/test-session
curl http://localhost:8080/notifications

# Payment test
curl -X POST http://localhost:8080/payments/process \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"k8s-test","cardNumber":"4242424242424242","amount":99.99,"customerEmail":"test@example.com"}'
```

### Useful Kubernetes Commands

```bash
# Check pod logs
kubectl logs -l app=product-service --tail=50

# Describe a pod
kubectl describe pod -l app=product-service

# Execute into a pod
kubectl exec -it POD_NAME -- /bin/sh

# Rolling update after new image push
kubectl set image deployment/product-service \
  product-service=YOUR_USERNAME/product-service:latest

# Watch rollout status
kubectl rollout status deployment/product-service

# Rollback if something goes wrong
kubectl rollout undo deployment/product-service
```

---

## ⚙️ Phase 3 — CI/CD Pipeline (GitHub Actions)

Automatically builds and pushes Docker images to Docker Hub on every code push.

### Pipeline Flow

```
git push to main
      ↓
GitHub Actions detects which service changed
      ↓
Builds only the changed service image
      ↓
Pushes new image to Docker Hub
      ↓
Manual kubectl deploy locally
```

### Setup

#### 1. Add GitHub Secrets

Go to your repo → **Settings** → **Secrets and variables** → **Actions**

| Secret Name | Value |
|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Your Docker Hub Personal Access Token |

To create a Docker Hub token: `hub.docker.com` → Account Settings → Security → Personal Access Tokens → Generate New Token

#### 2. Pipeline triggers automatically on push

The pipeline only builds services that have changed:

```
# Change product-service code → only product-service image is rebuilt
# Change cart-service code    → only cart-service image is rebuilt
# Change multiple services    → only those services are rebuilt
```

#### 3. Manual trigger

Go to GitHub → **Actions** tab → **CI/CD — Boutique Microservices** → **Run workflow**

#### 4. Deploy after pipeline completes

```bash
# Update the deployment with the new image
kubectl set image deployment/product-service \
  product-service=YOUR_USERNAME/product-service:latest

kubectl rollout status deployment/product-service
```

---

## 🔑 Payment Testing

| Card Number | Result |
|---|---|
| `4242 4242 4242 4242` | ✅ Payment success |
| Any card ending in `0000` | ❌ Payment declined |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Services | Node.js, Express |
| Containerisation | Docker |
| Orchestration | Kubernetes (Kind) |
| Ingress | Nginx Ingress Controller |
| CI/CD | GitHub Actions |
| Image Registry | Docker Hub |
| Frontend | HTML, CSS, JavaScript |

---

## 📊 DevOps Concepts Demonstrated

- ✅ Microservices architecture — each service independently deployable
- ✅ Containerisation — Docker images for each service
- ✅ Container orchestration — Kubernetes deployments, services, ingress
- ✅ Health probes — liveness and readiness checks on every pod
- ✅ Resource management — CPU and memory requests/limits
- ✅ Service discovery — inter-service communication via Kubernetes DNS
- ✅ Rolling updates — zero-downtime deployments with `kubectl set image`
- ✅ Rollback — instant rollback with `kubectl rollout undo`
- ✅ CI/CD automation — GitHub Actions builds and pushes on every commit
- ✅ Path-based routing — Nginx Ingress routes traffic to correct services

---

## 👩‍💻 Author

**Ei Thiri Phyo**
DevOps Engineer in Training
[GitHub](https://github.com/YOUR_USERNAME) · [Docker Hub](https://hub.docker.com/u/eithiriphyo)

---

## 📄 License

MIT License — feel free to use this project as a reference for your own DevOps learning.
