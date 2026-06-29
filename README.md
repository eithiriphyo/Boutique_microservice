# 🛍️ Boutique Microservices — Kubernetes DevOps Demo

A full-stack luxury e-commerce application built with microservices architecture, deployed on Kubernetes with Nginx Ingress.

---

## Architecture

```
Browser
   ↓
localhost:8080 (kubectl port-forward)
   ↓
Nginx Ingress Controller
   ↓
┌──────────────┬─────────────┬─────────────────┬
│              │             │                 │                      │
product-svc  cart-svc   payment-svc    notification-svc
  :3001        :3002        :3003              :3004

```

### Kubernetes Resources

| Resource | Count | Purpose |
|---|---|---|
| Deployments | 5 | One per service + frontend |
| Services | 5 | ClusterIP — internal routing |
| Ingress | 1 | Nginx — path-based routing |
| Ingress Controller | 1 | Nginx — handles all traffic |

---

## Project Structure

```
boutique-microservices/
└── manifests/
    ├── product-service/
    │   ├── deployment.yaml
    │   └── service.yaml
    ├── cart-service/
    │   ├── deployment.yaml
    │   └── service.yaml
    ├── payment-service/
    │   ├── deployment.yaml
    │   └── service.yaml
    ├── notification-service/
    │   ├── deployment.yaml
    │   └── service.yaml
    ├── frontend/
    │   ├── deployment.yaml
    │   └── service.yaml
    └── ingress.yaml
```

---

## Prerequisites

- Docker Desktop
- kind
- Node.js

---

##  Deployment Guide

### Step 1 — Create the Kind cluster

```bash
kind create cluster --name desktop
kubectl get nodes
```

Expected output:
```
NAME                    STATUS   ROLES           AGE   VERSION
desktop-control-plane   Ready    control-plane   1m    v1.34.x
desktop-worker          Ready    <none>          1m    v1.34.x
```

### Step 2 — Build and push Docker images

```bash
# Build all images
docker build -t eithiriphyo/product-service:v1.0      ./product-service
docker build -t eithiriphyo/cart-service:v1.0         ./cart-service
docker build -t eithiriphyo/payment-service:v1.0      ./payment-service
docker build -t eithiriphyo/notification-service:v1.0 ./notification-service
docker build -t eithiriphyo/boutique-frontend:v1.0    ./frontend

# Push to Docker Hub
docker push eithiriphyo/product-service:v1.0
docker push eithiriphyo/cart-service:v1.0
docker push eithiriphyo/payment-service:v1.0
docker push eithiriphyo/notification-service:v1.0
docker push eithiriphyo/boutique-frontend:v1.0
```

### Step 3 — Deploy all services to Kubernetes

```bash
kubectl apply -f manifests/product-service/
kubectl apply -f manifests/cart-service/
kubectl apply -f manifests/payment-service/
kubectl apply -f manifests/notification-service/
kubectl apply -f manifests/frontend/
```

### Step 4 — Install Nginx Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml

# Wait for controller to be ready
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=180s
```

### Step 5 — Apply Ingress routing rules

```bash
kubectl apply -f manifests/ingress.yaml
```

### Step 6 — Verify everything is running

```bash
kubectl get pods,services
```

### Step 7 — Access the application

```bash
# Run in a dedicated terminal — keep it open
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8080:80 &
```

Open Browser and verify **http://localhost:8080**

---

##  Tech Stack

- Runtime    -> Node.js 
- Containerisation -> Docker
- Image Registry -> Docker Hub
- Orchestration -> Kubernetes(Kind)
- Frontend -> HTML5, CSS3, JavaScript 

---


## 👩‍💻 Author

**Ei Thiri Phyo** — DevOps Engineer

[![GitHub](https://img.shields.io/badge/GitHub-eithiriphyo-181717?style=flat&logo=github)](https://github.com/eithiriphyo)
[![Docker Hub](https://img.shields.io/badge/Docker_Hub-eithiriphyo-2496ED?style=flat&logo=docker&logoColor=white)](https://hub.docker.com/u/eithiriphyo)

---

## 📄 License

MIT License — free to use as a reference for your own DevOps learning journey.
