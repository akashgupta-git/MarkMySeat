# 🎟️ MarkMySeat — Full-Stack Movie Ticket Booking Platform

![MERN Stack](https://img.shields.io/badge/MERN-Stack-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF)
![Express](https://img.shields.io/badge/Express-5.1-000000)
![MongoDB](https://img.shields.io/badge/MongoDB-8.16-47A248)
![Razorpay](https://img.shields.io/badge/Razorpay-Integrated-0C2451)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

**MarkMySeat** is a production-ready **BookMyShow-style** movie ticket booking platform built with the **MERN stack**. It features three separate portals — **User**, **Theatre Partner**, and **SuperAdmin** — each with dedicated authentication, dashboards, and capabilities.

The platform supports real-time interactive seat selection with configurable multi-screen layouts, food & beverage add-ons, Razorpay payment integration with server-side verification, QR-based e-tickets, and a comprehensive admin system for managing the entire ecosystem.

---

## 🌐 Live Demo

| Environment | URL |
|---|---|
| Frontend (Netlify) | [https://markmyseat.netlify.app](https://markmyseat.netlify.app) |
| Backend API (Render) | [https://markmyseat.onrender.com](https://markmyseat.onrender.com) |
| Database | MongoDB Atlas |

---

## ✨ Features at a Glance

### 🎬 User Portal
- **Movie Discovery** — Browse now-showing movies with search and genre filters (Action, Drama, Thriller, Comedy, Sci-Fi, Romance, Crime)
- **Interactive Seat Selection** — Real-time seat map with category-based pricing (Premium, Executive, Classic, etc.), aisle gaps, and up to 10 seats per booking
- **Multi-Screen Support** — Each theatre has multiple screens with independent seat configurations (IMAX, Standard, Small)
- **7-Day Date Picker** — Book shows for today through the next 7 days
- **Food & Beverage Add-ons** — Order popcorn, drinks, combos, and meals during checkout with per-theatre menus
- **Razorpay Payments** — Secure payment flow with server-side HMAC SHA256 signature verification
- **E-Ticket with QR Code** — Animated success page with confetti, downloadable e-ticket, and scannable QR code
- **Booking Management** — View booking history, see detailed e-tickets, cancel confirmed bookings
- **Profile Management** — Edit name, phone, and change password
- **QR Ticket Verification** — Public page for theatre staff to scan and verify tickets at entry

### 🎭 Theatre Partner Portal
- **Self-Registration** — Theatres register with name, email, city, address, and get instant access
- **Dashboard with 5 Tabs:**
  - **Overview** — Ticket revenue, food revenue, total bookings, recent activity
  - **Movies** — Full CRUD for movie listings with screen assignment, showtimes, poster URLs, cast, genre, language, duration
  - **Bookings** — View all theatre bookings, mark as "used" or cancel
  - **Food Menu** — Add/remove food items with categories (Popcorn, Beverage, Snack, Combo, Meal), veg/non-veg, pricing, images
  - **Screens** — Create and manage screens with custom seat layouts — configurable rows, seats per row, category names, row assignments, per-category pricing, and custom colors

### 🛡️ SuperAdmin Portal
- **Hidden Access** — No UI link; accessed directly via `/admin`
- **Dashboard with 5 Tabs:**
  - **Overview** — System-wide stats: total users, theatres, screens, movies, bookings (active/cancelled), ticket + food revenue, new users this month
  - **Users** — List, search, enable/disable, change roles, delete users (with self-protection)
  - **Theatres** — Approve/suspend theatres, view screen counts, delete with cascade cleanup
  - **Bookings** — Global bookings table with user, movie, theatre, date, seats, status, amount
  - **Movies** — Toggle active/inactive status for any movie system-wide

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 18.2** | Component-based UI framework |
| **TypeScript 5.3** | Type-safe development |
| **Vite 5.4** | Lightning-fast build tool & HMR dev server |
| **Tailwind CSS 3.4** | Utility-first styling with custom dark cinematic theme |
| **Framer Motion 11.2** | Smooth page transitions, stagger animations, and micro-interactions |
| **React Router 6.22** | Client-side routing with protected route guards |
| **Axios 1.7** | HTTP client with interceptors |
| **Context API** | Three separate auth contexts (User, Theatre, Admin) |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express 5.1** | HTTP server framework |
| **MongoDB** | NoSQL document database |
| **Mongoose 8.16** | MongoDB ODM with schemas, indexes, and population |
| **Redis** (`ioredis` 5.x) | In-memory store for atomic seat locking with 10-min TTL |
| **BullMQ** | Reliable job queue for async booking processing |
| **JWT** (`jsonwebtoken` 9.0) | Stateless authentication tokens |
| **bcryptjs 3.0** | Password hashing with salt rounds |
| **Razorpay SDK 2.9** | Payment order creation & signature verification |

### DevOps & Deployment

| Technology | Purpose |
|---|---|
| **Netlify** | Frontend hosting with CDN & auto-deploy |
| **Render** | Backend hosting with auto-deploy |
| **MongoDB Atlas** | Cloud-hosted database cluster |
| **Redis (Upstash/Render)** | Managed Redis for seat locking & job queues |
| **Concurrently** | Run server + client in parallel during development |
| **Nodemon** | Auto-restart server on file changes |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React + Vite)                    │
│                                                                  │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ User     │  │ Theatre      │  │ Admin                    │   │
│  │ Portal   │  │ Portal       │  │ Portal                   │   │
│  │          │  │              │  │                          │   │
│  │ • Browse │  │ • Movies     │  │ • Users management       │   │
│  │ • Book   │  │ • Screens    │  │ • Theatres management    │   │
│  │ • Pay    │  │ • Bookings   │  │ • Bookings overview      │   │
│  │ • E-Ticket│  │ • Food menu │  │ • Movies management      │   │
│  └────┬─────┘  └──────┬──────┘  └───────────┬──────────────┘   │
│       │                │                      │                  │
│  AuthContext     TheatreContext          AdminContext             │
└───────┼────────────────┼──────────────────────┼──────────────────┘
        │                │                      │
        ▼                ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS API SERVER (MVC)                       │
│                                                                  │
│  Routes (thin)  →  Controllers (business logic)  →  Models       │
│                                                                  │
│  /api/auth          – User register, login, profile              │
│  /api/movies        – Movie listing, city filter, theatres       │
│  /api/bookings      – Create, list, cancel, verify, seat lock    │
│  /api/payment       – Razorpay order creation & verification     │
│  /api/theatre/auth  – Theatre register & login                   │
│  /api/theatre       – Theatre dashboard, screens, food, stats    │
│  /api/food          – Food menu (global + per-theatre)           │
│  /api/admin         – SuperAdmin auth, stats, CRUD operations    │
│  /api/health        – Health check endpoint                      │
└──────────┬────────────────────────────────┬─────────────────────┘
           │                                │
           ▼                                ▼
┌─────────────────────────┐  ┌────────────────────────────────────┐
│      REDIS (ioredis)    │  │          MONGODB ATLAS             │
│                         │  │                                    │
│  • Atomic seat locking  │  │  Collections: User, Theatre,       │
│    (SET NX, 10-min TTL) │  │    Screen, Movie, Booking,         │
│  • BullMQ job queue for │  │    SeatMap, FoodItem, Payment      │
│    async booking        │  │                                    │
│    processing           │  │  • SeatMap: per movie + screen     │
│  • Auto-reconnect with  │  │    + date + time (unique index)    │
│    graceful fallback    │  │  • Booking: refs User, Movie,      │
│                         │  │    Theatre, Screen, FoodItem       │
└─────────────────────────┘  └────────────────────────────────────┘
```

---

## 📂 Project Structure

```
MarkMySeat/
├── package.json                    # Root scripts (dev, seed, build)
│
├── client/                         # React + TypeScript frontend
│   ├── src/
│   │   ├── api/                    # API client modules
│   │   │   ├── auth.ts             # User auth API
│   │   │   ├── bookings.ts         # Booking CRUD API
│   │   │   ├── movies.ts           # Movie listing API
│   │   │   └── admin.ts            # Admin API client
│   │   ├── components/
│   │   │   ├── Navbar.tsx           # Top nav with auth-aware links
│   │   │   ├── Footer.tsx           # Footer with branding
│   │   │   ├── Logo.tsx             # Reusable logo component (4 sizes)
│   │   │   ├── SeatLayout.tsx       # Interactive seat map renderer
│   │   │   ├── MovieCard.tsx        # Movie poster card with hover CTA
│   │   │   ├── ProtectedRoute.tsx   # User auth guard
│   │   │   ├── TheatreProtectedRoute.tsx
│   │   │   └── AdminProtectedRoute.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx       # User authentication state
│   │   │   ├── TheatreContext.tsx    # Theatre authentication state
│   │   │   └── AdminContext.tsx      # Admin authentication state
│   │   ├── pages/
│   │   │   ├── HomePage.tsx          # Movie discovery + search + filters
│   │   │   ├── BookingPage.tsx       # Date/time/seat selection
│   │   │   ├── ConfirmBooking.tsx    # Summary + food add-ons + payment
│   │   │   ├── SuccessPage.tsx       # Confetti + e-ticket + QR
│   │   │   ├── BookingHistory.tsx    # All user bookings list
│   │   │   ├── BookingDetail.tsx     # Single booking e-ticket view
│   │   │   ├── ProfilePage.tsx       # Edit profile + change password
│   │   │   ├── VerifyBookingPage.tsx # QR ticket verification (public)
│   │   │   ├── LoginPage.tsx         # User login
│   │   │   ├── RegisterPage.tsx      # User registration
│   │   │   ├── TheatreLogin.tsx      # Theatre partner login
│   │   │   ├── TheatreRegister.tsx   # Theatre partner registration
│   │   │   ├── TheatreDashboard.tsx  # Theatre management (5 tabs)
│   │   │   ├── AdminLogin.tsx        # SuperAdmin login
│   │   │   └── AdminDashboard.tsx    # SuperAdmin panel (5 tabs)
│   │   ├── types/                   # TypeScript type definitions
│   │   ├── utils/                   # Axios instance, helpers, Razorpay loader
│   │   ├── App.tsx                  # Route definitions
│   │   └── main.tsx                 # Entry point with providers
│   ├── public/
│   │   └── favicon.svg
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── server/                          # Node.js + Express backend (MVC pattern)
│   ├── server.js                    # Express app setup, route mounting, Redis + BullMQ init
│   ├── config/
│   │   ├── db.js                    # MongoDB connection helper
│   │   ├── razorpay.js              # Razorpay instance config
│   │   └── redis.js                 # Redis (ioredis) connection with auto-reconnect
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification (user)
│   │   ├── theatreMiddleware.js     # JWT verification (theatre owner)
│   │   └── adminMiddleware.js       # JWT verification (admin role)
│   ├── models/
│   │   ├── User.js                  # name, email, password, role, isActive
│   │   ├── Theatre.js               # name, email, city, screens, seatConfig, isApproved
│   │   ├── Screen.js                # theatre ref, name, number, seatConfig with categories
│   │   ├── Movie.js                 # title, poster, genre, showtimes, theatre/screen refs
│   │   ├── Booking.js               # user, movie, seats, food orders, payment, status
│   │   ├── SeatMap.js               # per movie+screen+date+time seat availability map
│   │   ├── FoodItem.js              # name, price, category, veg, theatre ref
│   │   └── Payment.js               # Razorpay order/payment IDs, amount, signature
│   ├── controllers/                 # Business logic (separated from routes)
│   │   ├── authController.js        # Register, login, profile, change password
│   │   ├── adminController.js       # SuperAdmin: stats, user/theatre/booking/movie CRUD
│   │   ├── bookingController.js     # Create, list, cancel, verify + seat locking + BullMQ worker
│   │   ├── movieController.js       # Movie listing, city filter, theatre lookup
│   │   ├── paymentController.js     # Razorpay order creation + HMAC signature verification
│   │   ├── theatreAuthController.js # Theatre register, login, profile, seat config
│   │   ├── theatreController.js     # Screens, movies, bookings, stats for theatre dashboard
│   │   └── foodController.js        # Food menu CRUD (global + per-theatre)
│   ├── routes/                      # Thin route definitions (maps URLs → controllers)
│   │   ├── auth.js                  # User auth routes
│   │   ├── bookingRoutes.js         # Booking CRUD + seat lock routes
│   │   ├── movieRoutes.js           # Public movie listing routes
│   │   ├── paymentRoutes.js         # Payment routes
│   │   ├── theatreAuth.js           # Theatre register/login routes
│   │   ├── theatreRoutes.js         # Theatre dashboard API routes
│   │   ├── foodRoutes.js            # Food menu routes
│   │   └── adminRoutes.js           # SuperAdmin API routes
│   ├── services/                    # Background services & concurrency
│   │   ├── seatLock.js              # Redis-based atomic seat locking (SET NX, 10-min TTL)
│   │   └── bookingQueue.js          # BullMQ queue + worker for async booking processing
│   └── seed/
│       ├── seed.js                  # Comprehensive test data seeder
│       ├── food.js                  # Food items seeder
│       └── movie.js                 # Legacy movie seeder
│
└── docs/                            # Architecture diagrams
```

---

## 🔄 How It Works

### Booking Flow

```
User browses movies → Selects movie → Picks date & showtime
    → Interactive seat map loads (real-time availability from SeatMap)
    → Selects seats (color-coded by category with pricing)
    → Backend locks seats in Redis (SET NX, 10-min TTL) to prevent double-booking
    → Proceeds to confirm → Adds food/beverages (optional)
    → Price breakdown shown (seats + food + total)
    → Initiates Razorpay payment
    → Backend creates Razorpay order → Frontend opens checkout modal
    → On payment success → Backend verifies signature (HMAC SHA256)
    → Redis locks verified → Seats marked as booked in SeatMap (MongoDB transaction)
    → Booking + Payment records saved → BullMQ job enqueued if queue is available
    → Success page with confetti + QR e-ticket
```

### Seat Locking (Redis)

To prevent two users from booking the same seat simultaneously, the platform uses **Redis-based atomic seat locking**:

1. **Lock** — When a user selects seats, the backend calls `SET seat:{showKey}:{seatId} userId NX EX 600` (atomic, 10-minute expiry)
2. **Verify** — Before confirming a booking, the backend verifies all locks still belong to the requesting user
3. **Release** — Locks auto-expire after 10 minutes, or are released manually if the user navigates away
4. **Fallback** — If Redis is unavailable, the system falls back to MongoDB-only seat tracking (no locking, first-write-wins)

### Authentication Architecture

The app uses **three independent JWT authentication flows**, each with its own token, context, and protected routes:

| Portal | Token Key | Context | Guard Component | Login Route |
|---|---|---|---|---|
| User | `token` | `AuthContext` | `ProtectedRoute` | `/login` |
| Theatre | `theatreToken` | `TheatreContext` | `TheatreProtectedRoute` | `/theatre/login` |
| Admin | `adminToken` | `AdminContext` | `AdminProtectedRoute` | `/admin` |

Each token is stored in `localStorage` and auto-verified on page load via the respective context provider.

### Seat Map System

Seat availability is tracked per **movie + screen + date + showtime** combination using the `SeatMap` collection with a unique compound index. Each seat map is a `Map<string, { booked: boolean, user: ObjectId }>` where keys are seat identifiers like `"A1"`, `"B5"`, etc.

Screens support fully configurable layouts:
- **Rows & seats per row** — e.g., 12 rows × 16 seats for IMAX, 6 × 10 for small screens
- **Categories** — Each category defines a name, assigned rows, price, and display color
- **Aisle gaps** — Automatically rendered at 1/3 and 2/3 positions

---

## 🧑‍💻 Local Development Setup

### 1. Clone & Install

```bash
git clone https://github.com/akashgupta-git/MarkMySeat.git
cd MarkMySeat
npm run install:all
```

### 2. Configure Environment

Create `.env` files in both `client/` and `server/` directories with the required variables (MongoDB URI, JWT secret, Razorpay keys, API URL).

### 3. Seed Test Data

```bash
npm run seed
```

This populates the database with:
- **1 SuperAdmin** + **5 test users**
- **3 theatres** (PVR Mumbai, INOX Delhi, Cinepolis Bangalore) with **9 screens**
- **20 movies** with real poster URLs, genres, cast details
- **21 food items** (14 global + 7 theatre-specific)
- **15 sample bookings** (confirmed, used, cancelled) with food orders and seat maps
- **13 payment records**

### 4. Run Development Servers

```bash
npm run dev
```

This starts both servers concurrently:
- **Frontend** → [http://localhost:3000](http://localhost:3000) (Vite dev server with HMR)
- **Backend** → [http://localhost:8080](http://localhost:8080) (Express with Nodemon)

The Vite dev server proxies `/api` requests to the backend automatically.

### Test Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| SuperAdmin | `admin@markmyseat.com` | `admin123` |
| User | `rahul@test.com` | `test123` |
| User | `priya@test.com` | `test123` |
| User | `amit@test.com` | `test123` |
| Theatre (PVR) | `pvr@theatre.com` | `theatre123` |
| Theatre (INOX) | `inox@theatre.com` | `theatre123` |
| Theatre (Cinepolis) | `cinepolis@theatre.com` | `theatre123` |

---

## 🎨 UI & Design

The frontend uses a **dark cinematic theme** designed for an immersive movie-booking experience:

| Element | Value |
|---|---|
| Background | `#0a0a1a` (deep navy black) |
| Card Background | `#161630` with glassmorphism effects |
| Primary Accent | `#dc354f` (cinema red) |
| Secondary Accent | `#06b6d4` (cyan) |
| Theatre Portal | Indigo-600 theme |
| Admin Portal | Emerald-600 theme |
| Effects | Glassmorphism (`.glass`, `.glass-strong`), gradient text, card glow, stagger animations |

All pages feature **Framer Motion** animations — page transitions, stagger-loaded cards, animated modals, and confetti on booking success.

---

## 💳 Payment Integration

Razorpay is integrated end-to-end:

1. **Order Creation** — Backend creates a Razorpay order with the booking amount
2. **Checkout Modal** — Frontend dynamically loads Razorpay script and opens the checkout UI
3. **Signature Verification** — Backend verifies the payment signature using HMAC SHA256 (`razorpay_order_id | razorpay_payment_id`)
4. **Booking Confirmation** — On successful verification, seats are locked in `SeatMap`, a `Booking` record is created, and a `Payment` record is saved
5. **Failure Handling** — Graceful error states for dismissed payments, network failures, and verification mismatches

---

## 🔐 Security

- **Password Hashing** — bcryptjs with 10 salt rounds
- **JWT Authentication** — Stateless tokens with role-based payloads (`{ id, role }`)
- **Payment Verification** — Server-side HMAC SHA256 signature validation
- **Atomic Seat Locking** — Redis SET NX prevents double-booking race conditions
- **CORS Protection** — Whitelist-only origin policy
- **Admin Self-Protection** — Admins cannot disable or delete their own account
- **User Account Control** — Disabled users receive `403 Forbidden` on login attempts
- **Theatre Approval Flow** — Theatres can be approved/suspended by admin
- **Secrets Management** — All credentials in `.env` files (git-ignored)

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login (returns JWT) |
| GET | `/api/auth/me` | User | Get current user profile |
| PUT | `/api/auth/profile` | User | Update profile |
| PUT | `/api/auth/change-password` | User | Change password |
| GET | `/api/movies/all` | Public | List active movies (optional city filter) |
| GET | `/api/movies/:id` | Public | Get single movie details |
| POST | `/api/bookings/create` | User | Create booking + lock seats |
| GET | `/api/bookings/my` | User | Get user's bookings |
| GET | `/api/bookings/:id` | User | Get booking detail |
| PUT | `/api/bookings/:id/cancel` | User | Cancel booking |
| GET | `/api/bookings/verify/:bookingId` | Public | Verify ticket via QR |
| POST | `/api/payment/create-order` | User | Create Razorpay order |
| POST | `/api/payment/verify` | User | Verify payment signature |
| POST | `/api/theatre/auth/register` | Public | Register theatre |
| POST | `/api/theatre/auth/login` | Public | Theatre login |
| GET | `/api/theatre/dashboard` | Theatre | Theatre stats |
| GET/POST/PUT/DELETE | `/api/theatre/movies` | Theatre | Movie CRUD |
| GET/POST/DELETE | `/api/theatre/screens` | Theatre | Screen management |
| GET/POST/DELETE | `/api/theatre/food` | Theatre | Food menu management |
| GET | `/api/food/menu` | Public | Get food menu (optional theatreId) |
| POST | `/api/admin/login` | Public | Admin login |
| GET | `/api/admin/stats` | Admin | System-wide statistics |
| GET/PUT/DELETE | `/api/admin/users` | Admin | User management |
| GET/PUT/DELETE | `/api/admin/theatres` | Admin | Theatre management |
| GET/PUT | `/api/admin/bookings` | Admin | Booking management |
| GET/PUT | `/api/admin/movies` | Admin | Movie management |
| GET | `/api/health` | Public | Server health check |

---

## ☁️ Deployment

### Cloud-Native (Current — v2)

| Service | Platform | Auto-Deploy |
|---|---|---|
| Frontend | Netlify | On git push to `main` |
| Backend | Render | On git push to `main` |
| Database | MongoDB Atlas | Always-on cluster |

### Jenkins + AWS EC2 (Legacy — v1)

The v1 deployment used a Jenkins CI/CD pipeline on AWS EC2 with Nginx as reverse proxy and PM2 for process management. See `docs/` for architecture diagrams.

---

## 🗄️ Database Schema

```
User          Theatre         Screen          Movie
├─ name       ├─ name         ├─ theatre →    ├─ title
├─ email      ├─ email        ├─ name         ├─ posterUrl
├─ password   ├─ password     ├─ screenNumber ├─ genre, language
├─ phone      ├─ city         ├─ seatConfig   ├─ showTimes[]
├─ role       ├─ address        ├─ rows       ├─ theatre →
├─ isActive   ├─ screens        ├─ seatsPerRow├─ screen →
              ├─ seatConfig     └─ categories[]├─ isActive
              └─ isApproved       ├─ name
                                  ├─ rows[]
Booking       SeatMap             ├─ price
├─ bookingId  ├─ movie →         └─ color
├─ user →     ├─ screen →
├─ movie →    ├─ showDate     FoodItem       Payment
├─ theatre →  ├─ showTime     ├─ name        ├─ razorpay_order_id
├─ screen →   └─ seats (Map)  ├─ price       ├─ razorpay_payment_id
├─ showDate                   ├─ category    ├─ razorpay_signature
├─ showTime                   ├─ imageUrl    ├─ amount
├─ seatNumbers[]              ├─ isVeg       ├─ currency
├─ foodOrders[]               ├─ theatre →   └─ userEmail
├─ totalPrice                 └─ isAvailable
├─ paymentId
└─ status
```

---

## ✨ Developed By

**Akash Gupta**
💼 B.Tech CSE | Full Stack & Cloud Enthusiast
🌐 [GitHub](https://github.com/akashgupta-git)
💬 [LinkedIn](https://www.linkedin.com/in/akashgupta-git)

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙌 Show Your Support

⭐ Star this repo if you found it useful!
🛠️ Fork it to build your own version
📩 Pull requests are welcome

---