# 🍕 Food Ordering System - Cloud Native Microservices Application

A scalable, secure, and highly available **Food Ordering Platform** built using modern cloud
computing principles for the Cloud Computing Module (EC7205), University of Ruhuna.

---

## 🌐 Live Demo (AWS EC2)

| Service | URL |
|---|---|
| Main Application | http://16.170.217.98 |
| Health Check | http://16.170.217.98/health |
| RabbitMQ Management | http://16.170.217.98:15672 |

> RabbitMQ credentials: username `guest` / password `guest`

---

## 📌 Features

- ✅ Microservices Architecture (User, Restaurant, Order, Notification services)
- ✅ Synchronous communication via REST APIs through **Nginx API Gateway**
- ✅ Asynchronous communication using **RabbitMQ** (order notifications)
- ✅ **Load Balancing** using Nginx `least_conn` algorithm
- ✅ Separate **MongoDB Atlas** databases per microservice
- ✅ JWT Authentication with Role-Based Access Control
- ✅ Fully containerized with **Docker & Docker Compose**
- ✅ Deployed on **AWS EC2** (Ubuntu 24.04)
- ✅ Automated **CI/CD Pipeline** using GitHub Actions
- ✅ High availability with automatic container restart policies

---

## 🏗️ Architecture Overview

```
Browser / Mobile Client
        ↓
Nginx API Gateway (Port 80) ← Load Balancer (least_conn)
        ↓
┌─────────────────────────────────────────────┐
│  user-service         :8001                 │
│  restaurant-service   :8002                 │
│  order-service        :8003                 │
│  notification-service :8004                 │
└─────────────────────────────────────────────┘
        ↓                        ↓
  MongoDB Atlas             RabbitMQ
  (separate DB              (async messaging)
   per service)
```

**Communication Methods:**
- **Synchronous**: REST APIs via Nginx gateway (user, restaurant, order)
- **Asynchronous**: RabbitMQ message queue (order → notification service)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (cloud, separate DB per service) |
| Message Queue | RabbitMQ |
| API Gateway | Nginx (with load balancing) |
| Containerization | Docker + Docker Compose |
| Cloud Platform | AWS EC2 (Ubuntu 24.04, eu-north-1) |
| CI/CD | GitHub Actions |
| Security | JWT tokens, Role-Based Access Control |

---

## 🚀 Local Deployment

### Prerequisites

- Docker and Docker Compose installed
- Git installed

### Steps

**1. Clone the repository:**
```bash
git clone https://github.com/Srimali-JayaweeraArachchi/Cloud_Computing_Project.git
cd Cloud_Computing_Project
```

**2. Create the `.env` file in the root directory:**


**3. Start the full application:**
```bash
docker compose up -d --build
```

**4. Access the application:**

| Service | URL |
|---|---|
| Frontend | http://localhost |
| Health Check | http://localhost/health |
| RabbitMQ UI | http://localhost:15672 |
| User Service (direct) | http://localhost:8001 |
| Restaurant Service (direct) | http://localhost:8002 |
| Order Service (direct) | http://localhost:8003 |
| Notification Service (direct) | http://localhost:8004 |

**5. Stop the application:**
```bash
docker compose down
```

---

## ☁️ Cloud Deployment (AWS EC2)

### Step 1: Launch EC2 Instance
- AMI: Ubuntu 24.04 LTS
- Instance type: t3.micro (Free Tier eligible)
- Region: eu-north-1 (Stockholm)
- Key pair: Download `.pem` file during creation

### Step 2: Configure Security Group Inbound Rules

| Type | Protocol | Port | Source |
|---|---|---|---|
| SSH | TCP | 22 | 0.0.0.0/0 |
| HTTP | TCP | 80 | 0.0.0.0/0 |
| Custom TCP | TCP | 15672 | 0.0.0.0/0 |

### Step 3: Connect to EC2
```bash
ssh -i food-ordering-ec2-new.pem ubuntu@16.170.217.98
```

### Step 4: Install Docker on EC2
```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker ubuntu
newgrp docker
```

### Step 5: Clone and Deploy
```bash
git clone https://github.com/Srimali-JayaweeraArachchi/Cloud_Computing_Project.git food-ordering-app
cd food-ordering-app

docker compose up -d --build
```

### Step 6: Verify Deployment
```bash
docker compose ps
curl http://localhost/health
```

Expected output:
```
{"status":"healthy","gateway":"food-ordering-api"}
```

---

## 🔄 CI/CD Pipeline

GitHub Actions automatically deploys to AWS EC2 on every push to `main` branch.

**Workflow file:** `.github/workflows/deploy.yml`

### Pipeline Steps:
1. **Trigger** — push to `main` branch
2. **CI** — validate `docker-compose.yml` configuration
3. **CD** — SSH into EC2, pull latest code, recreate `.env`, rebuild and restart containers

### Required GitHub Secrets:

| Secret Name | Description |
|---|---|
| `EC2_HOST` | `16.170.217.98` |
| `SSH_PRIVATE_KEY` | Contents of `.pem` file |
| `MONGO_URI_USERS` | MongoDB Atlas URI for users DB |
| `MONGO_URI_RESTAURANT` | MongoDB Atlas URI for restaurant DB |
| `MONGO_URI_ORDERS` | MongoDB Atlas URI for orders DB |
| `JWT_SECRET` | JWT signing secret key |
| `RABBITMQ_URL` | `amqp://guest:guest@rabbitmq:5672` |

### How to Add Secrets:
1. Go to GitHub repo → **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add each secret from the table above

---

## ⚖️ Load Balancing

Nginx is configured with `least_conn` load balancing algorithm:

```nginx
upstream user_service {
    least_conn;
    server user-service:8001;
    # Add more instances to scale horizontally:
    # server user-service-2:8001;
    keepalive 32;
}
```

**To scale a service horizontally**, add one line to nginx upstream — no other changes needed anywhere in the system.

**Verify load balancing is working:**
```bash
# Health check
curl http://16.170.217.98/health

# Send 5 rapid requests to show load distribution
for i in 1 2 3 4 5; do echo "Request $i:"; curl -s -o /dev/null -w "Status: %{http_code} Time: %{time_total}s\n" http://16.170.217.98/api/restaurant/restaurants; done

# View live nginx access logs
docker logs foodordering-api-gateway --tail=20

# Show nginx upstream config
docker exec foodordering-api-gateway cat /etc/nginx/nginx.conf
```

---

## 🔒 Security Implementation

- **JWT Authentication** — all protected routes require valid JWT token
- **Role-Based Access Control** — `customer`, `restaurant_owner`, `admin` roles
- **API Gateway** — microservice ports (8001-8004) not publicly exposed, only accessible internally
- **Environment Variables** — secrets never hardcoded, injected via GitHub Actions Secrets
- **AWS Security Groups** — firewall allows only ports 22, 80, 15672

---

## 🗄️ Database Schemas

### Users DB (`users_db`)
```json
{
  "name": "string (required)",
  "email": "string (required, unique)",
  "password": "string (required, bcrypt hashed)",
  "role": "customer | restaurant_owner | admin",
  "createdAt": "date (auto)"
}
```

### Restaurant DB (`restaurant_db`)
```json
{
  "name": "string (required)",
  "ownerId": "ObjectId (ref: User)",
  "location": "string",
  "isApproved": "boolean (default: false)",
  "createdAt": "date (auto)"
}
```

### Menu Item Schema (`restaurant_db`)
```json
{
  "restaurantId": "ObjectId (ref: Restaurant)",
  "name": "string (required)",
  "price": "number (required)",
  "description": "string",
  "isAvailable": "boolean (default: true)"
}
```

### Orders DB (`orders_db`)
```json
{
  "userId": "ObjectId (ref: User)",
  "restaurantId": "ObjectId (ref: Restaurant)",
  "items": [
    {
      "menuItemId": "ObjectId",
      "name": "string",
      "price": "number",
      "quantity": "number"
    }
  ],
  "totalAmount": "number",
  "status": "pending | confirmed | preparing | delivered | cancelled",
  "createdAt": "date (auto)"
}
```

---

## 📦 Example Test Data & API Commands

### 1. Register a New User
```bash
curl -X POST http://16.170.217.98/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "email": "customer@test.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test Customer",
    "email": "customer@test.com",
    "role": "customer"
  }
}
```

### 2. Login
```bash
curl -X POST http://16.170.217.98/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123"
  }'
```

### 3. Get All Restaurants (Public)
```bash
curl http://16.170.217.98/api/restaurant/restaurants
```

Expected response:
```json
[
  {
    "_id": "69e999a07216084b063f29e3",
    "name": "Vito Pizza",
    "location": "Galle",
    "isApproved": true,
    "createdAt": "2026-04-23T04:01:36.668Z"
  },
  {
    "_id": "69e99e4d82e2974c8eff177b",
    "name": "Bing Chun",
    "location": "Galle",
    "isApproved": true,
    "createdAt": "2026-04-23T04:21:33.226Z"
  }
]
```

### 4. Get Restaurant Menu
```bash
curl http://16.170.217.98/api/restaurant/menu/69e999a07216084b063f29e3
```

### 5. Place an Order (requires JWT token)
```bash
# First login to get token
TOKEN=$(curl -s -X POST http://16.170.217.98/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"password123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Place order
curl -X POST http://16.170.217.98/api/orders/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "restaurantId": "69e999a07216084b063f29e3",
    "items": [
      {
        "menuItemId": "MENU_ITEM_ID",
        "name": "Margherita Pizza",
        "price": 12.99,
        "quantity": 2
      }
    ],
    "totalAmount": 25.98
  }'
```

### 6. Get Order History
```bash
curl http://16.170.217.98/api/orders/history \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📡 API Endpoints Reference

### Auth Service (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login and get JWT token |
| GET | `/api/auth/validate` | Authenticated | Validate JWT token |
| GET | `/api/auth/admin/users` | Admin only | Get all users |
| PUT | `/api/auth/admin/users/:userId/role` | Admin only | Update user role |

### Restaurant Service (`/api/restaurant`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/restaurant/restaurants` | Public | Get all approved restaurants |
| GET | `/api/restaurant/:restaurantId` | Public | Get single restaurant |
| POST | `/api/restaurant/register` | Restaurant owner | Register new restaurant |
| GET | `/api/restaurant/menu/:restaurantId` | Public | Get restaurant menu |
| POST | `/api/restaurant/menu` | Restaurant owner | Add menu item |
| GET | `/api/restaurant/admin/restaurants` | Admin only | Get all restaurants |
| PUT | `/api/restaurant/admin/restaurants/:id/approval` | Admin only | Approve restaurant |

### Order Service (`/api/orders`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/orders/` | Authenticated | Place new order |
| GET | `/api/orders/history` | Authenticated | Get order history |
| GET | `/api/orders/:orderId` | Authenticated | Get single order |
| GET | `/api/orders/restaurant/:restaurantId` | Restaurant owner | Get restaurant orders |
| PUT | `/api/orders/:orderId/status` | Restaurant owner/Admin | Update order status |
| GET | `/api/orders/admin/all` | Admin only | Get all orders |

---

## 🐳 Docker Services

| Container | Image | Port | Description |
|---|---|---|---|
| foodordering-api-gateway | nginx:alpine | 80 | Load balancer + API gateway |
| foodordering-frontend | custom build | 3000 | React frontend |
| foodordering-user-service | custom build | 8001 | Authentication service |
| foodordering-restaurant-service | custom build | 8002 | Restaurant management |
| foodordering-order-service | custom build | 8003 | Order processing |
| foodordering-notification-service | custom build | 8004 | Async notifications |
| foodordering-rabbitmq | rabbitmq:3-management | 5672, 15672 | Message broker |

---

## 👥 Team Members

| Name | Registration Number |
|---|---|
| Maduranganee J.A.S.M. | EG/2021/4661 |
| Perera M.A.J.C. | EG/2021/4711 |
| Samaranayaka D.A. | EG/2021/4773 |
| Tamasha A.P.D. | EG/2021/4823 |

---

## 📝 Submitted For

- **Module**: Cloud Computing (EC7205)
- **University**: University of Ruhuna, Faculty of Engineering
- **Semester**: 7
- **Deadline**: 28th April 2026
