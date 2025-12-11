# 🧛 DraculaStream

**DraculaStream** is a modern, distributed anime streaming platform built using a Microservices architecture. It runs on Kubernetes and features a sleek "Dracula" themed UI, HLS video streaming, and cross-domain authentication.

## 🚀 Architecture

The application is split into encapsulated microservices orchestrated by Kubernetes (K8s):

1.  **Main Service (Frontend):** Next.js App Router, serving the UI and communicating with other services.
2.  **Auth Service:** Next.js + BetterAuth, handling user sessions, OAuth, and managing the PostgreSQL database.
3.  **Anime API Service:** Consumet API (Node.js) used to scrape and serve anime data/video sources.
4.  **Database & Cache:** Stateful PostgreSQL for user data and Redis for API caching.
5.  **Gateway:** Nginx Ingress Controller managing routing between `dracula.com` and `auth.dracula.com`.

---

## 🛠️ Tech Stack

### Frontend & UI

- **Framework:** [Next.js 15](https://nextjs.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (Dracula Theme)
- **State Management:** Redux Toolkit (Client State) + TanStack Query (Server State)
- **Video Player:** HLS.js with Custom UI controls

### Backend & Services

- **Auth:** [BetterAuth](https://better-auth.com/)
- **API:** [Consumet](https://github.com/consumet/api.consumet.org)
- **ORM:** Prisma (v7)

### Infrastructure & DevOps

- **Containerization:** Docker (Multi-stage builds)
- **Orchestration:** Kubernetes (Minikube/Kind)
- **Ingress:** Nginx Ingress Controller
- **Databases:** PostgreSQL, Redis

---

## ✨ Features

- **Distributed Session Management:** Cookies are shared securely across `auth.dracula.com` and `dracula.com`.
- **Modern Video Player:**
  - Auto-quality selection based on bandwidth.
  - Subtitles (Soft sub) & Dubbing toggles.
  - Theater Mode & HLS streaming.
- **Reactive UI:**
  - Skeleton loaders for smooth UX.
  - Dark/Light mode support (Dracula Palette).
  - Responsive Sidebar and layouts.
- **Social Auth:** Google OAuth integration.

---

## 📝 Prerequisites

Before running the project locally, ensure you have:

- [Docker Desktop](https://www.docker.com/) (or Docker Engine)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

---

## ⚡ Installation & Setup

### 1. Host Configuration

Since this is a distributed system running locally, we need to map the domains to your Minikube cluster IP.

**Start Minikube Tunnel (Keep this terminal open):**

```bash
minikube tunnel
```

**Edit your hosts file** (Windows: `C:\Windows\System32\drivers\etc\hosts`, Mac/Linux: `/etc/hosts`):
Add the following lines (Use `127.0.0.1` if using Tunnel, or `minikube ip` otherwise):

```text
127.0.0.1 dracula.com
127.0.0.1 auth.dracula.com
```

### 2. Build Docker Images

We must build the images **inside** the Minikube environment so Kubernetes can see them.

```bash
# Point your terminal to Minikube's Docker daemon
eval $(minikube docker-env)

# Build the services
docker build -t myuser/auth-service:latest ./auth-service
docker build -t myuser/main-page:latest ./main-page
docker build -t myuser/consumet-api:latest ./consumet-api
```

### 3. Deploy to Kubernetes

Apply the configuration files in order.

```bash
# 1. Configs, Secrets, and Databases
kubectl apply -f k8s/config.yaml
kubectl apply -f k8s/postgres-storage.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml

# 2. Services
kubectl apply -f k8s/auth-deployment.yaml
kubectl apply -f k8s/consumet-deployment.yaml
kubectl apply -f k8s/main-deployment.yaml

# 3. Ingress Routing
kubectl apply -f k8s/ingress.yaml
```

### 4. Verify

Access the application at: **[http://dracula.com](http://dracula.com)**

---

## 🗺️ Roadmap & To-Do List

The following features are planned for the next development cycle:

- [ ] **Refine Signout Flow:** Ensure session cookies are cleared cleanly across both subdomains and the Redux state is reset instantly.
- [ ] **Watchlist Microservice:**
  - Create a dedicated microservice to handle user libraries.
  - Decouple watchlist state from the Main Page logic.
- [ ] **Comment System Microservice:**
  - **Architecture:** Event-driven architecture.
  - **Tech:** [Apache Kafka](https://kafka.apache.org/) for message queuing.
  - **Database:** [MongoDB](https://www.mongodb.com/) for storing comment trees/threads.
  - **Integration:** Real-time updates on the Watch Page.

---

## 🐛 Troubleshooting

**Changes not showing up?**
If you edited code, you must rebuild the image _inside_ minikube and restart the pod:

```bash
eval $(minikube docker-env)
docker build -t myuser/main-page:latest ./main-page
kubectl delete pod -l app=main-page
```

**Database errors?**
Check the init container logs to see if Prisma migrations failed:

```bash
kubectl logs -l app=auth-service -c init-db
```
