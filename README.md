# 🎟️ MarkMySeat — Full-Stack Movie Ticket Booking App

![MERN Stack](https://img.shields.io/badge/MERN-Stack-green)
![Architecture](https://img.shields.io/badge/System--Design-Diagram-blueviolet)
![CI/CD](https://img.shields.io/badge/CI%2FCD-Jenkins%20%2B%20AWS-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

**MarkMySeat** is a complete movie ticket booking platform built with the **MERN stack**, secured using **JWT authentication**, powered by **Razorpay for payments**, and continuously deployed via **Jenkins on AWS EC2**. It offers real-time seat selection, payment verification, and booking history – all from a modern UI. 🎬✨

---

## 🚀 Live Demo

🔗 **[MarkMySeat is Live](http://51.21.27.2)**  
_📦 Deployed using Jenkins CI/CD on AWS EC2 with Nginx and PM2_

---

## 🔥 Features

- ✅ Secure User Authentication (JWT)
- ✅ Dynamic Show & Movie Listings
- ✅ 🎟️ Real-Time Seat Selection (max 8)
- ✅ Razorpay Integrated Payment Gateway
- ✅ Payment Signature Verification
- ✅ Booking History for Users
- ✅ CI/CD Pipeline using Jenkins + GitHub + AWS
- 🛠️ Admin Panel (Coming Soon...)

---

## 🛠 Tech Stack

| Frontend                | Backend               | DevOps & Cloud             |
|-------------------------|------------------------|-----------------------------|
| React + TypeScript      | Node.js, Express       | AWS EC2, Jenkins, PM2, Nginx |
| Tailwind CSS            | MongoDB                | GitHub Webhooks, Razorpay   |

---

## 📂 Folder Structure

```

MarkMySeat/
├── client/                         # React frontend (TypeScript)
│   └── .env                        # Razorpay Key ID
├── docs/                           # Documentations
│   └── markmyseat-architecture.png # Architecture Diagram
├── server/                         # Express backend
│   └── .env                        # MongoDB, Razorpay Secret, JWT
├── Jenkinsfile                     # Jenkins CI/CD pipeline
├── .gitignore
└── README.md

````

---

## 🧑‍💻 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/akashgupta-git/MarkMySeat.git
cd MarkMySeat
````

### 2. Setup Environment Variables

#### `/client/.env`

```env
VITE_RAZORPAY_KEY_ID=rzp_test_abc123xyz
```

#### `/server/.env`

```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=supersecurejwtkey
RAZORPAY_KEY_ID=rzp_test_abc123xyz
RAZORPAY_KEY_SECRET=secretkey987xyz
```

### 3. Install Dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### 4. Start Locally

```bash
# Backend
cd server
npm start

# Frontend
cd ../client
npm run dev
```

---

## ☁️ Jenkins + AWS CI/CD ✅

### CI/CD Pipeline Overview

* GitHub Repo Push ➝ Jenkins Webhook
* Jenkins pulls the latest code and:

  * Installs dependencies
  * Runs backend & frontend builds
  * Restarts PM2
* Nginx serves frontend from build folder
* PM2 runs backend as a service

### Server Stack

* Ubuntu EC2 Instance (t2.micro)
* Jenkins (Port 8080)
* Nginx (Port 80 for frontend, reverse proxy)
* PM2 (Manages backend process)
* MongoDB Atlas (Database)

---

## 💳 Razorpay Integration

* Razorpay order created on backend
* Payment verified using HMAC SHA256 signature
* Verified payment triggers booking API
* Booking and payment stored securely in MongoDB

---

## 🔐 Security

* Passwords hashed using bcrypt
* JWT stored securely in localStorage
* Razorpay signature verification before finalizing booking
* All secrets excluded via `.gitignore`

---

## 🧠 Future Enhancements

* 🛠️ Admin Panel for adding shows/movies/seats
* 📩 Email confirmation after successful booking
* 📊 Admin Analytics Dashboard
* 📎 Downloadable E-Tickets (PDF)
* 💬 Live Support Chat

---

## 🏗️ System Architecture

MarkMySeat follows a scalable and modular MERN-based architecture optimized for real-time booking, secure payments, and robust cloud deployment.

![System Architecture Diagram](docs/markmyseat-architecture.png)

### 🔹 Overview:

* **Frontend (React + TypeScript + Tailwind)**

  * Handles routing, seat selection, booking flow
  * Uses Context API and `ProtectedRoutes` for auth-secured views
  * Communicates with backend using Axios

* **Backend (Node.js + Express + MongoDB)**

  * Stateless JWT-based authentication
  * REST APIs for login, registration, shows, and bookings
  * Validates seat selection and creates bookings
  * Admin-only routes for managing shows and seat maps

* **Payments (Razorpay)**

  * Frontend initiates payment; server creates order
  * Backend verifies signature before saving booking

* **Deployment (Jenkins + AWS + Nginx + PM2)**

  * Jenkins pulls latest code and rebuilds on each push
  * Nginx reverse proxies frontend and backend
  * PM2 keeps backend always running

📁 Diagram stored at `/docs/markmyseat-architecture.png`.

---

## ✨ Developed By

**Akash Gupta**
💼 B.Tech CSE | Cloud & Full Stack Enthusiast
🌐 [GitHub](https://github.com/akashgupta-git)

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙌 Show Your Support

⭐ Star this repo to support the project
🛠️ Fork it to build your own version
📩 PRs are welcome to enhance features!
