# 🎟️ MarkMySeat — Full-Stack Movie Ticket Booking App

![MERN Stack](https://img.shields.io/badge/MERN-Stack-green)
![CI/CD](https://img.shields.io/badge/CI%2FCD-Jenkins%20%2B%20AWS-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

**MarkMySeat** is a complete movie ticket booking platform built with the **MERN stack**, secured using **JWT authentication**, powered by **Razorpay for payments**, and continuously deployed via **Jenkins on AWS EC2**. It offers real-time seat selection, payment verification, and booking history – all from a modern UI. 🎬✨

---

## 🚀 Live Demo

🔗 **[MarkMySeat is Live](http://your-ec2-domain-or-ip)**  
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
├── client/             # React frontend (TypeScript)
│   └── .env            # Razorpay Key ID
├── server/             # Express backend
│   └── .env            # MongoDB, Razorpay Secret, JWT
├── Jenkinsfile         # Jenkins CI/CD pipeline
├── .gitignore
└── README.md

````

---

## 🧑‍💻 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/MarkMySeat.git
cd MarkMySeat
````

### 2. Setup Environment Variables

#### `/client/.env`

```env
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

#### `/server/.env`

```env
PORT=8080
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
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
* Jenkins pulls latest code and:

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
* MongoDB Atlas for DB

---

## 💳 Razorpay Integration

* Razorpay order created on backend
* Payment verified with signature (HMAC SHA256)
* Verified payment triggers booking API call
* Bookings and payments are stored securely in MongoDB

---

## 🔐 Security

* Passwords hashed with bcrypt
* JWT stored securely in localStorage
* Razorpay signature verification before confirming booking
* All secrets excluded via `.gitignore`

---

## 🧠 Future Enhancements

* 🛠️ Admin Panel for adding shows/movies/seats
* 📩 Email confirmation after successful booking
* 📊 Analytics dashboard for admin
* 📎 Downloadable e-tickets (PDF)
* 💬 Live support chat

---

## ✨ Developed By

**Akash Gupta**
💼 B.Tech CSE | Cloud & Full Stack Enthusiast
🌐 [GitHub](https://github.com/Akash-Gupta-dev)

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙌 Show Your Support

⭐ this repo to support the project
🛠️ Fork it to build your own version
📩 PRs are welcome to enhance features!

```

---

Let me know once you've committed this `README.md`, and I’ll guide you through pushing the code to GitHub and setting up Jenkins + AWS 🚀
```