/**
 * Comprehensive seed script for MarkMySeat
 * Seeds: admin user, test users, theatres, screens, movies, food items, sample bookings
 *
 * Usage: node seed/seed.js
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const User = require("../models/User");
const Theatre = require("../models/Theatre");
const Screen = require("../models/Screen");
const Movie = require("../models/Movie");
const FoodItem = require("../models/FoodItem");
const Booking = require("../models/Booking");
const SeatMap = require("../models/SeatMap");
const Payment = require("../models/Payment");

// ──────────────────────── Helpers ────────────────────────

async function hashPassword(pw) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
}

function todayStr(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

function generateBookingId() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MMS-${y}${m}${day}-${rand}`;
}

function generateSeats(seatConfig) {
  const seatData = {};
  const totalRows = seatConfig?.rows || 8;
  const seatsPerRow = seatConfig?.seatsPerRow || 12;
  for (let r = 0; r < totalRows; r++) {
    const rowLetter = String.fromCharCode(65 + r);
    for (let i = 1; i <= seatsPerRow; i++) {
      seatData[`${rowLetter}${i}`] = { booked: false, user: null };
    }
  }
  return seatData;
}

const DEFAULT_CATEGORIES = [
  { name: "Premium", rows: ["A", "B"], price: 350, color: "#eab308" },
  { name: "Executive", rows: ["C", "D", "E"], price: 250, color: "#0ea5e9" },
  { name: "Classic", rows: ["F", "G", "H"], price: 150, color: "#22c55e" },
];

const IMAX_CATEGORIES = [
  { name: "Recliner", rows: ["A", "B"], price: 800, color: "#f59e0b" },
  { name: "Premium", rows: ["C", "D", "E"], price: 500, color: "#8b5cf6" },
  { name: "Executive", rows: ["F", "G", "H", "I"], price: 350, color: "#0ea5e9" },
  { name: "Classic", rows: ["J", "K", "L"], price: 250, color: "#22c55e" },
];

const SMALL_CATEGORIES = [
  { name: "Gold", rows: ["A", "B"], price: 300, color: "#eab308" },
  { name: "Silver", rows: ["C", "D", "E", "F"], price: 180, color: "#6b7280" },
];

// ──────────────────────── Movie Data ────────────────────────

const MOVIES = [
  {
    title: "Inception",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
    description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
    genre: "Sci-Fi",
    language: "English",
    duration: "2h 28min",
    releaseDate: new Date("2010-07-16"),
    rating: "8.8",
    cast: "Leonardo DiCaprio, Tom Hardy, Joseph Gordon-Levitt",
  },
  {
    title: "The Dark Knight",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
    description: "When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological and physical tests.",
    genre: "Action",
    language: "English",
    duration: "2h 32min",
    releaseDate: new Date("2008-07-18"),
    rating: "9.0",
    cast: "Christian Bale, Heath Ledger, Aaron Eckhart",
  },
  {
    title: "Interstellar",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    genre: "Sci-Fi",
    language: "English",
    duration: "2h 49min",
    releaseDate: new Date("2014-11-07"),
    rating: "8.7",
    cast: "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
  },
  {
    title: "RRR",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BODUwNDNjYzctODUxNy00ZTA2LWIyYTEtMDc5Y2E5ZjBmNTMzXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg",
    description: "A tale of two legendary Indian revolutionaries and their journey far away from home during the British Raj.",
    genre: "Action",
    language: "Telugu",
    duration: "3h 7min",
    releaseDate: new Date("2022-03-25"),
    rating: "8.0",
    cast: "N.T. Rama Rao Jr., Ram Charan, Alia Bhatt",
  },
  {
    title: "3 Idiots",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BNTkyOGVjMGEtNmQzZi00NzFlLTlhOWQtODYyMDJlZDVlMDVhXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    description: "Two friends search for their long-lost companion while revisiting memories of their time at Imperial College of Engineering.",
    genre: "Comedy",
    language: "Hindi",
    duration: "2h 51min",
    releaseDate: new Date("2009-12-25"),
    rating: "8.4",
    cast: "Aamir Khan, R. Madhavan, Sharman Joshi",
  },
  {
    title: "Oppenheimer",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_.jpg",
    description: "The story of J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    genre: "Drama",
    language: "English",
    duration: "3h 0min",
    releaseDate: new Date("2023-07-21"),
    rating: "8.5",
    cast: "Cillian Murphy, Emily Blunt, Robert Downey Jr.",
  },
  {
    title: "Jawan",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BNTQzNjc0OTQtOTFkYy00MDg1LThlZWEtYzQ4YTBmNTRhYTM2XkEyXkFqcGdeQXVyMTUyNjIwMDEw._V1_.jpg",
    description: "A prison warden recruits inmates to commit acts of vigilantism that bring him face-to-face with a corrupt politician.",
    genre: "Action",
    language: "Hindi",
    duration: "2h 45min",
    releaseDate: new Date("2023-09-07"),
    rating: "7.1",
    cast: "Shah Rukh Khan, Nayanthara, Vijay Sethupathi",
  },
  {
    title: "Spider-Man: No Way Home",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BZWMyYzFjYTYtNTRjYi00OGExLWE2YzgtOGRmYjAxZTU3NzBiXkEyXkFqcGdeQXVyMzQ0MzA0NTM@._V1_.jpg",
    description: "When a spell to make the world forget Peter Parker goes wrong, the multiverse is ripped open.",
    genre: "Action",
    language: "English",
    duration: "2h 28min",
    releaseDate: new Date("2021-12-17"),
    rating: "8.2",
    cast: "Tom Holland, Zendaya, Benedict Cumberbatch",
  },
  {
    title: "Drishyam 2",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BYjk0MTgzMmQtZmY3Yy00NmFkLTk0MzgtNGRhYjYzNTY1MGExXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg",
    description: "A gripping sequel where Vijay Salgaonkar's carefully constructed alibi begins crumbling.",
    genre: "Thriller",
    language: "Hindi",
    duration: "2h 25min",
    releaseDate: new Date("2022-11-18"),
    rating: "7.6",
    cast: "Ajay Devgn, Tabu, Akshaye Khanna",
  },
  {
    title: "Baahubali 2",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BOTYzODA5MjctMjdlMS00NGM2LTliZGQtMjQ3Y2E1NDFhY2FmXkEyXkFqcGdeQXVyNjQ2MjQ5NzM@._V1_.jpg",
    description: "When Shiva learns about his heritage as the son of Baahubali, he begins to look for answers.",
    genre: "Action",
    language: "Telugu",
    duration: "2h 47min",
    releaseDate: new Date("2017-04-28"),
    rating: "8.2",
    cast: "Prabhas, Rana Daggubati, Anushka Shetty",
  },
  {
    title: "Pathaan",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BM2I0ZDFiMmUtNmY0OC00NjA5LTgxMmQtMDM3NjQyOGNhNDg3XkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg",
    description: "An Indian spy takes on the leader of a group of mercenaries who have nefarious plans to target his homeland.",
    genre: "Action",
    language: "Hindi",
    duration: "2h 26min",
    releaseDate: new Date("2023-01-25"),
    rating: "6.7",
    cast: "Shah Rukh Khan, Deepika Padukone, John Abraham",
  },
  {
    title: "Dilwale Dulhania Le Jayenge",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BNDdjYjI0MjUtOTEwNC00NzUzLWJjN2QtODI2M2IzOWFjMWFlXkEyXkFqcGdeQXVyNDY5MTUyNjc@._V1_.jpg",
    description: "Raj and Simran fall in love during a trip across Europe, but cultural expectations stand in their way.",
    genre: "Romance",
    language: "Hindi",
    duration: "3h 9min",
    releaseDate: new Date("1995-10-20"),
    rating: "8.1",
    cast: "Shah Rukh Khan, Kajol, Amrish Puri",
  },
  {
    title: "KGF Chapter 2",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BY2Y5ZWMwMDUtNDhkYy00MmRiLTg1Y2YtYTlhNDkyMmUzZTY2XkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg",
    description: "Rocky returns to Kolar Gold Fields seeking to fulfill his mother's dying wish.",
    genre: "Action",
    language: "Kannada",
    duration: "2h 48min",
    releaseDate: new Date("2022-04-14"),
    rating: "7.5",
    cast: "Yash, Sanjay Dutt, Raveena Tandon",
  },
  {
    title: "Avatar: The Way of Water",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BYjhiNjBlODctY2ZiOC00YjVlLWFlNzAtNTVhNzM1YjI1NzMxXkEyXkFqcGdeQXVyMjQxNTE1MDA@._V1_.jpg",
    description: "Jake Sully and Neytiri form a family and do everything to stay together.",
    genre: "Sci-Fi",
    language: "English",
    duration: "3h 12min",
    releaseDate: new Date("2022-12-16"),
    rating: "7.6",
    cast: "Sam Worthington, Zoe Saldana, Sigourney Weaver",
  },
  {
    title: "Shershaah",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMjgyNGYxMjktN2JmMS00ZjVjLTkyMjAtNGJjMjlkZjQ2MWI0XkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg",
    description: "The true story of Captain Vikram Batra who led his troops to victory in the Kargil War.",
    genre: "Drama",
    language: "Hindi",
    duration: "2h 15min",
    releaseDate: new Date("2021-08-12"),
    rating: "8.4",
    cast: "Sidharth Malhotra, Kiara Advani",
  },
  {
    title: "Zindagi Na Milegi Dobara",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BYjUyNjgwMTg0MV5BMl5BanBnXkFtZTcwNDQyMTEwNg@@._V1_.jpg",
    description: "Three college friends reunite for a bachelor road trip across Spain, facing fears and rediscovering life.",
    genre: "Drama",
    language: "Hindi",
    duration: "2h 33min",
    releaseDate: new Date("2011-07-15"),
    rating: "8.2",
    cast: "Hrithik Roshan, Farhan Akhtar, Abhay Deol",
  },
  {
    title: "Barfi!",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMTUzNjk1MjA0OV5BMl5BanBnXkFtZTcwODgyMjY0OA@@._V1_.jpg",
    description: "A hearing and speech-impaired young man navigates love and friendship with his quirky charm.",
    genre: "Romance",
    language: "Hindi",
    duration: "2h 31min",
    releaseDate: new Date("2012-09-14"),
    rating: "8.1",
    cast: "Ranbir Kapoor, Priyanka Chopra, Ileana D'Cruz",
  },
  {
    title: "Dunki",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BYjlhN2M0ZmQtN2RhNy00YjVhLTliMjktYzRjMWE4NjRiMTRmXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg",
    description: "Four friends from Punjab dream of migrating abroad through the illegal donkey flight route.",
    genre: "Drama",
    language: "Hindi",
    duration: "2h 35min",
    releaseDate: new Date("2023-12-21"),
    rating: "6.3",
    cast: "Shah Rukh Khan, Taapsee Pannu, Vicky Kaushal",
  },
];

const FOOD_ITEMS = [
  { name: "Classic Salted Popcorn", description: "Freshly popped golden corn", price: 200, category: "Popcorn", imageUrl: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=300", isVeg: true },
  { name: "Caramel Popcorn", description: "Sweet and crunchy caramel-coated popcorn", price: 250, category: "Popcorn", imageUrl: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=300", isVeg: true },
  { name: "Cheese Popcorn", description: "Loaded with cheddar cheese flavor", price: 280, category: "Popcorn", imageUrl: "https://images.unsplash.com/photo-1630172927590-59f0e4645e25?w=300", isVeg: true },
  { name: "Coca-Cola (Large)", description: "Ice-cold Coca-Cola", price: 180, category: "Beverage", imageUrl: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=300", isVeg: true },
  { name: "Pepsi (Large)", description: "Refreshing chilled Pepsi", price: 180, category: "Beverage", imageUrl: "https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=300", isVeg: true },
  { name: "Cold Coffee", description: "Creamy iced coffee blended to perfection", price: 220, category: "Beverage", imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300", isVeg: true },
  { name: "Mineral Water", description: "Pure packaged drinking water (500ml)", price: 50, category: "Beverage", imageUrl: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=300", isVeg: true },
  { name: "Nachos with Cheese Dip", description: "Crispy tortilla chips with warm cheese sauce", price: 250, category: "Snack", imageUrl: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=300", isVeg: true },
  { name: "French Fries", description: "Golden crispy fries seasoned with peri-peri", price: 180, category: "Snack", imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300", isVeg: true },
  { name: "Chicken Nuggets", description: "6 pieces of tender chicken nuggets", price: 280, category: "Snack", imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=300", isVeg: false },
  { name: "Popcorn + Coke Combo", description: "Regular popcorn + Large Coca-Cola — Save ₹80!", price: 300, category: "Combo", imageUrl: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=300", isVeg: true },
  { name: "Couple Combo", description: "2 Regular Popcorn + 2 Large drinks — Save ₹160!", price: 550, category: "Combo", imageUrl: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=300", isVeg: true },
  { name: "Samosa (2pc)", description: "Hot crispy samosas with mint chutney", price: 120, category: "Snack", imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300", isVeg: true },
  { name: "Veg Burger", description: "Crispy paneer burger with tangy sauce", price: 180, category: "Meal", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300", isVeg: true },
];

// ──────────────────────── Main Seed ────────────────────────

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");

    // ── Clear everything ──
    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Theatre.deleteMany({}),
      Screen.deleteMany({}),
      Movie.deleteMany({}),
      FoodItem.deleteMany({}),
      Booking.deleteMany({}),
      SeatMap.deleteMany({}),
      Payment.deleteMany({}),
    ]);
    console.log("  All collections cleared.\n");

    // ── 1. Admin user ──
    console.log("Creating admin user...");
    const adminPw = await hashPassword("admin123");
    const admin = await User.create({
      name: "Super Admin",
      email: "admin@markmyseat.com",
      password: adminPw,
      phone: "9999999999",
      role: "admin",
      isActive: true,
    });
    console.log(`  Admin: admin@markmyseat.com / admin123\n`);

    // ── 2. Test users ──
    console.log("Creating test users...");
    const userPw = await hashPassword("test123");
    const usersData = [
      { name: "Rahul Sharma", email: "rahul@test.com", phone: "9876543210" },
      { name: "Priya Patel", email: "priya@test.com", phone: "9876543211" },
      { name: "Amit Kumar", email: "amit@test.com", phone: "9876543212" },
      { name: "Sneha Verma", email: "sneha@test.com", phone: "9876543213" },
      { name: "Arjun Singh", email: "arjun@test.com", phone: "9876543214" },
    ];
    const users = [];
    for (const u of usersData) {
      const created = await User.create({
        ...u,
        password: userPw,
        role: "user",
        isActive: true,
      });
      users.push(created);
      console.log(`  User: ${u.email} / test123`);
    }
    console.log();

    // ── 3. Theatres ──
    console.log("Creating theatres...");
    const theatrePw = await hashPassword("theatre123");
    const theatresData = [
      {
        name: "PVR Cinemas",
        email: "pvr@theatre.com",
        phone: "022-12345678",
        address: "Phoenix Marketcity, Kurla West",
        city: "Mumbai",
        screenCount: 3,
        logoUrl: "",
      },
      {
        name: "INOX Leisure",
        email: "inox@theatre.com",
        phone: "011-87654321",
        address: "Select Citywalk, Saket",
        city: "Delhi",
        screenCount: 2,
        logoUrl: "",
      },
      {
        name: "Cinepolis",
        email: "cinepolis@theatre.com",
        phone: "080-11223344",
        address: "Orion Mall, Rajajinagar",
        city: "Bangalore",
        screenCount: 4,
        logoUrl: "",
      },
    ];

    const theatres = [];
    const allScreens = [];

    for (const t of theatresData) {
      const theatre = await Theatre.create({
        name: t.name,
        email: t.email,
        password: theatrePw,
        phone: t.phone,
        address: t.address,
        city: t.city,
        screens: t.screenCount,
        seatConfig: {
          rows: 8,
          seatsPerRow: 12,
          categories: DEFAULT_CATEGORIES,
        },
        isApproved: true,
      });
      theatres.push(theatre);
      console.log(`  Theatre: ${t.email} / theatre123 (${t.name}, ${t.city})`);

      // Create screens
      const screenConfigs = [];
      for (let i = 1; i <= t.screenCount; i++) {
        let config;
        if (i === 1) {
          // First screen is IMAX/premium
          config = { rows: 12, seatsPerRow: 16, categories: IMAX_CATEGORIES };
        } else if (i === t.screenCount && t.screenCount > 2) {
          // Last screen is smaller
          config = { rows: 6, seatsPerRow: 10, categories: SMALL_CATEGORIES };
        } else {
          config = { rows: 8, seatsPerRow: 12, categories: DEFAULT_CATEGORIES };
        }

        const screen = await Screen.create({
          theatre: theatre._id,
          name: i === 1 ? "IMAX Screen" : `Screen ${i}`,
          screenNumber: i,
          seatConfig: config,
          isActive: true,
        });
        screenConfigs.push(screen);
        allScreens.push(screen);
      }
    }
    console.log(`  Total screens created: ${allScreens.length}\n`);

    // ── 4. Movies assigned to theatres ──
    console.log("Creating movies assigned to theatres...");

    // Assign movies to theatres and their screens
    const movieAssignments = [
      // PVR Mumbai (3 screens)
      { movieIdx: 0, theatreIdx: 0, screenIdx: 0, showTimes: ["10:00 AM", "2:00 PM", "6:00 PM", "10:00 PM"] },
      { movieIdx: 2, theatreIdx: 0, screenIdx: 0, showTimes: ["11:30 AM", "3:30 PM", "7:30 PM"] },
      { movieIdx: 1, theatreIdx: 0, screenIdx: 1, showTimes: ["10:30 AM", "1:30 PM", "5:00 PM", "9:00 PM"] },
      { movieIdx: 6, theatreIdx: 0, screenIdx: 1, showTimes: ["12:00 PM", "4:00 PM", "8:00 PM"] },
      { movieIdx: 4, theatreIdx: 0, screenIdx: 2, showTimes: ["11:00 AM", "3:00 PM", "7:00 PM"] },

      // INOX Delhi (2 screens)
      { movieIdx: 5, theatreIdx: 1, screenIdx: 0, showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:30 PM"] },
      { movieIdx: 7, theatreIdx: 1, screenIdx: 0, showTimes: ["11:00 AM", "3:00 PM", "7:00 PM"] },
      { movieIdx: 3, theatreIdx: 1, screenIdx: 1, showTimes: ["10:00 AM", "2:00 PM", "6:00 PM", "10:00 PM"] },
      { movieIdx: 10, theatreIdx: 1, screenIdx: 1, showTimes: ["12:00 PM", "4:00 PM", "8:00 PM"] },

      // Cinepolis Bangalore (4 screens)
      { movieIdx: 13, theatreIdx: 2, screenIdx: 0, showTimes: ["10:00 AM", "2:00 PM", "6:00 PM", "10:00 PM"] },
      { movieIdx: 8, theatreIdx: 2, screenIdx: 1, showTimes: ["10:30 AM", "1:30 PM", "5:00 PM", "9:00 PM"] },
      { movieIdx: 9, theatreIdx: 2, screenIdx: 1, showTimes: ["11:00 AM", "3:00 PM", "7:00 PM"] },
      { movieIdx: 11, theatreIdx: 2, screenIdx: 2, showTimes: ["10:00 AM", "2:00 PM", "6:00 PM", "10:00 PM"] },
      { movieIdx: 12, theatreIdx: 2, screenIdx: 2, showTimes: ["12:00 PM", "4:00 PM", "8:00 PM"] },
      { movieIdx: 14, theatreIdx: 2, screenIdx: 3, showTimes: ["11:00 AM", "3:00 PM", "7:00 PM"] },
      { movieIdx: 15, theatreIdx: 2, screenIdx: 3, showTimes: ["1:00 PM", "5:00 PM", "9:00 PM"] },
    ];

    // Track which screens we've used per theatre
    const theatreScreenMap = {};
    for (const t of theatres) {
      theatreScreenMap[t._id.toString()] = allScreens.filter(
        (s) => s.theatre.toString() === t._id.toString()
      );
    }

    const createdMovies = [];
    for (const a of movieAssignments) {
      const movieData = MOVIES[a.movieIdx];
      const theatre = theatres[a.theatreIdx];
      const theatreScreens = theatreScreenMap[theatre._id.toString()];
      const screen = theatreScreens[a.screenIdx];

      const movie = await Movie.create({
        ...movieData,
        showTimes: a.showTimes,
        theatre: theatre._id,
        screen: screen._id,
        isActive: true,
      });
      createdMovies.push({ movie, theatre, screen });
    }

    // Also seed a few "global" movies (no theatre) for the homepage
    const globalMovies = [];
    for (let i = 14; i < MOVIES.length; i++) {
      const movie = await Movie.create({
        ...MOVIES[i],
        showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
        theatre: null,
        screen: null,
        isActive: true,
      });
      globalMovies.push(movie);
    }

    console.log(`  Theatre movies: ${createdMovies.length}`);
    console.log(`  Global movies: ${globalMovies.length}\n`);

    // ── 5. Food items ──
    console.log("Creating food items...");

    // Global menu
    const globalFood = [];
    for (const item of FOOD_ITEMS) {
      const created = await FoodItem.create({ ...item, theatre: null, isAvailable: true });
      globalFood.push(created);
    }
    console.log(`  Global food items: ${globalFood.length}`);

    // Theatre-specific menu extras
    const theatreFoodExtras = [
      { theatre: theatres[0], items: [
        { name: "PVR Special Masala Popcorn", description: "Our signature spicy masala popcorn", price: 320, category: "Popcorn", isVeg: true, imageUrl: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=300" },
        { name: "PVR Gourmet Nachos", description: "Premium nachos with guacamole & cheese", price: 380, category: "Snack", isVeg: true, imageUrl: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=300" },
      ]},
      { theatre: theatres[1], items: [
        { name: "INOX Cheese Burst Popcorn", description: "Double cheese explosion popcorn", price: 350, category: "Popcorn", isVeg: true, imageUrl: "https://images.unsplash.com/photo-1630172927590-59f0e4645e25?w=300" },
        { name: "INOX Premium Milkshake", description: "Thick chocolate milkshake", price: 280, category: "Beverage", isVeg: true, imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300" },
      ]},
      { theatre: theatres[2], items: [
        { name: "Cinepolis Hot Dog", description: "Classic American hot dog", price: 220, category: "Snack", isVeg: false, imageUrl: "https://images.unsplash.com/photo-1612392062126-3e6ff5a49e19?w=300" },
        { name: "Cinepolis Churros", description: "Warm churros with chocolate dip", price: 200, category: "Snack", isVeg: true, imageUrl: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=300" },
        { name: "Cinepolis Party Combo", description: "Large popcorn + 4 drinks + nachos", price: 999, category: "Combo", isVeg: true, imageUrl: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=300" },
      ]},
    ];

    for (const te of theatreFoodExtras) {
      for (const item of te.items) {
        await FoodItem.create({ ...item, theatre: te.theatre._id, isAvailable: true });
      }
      console.log(`  ${te.theatre.name} extras: ${te.items.length}`);
    }
    console.log();

    // ── 6. Sample bookings with food orders & payments ──
    console.log("Creating sample bookings...");
    let bookingCount = 0;
    let paymentCount = 0;

    const bookingsSeed = [
      // Rahul — 3 bookings (1 today, 1 tomorrow, 1 past-cancelled)
      { userIdx: 0, movieRelIdx: 0, seats: ["A1", "A2"], showTimeIdx: 0, dayOffset: 0, foodIdxs: [0, 3], foodQtys: [1, 2], status: "confirmed" },
      { userIdx: 0, movieRelIdx: 2, seats: ["C5", "C6", "C7"], showTimeIdx: 1, dayOffset: 1, foodIdxs: [10], foodQtys: [2], status: "confirmed" },
      { userIdx: 0, movieRelIdx: 4, seats: ["F2", "F3"], showTimeIdx: 0, dayOffset: -3, foodIdxs: [], foodQtys: [], status: "cancelled" },

      // Priya — 3 bookings (1 used, 1 confirmed w/ food, 1 upcoming)
      { userIdx: 1, movieRelIdx: 1, seats: ["B3", "B4"], showTimeIdx: 2, dayOffset: -1, foodIdxs: [1, 5, 7], foodQtys: [1, 1, 1], status: "used" },
      { userIdx: 1, movieRelIdx: 5, seats: ["D1", "D2", "D3", "D4"], showTimeIdx: 0, dayOffset: 2, foodIdxs: [11], foodQtys: [1], status: "confirmed" },
      { userIdx: 1, movieRelIdx: 8, seats: ["E5", "E6"], showTimeIdx: 1, dayOffset: 4, foodIdxs: [3, 8], foodQtys: [2, 1], status: "confirmed" },

      // Amit — 3 bookings (1 used past, 2 confirmed)
      { userIdx: 2, movieRelIdx: 3, seats: ["E8", "E9"], showTimeIdx: 1, dayOffset: -2, foodIdxs: [0, 6], foodQtys: [2, 3], status: "used" },
      { userIdx: 2, movieRelIdx: 10, seats: ["C1", "C2"], showTimeIdx: 0, dayOffset: 0, foodIdxs: [2, 4], foodQtys: [1, 1], status: "confirmed" },
      { userIdx: 2, movieRelIdx: 14, seats: ["D5", "D6"], showTimeIdx: 2, dayOffset: 1, foodIdxs: [], foodQtys: [], status: "confirmed" },

      // Sneha — 3 bookings (varied)
      { userIdx: 3, movieRelIdx: 9, seats: ["A5", "A6"], showTimeIdx: 0, dayOffset: 1, foodIdxs: [9, 12], foodQtys: [1, 2], status: "confirmed" },
      { userIdx: 3, movieRelIdx: 11, seats: ["F1", "F2", "F3"], showTimeIdx: 2, dayOffset: -4, foodIdxs: [7], foodQtys: [1], status: "used" },
      { userIdx: 3, movieRelIdx: 6, seats: ["B1", "B2"], showTimeIdx: 1, dayOffset: 0, foodIdxs: [], foodQtys: [], status: "cancelled" },

      // Arjun — 3 bookings
      { userIdx: 4, movieRelIdx: 13, seats: ["C3", "C4"], showTimeIdx: 1, dayOffset: 3, foodIdxs: [0, 3, 7], foodQtys: [1, 1, 1], status: "confirmed" },
      { userIdx: 4, movieRelIdx: 7, seats: ["B7", "B8"], showTimeIdx: 0, dayOffset: 0, foodIdxs: [10], foodQtys: [1], status: "confirmed" },
      { userIdx: 4, movieRelIdx: 12, seats: ["A3", "A4", "A5"], showTimeIdx: 2, dayOffset: -1, foodIdxs: [1, 5], foodQtys: [2, 2], status: "used" },
    ];

    for (const b of bookingsSeed) {
      if (b.movieRelIdx >= createdMovies.length) continue;
      const { movie, theatre, screen } = createdMovies[b.movieRelIdx];
      const user = users[b.userIdx];
      const showTime = movie.showTimes[b.showTimeIdx] || movie.showTimes[0];
      const showDate = todayStr(b.dayOffset);

      // get seat config category info
      const categories = screen.seatConfig?.categories || DEFAULT_CATEGORIES;
      let seatTotal = 0;
      for (const seatNum of b.seats) {
        const rowLetter = seatNum.charAt(0);
        let price = 200;
        for (const cat of categories) {
          if (cat.rows.includes(rowLetter)) {
            price = cat.price;
            break;
          }
        }
        seatTotal += price;
      }

      // Build food orders from globalFood indices
      const foodOrders = [];
      let foodTotal = 0;
      for (let fi = 0; fi < b.foodIdxs.length; fi++) {
        const idx = b.foodIdxs[fi];
        if (idx < globalFood.length) {
          const food = globalFood[idx];
          const qty = b.foodQtys[fi] || 1;
          foodOrders.push({
            item: food._id,
            name: food.name,
            quantity: qty,
            price: food.price,
          });
          foodTotal += food.price * qty;
        }
      }

      const totalPrice = seatTotal + foodTotal;

      // create or find seat map
      let seatMap = await SeatMap.findOne({
        movie: movie._id,
        screen: screen._id,
        showDate,
        showTime,
      });

      if (!seatMap) {
        seatMap = new SeatMap({
          movie: movie._id,
          screen: screen._id,
          showDate,
          showTime,
          seats: generateSeats(screen.seatConfig),
        });
      }

      // mark seats as booked (unless cancelled)
      if (b.status !== "cancelled") {
        for (const seatNum of b.seats) {
          seatMap.seats.set(seatNum, { booked: true, user: user._id });
        }
      }
      seatMap.markModified("seats");
      await seatMap.save();

      const payId = `pay_seed_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

      // create booking
      await Booking.create({
        bookingId: generateBookingId(),
        user: user._id,
        movie: movie._id,
        theatre: theatre._id,
        screen: screen._id,
        screenName: screen.name,
        showDate,
        showTime,
        seatNumber: b.seats.join(", "),
        seatNumbers: b.seats,
        totalPrice,
        paymentId: payId,
        paymentMethod: "Razorpay",
        status: b.status,
        foodOrders,
        foodTotal,
      });

      // create matching Payment record
      if (b.status !== "cancelled") {
        await Payment.create({
          razorpay_order_id: `order_seed_${Math.random().toString(36).substr(2, 12)}`,
          razorpay_payment_id: payId,
          razorpay_signature: `sig_seed_${Math.random().toString(36).substr(2, 16)}`,
          amount: totalPrice * 100, // paise
          currency: "INR",
          userEmail: user.email,
        });
        paymentCount++;
      }

      bookingCount++;
    }
    console.log(`  Bookings created: ${bookingCount} (${bookingsSeed.filter(b => b.status === "confirmed").length} confirmed, ${bookingsSeed.filter(b => b.status === "used").length} used, ${bookingsSeed.filter(b => b.status === "cancelled").length} cancelled)`);
    console.log(`  Payments created: ${paymentCount}`);
    console.log(`  Food orders: ${bookingsSeed.filter(b => b.foodIdxs.length > 0).length} bookings with food\n`);

    // ── Summary ──
    console.log("═══════════════════════════════════════════════════════");
    console.log("  SEED COMPLETE — MarkMySeat Test Data Ready!");
    console.log("═══════════════════════════════════════════════════════");
    console.log();
    console.log("  LOGIN CREDENTIALS:");
    console.log("  ─────────────────");
    console.log("  SuperAdmin:  admin@markmyseat.com  /  admin123");
    console.log("  User 1:      rahul@test.com        /  test123");
    console.log("  User 2:      priya@test.com        /  test123");
    console.log("  User 3:      amit@test.com         /  test123");
    console.log("  User 4:      sneha@test.com        /  test123");
    console.log("  User 5:      arjun@test.com        /  test123");
    console.log("  PVR:         pvr@theatre.com       /  theatre123");
    console.log("  INOX:        inox@theatre.com      /  theatre123");
    console.log("  Cinepolis:   cinepolis@theatre.com  /  theatre123");
    console.log();
    console.log("  DATA SUMMARY:");
    console.log("  ─────────────");
    console.log(`  Users:       1 admin + ${users.length} regular`);
    console.log(`  Theatres:    ${theatres.length} (approved)`);
    console.log(`  Screens:     ${allScreens.length}`);
    console.log(`  Movies:      ${createdMovies.length} theatre + ${globalMovies.length} global`);
    console.log(`  Food Items:  ${globalFood.length} global + extras`);
    console.log(`  Bookings:    ${bookingCount}`);
    console.log();

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\nSeed failed:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();