# Food Ordering System - Cloud Native Microservices Application

A scalable, secure, and highly available **Food Ordering Platform** built using modern cloud computing principles for the Cloud Computing Module (EC7205), University of Ruhuna.

## 🚀 Live Demo (AWS EC2)
- **Main Application (API Gateway)**: [http://16.16.202.254](http://16.16.202.254)
- **User Service Health**: http://16.16.202.254/api/user/health
- **Restaurant Service Health**: http://16.16.202.254/api/restaurant/health
- **Order Service Health**: http://16.16.202.254/api/order/health
- **RabbitMQ Management**: http://16.16.202.254:15672 (username: `guest`, password: `guest`)

## Features
- Microservices Architecture (User, Restaurant, Order, Notification services)
- Synchronous communication via REST APIs with **Nginx API Gateway**
- Asynchronous communication using **RabbitMQ**
- MongoDB as the primary database
- Fully containerized with Docker & Docker Compose
- Deployed on AWS EC2
- Automated CI/CD Pipeline using GitHub Actions

## Tech Stack
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Message Queue**: RabbitMQ
- **API Gateway**: Nginx
- **Containerization**: Docker + Docker Compose
- **Cloud Platform**: AWS EC2
- **CI/CD**: GitHub Actions

## Local Deployment

### Prerequisites
- Docker and Docker Compose installed

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/Srimali-JayaweeraArachchi/Cloud_Computing_Project.git
   cd Cloud_Computing_Project

Start the full application:Bashdocker compose up -d --build
Access the application:
API Gateway: http://localhost
RabbitMQ UI: http://localhost:15672 (guest / guest)

Stop the application:Bashdocker compose down

Cloud Deployment (AWS EC2)

Launch a t3.micro Ubuntu 24.04 instance (Free Tier eligible)
Configure Security Group:
Port 22 (SSH) → My IP
Port 80 (HTTP) → Anywhere

Connect to the instance using SSH key (foodordering-key.pem)
Install Docker & Docker Compose on the server
Deploy the application:Bashdocker compose up -d --build

CI/CD Pipeline

GitHub Actions automatically builds the Docker images and deploys the application to AWS EC2 on every push to the main branch.
Workflow file: .github/workflows/deploy.yml

Architecture Overview

Clients → Nginx API Gateway → Microservices
Synchronous Communication: REST APIs
Asynchronous Communication: RabbitMQ (for order notifications)
All services are stateless and independently scalable

Scaling & High Availability

Horizontal scaling example:Bashdocker compose up --scale order-service=3 -d
Containers restart automatically on failure
Ready to be extended to AWS ECS/EKS with Auto Scaling Groups

Team Members


Deployment & DevOps: Srimali & [Your Teammate Name]


Submitted for
Module: Cloud Computing (EC7205)
University of Ruhuna
April 2026

```bash
