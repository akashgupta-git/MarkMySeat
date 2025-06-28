const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Movie = require("../models/Movie"); // Adjust path if needed

dotenv.config();

const movies = [
  {
    title: "Inception",
    posterUrl: "https://m.media-amazon.com/images/I/51v5ZpFyaFL._AC_.jpg",
    description: "A thief who steals corporate secrets through dream-sharing.",
    genre: "Sci-Fi",
    language: "English",
    duration: "2h 28min",
    releaseDate: new Date("2010-07-16"),
    showTimes: ["10:00 AM", "2:00 PM", "6:00 PM"],
  },
  {
    title: "The Dark Knight",
    posterUrl: "https://m.media-amazon.com/images/I/71pox3L6JrL._AC_SL1200_.jpg",
    description: "Batman raises the stakes in his war on crime.",
    genre: "Action",
    language: "English",
    duration: "2h 32min",
    releaseDate: new Date("2008-07-18"),
    showTimes: ["11:00 AM", "3:00 PM", "7:00 PM"],
  },
  {
    title: "Interstellar",
    posterUrl: "https://m.media-amazon.com/images/I/91kFYg4fX3L._AC_SL1500_.jpg",
    description: "A team travels through a wormhole to ensure humanity's survival.",
    genre: "Sci-Fi",
    language: "English",
    duration: "2h 49min",
    releaseDate: new Date("2014-11-07"),
    showTimes: ["9:00 AM", "1:00 PM", "5:00 PM"],
  },
  {
    title: "RRR",
    posterUrl: "https://m.media-amazon.com/images/I/81PBkO7f1UL._AC_SL1500_.jpg",
    description: "A tale of two legendary revolutionaries and their journey.",
    genre: "Action",
    language: "Telugu",
    duration: "3h 7min",
    releaseDate: new Date("2022-03-25"),
    showTimes: ["10:30 AM", "2:30 PM", "6:30 PM"],
  },
  {
    title: "3 Idiots",
    posterUrl: "https://m.media-amazon.com/images/I/71sBtM3Yi5L._AC_SL1000_.jpg",
    description: "Three engineering students navigate college life and pressure.",
    genre: "Comedy/Drama",
    language: "Hindi",
    duration: "2h 51min",
    releaseDate: new Date("2009-12-25"),
    showTimes: ["9:30 AM", "1:30 PM", "5:30 PM"],
  },
  {
    title: "Avatar",
    posterUrl: "https://m.media-amazon.com/images/I/61OUGpU2-CL._AC_SY679_.jpg",
    description: "A marine on an alien planet must choose sides.",
    genre: "Fantasy",
    language: "English",
    duration: "2h 42min",
    releaseDate: new Date("2009-12-18"),
    showTimes: ["10:00 AM", "3:00 PM", "8:00 PM"],
  },
  {
    title: "Pathaan",
    posterUrl: "https://m.media-amazon.com/images/I/91dSmHDnIPL._AC_SL1500_.jpg",
    description: "An Indian spy faces a terrorist organization.",
    genre: "Action/Thriller",
    language: "Hindi",
    duration: "2h 26min",
    releaseDate: new Date("2023-01-25"),
    showTimes: ["11:00 AM", "3:00 PM", "7:00 PM"],
  },
  {
    title: "KGF Chapter 2",
    posterUrl: "https://m.media-amazon.com/images/I/81rR9mxWneL._AC_SL1500_.jpg",
    description: "Rocky fights to maintain his supremacy.",
    genre: "Action/Drama",
    language: "Kannada",
    duration: "2h 48min",
    releaseDate: new Date("2022-04-14"),
    showTimes: ["10:30 AM", "2:30 PM", "6:30 PM"],
  },
  {
    title: "Drishyam 2",
    posterUrl: "https://m.media-amazon.com/images/I/81iV7CHKr9L._AC_SL1500_.jpg",
    description: "A man’s past resurfaces to threaten his family.",
    genre: "Thriller",
    language: "Hindi",
    duration: "2h 25min",
    releaseDate: new Date("2022-11-18"),
    showTimes: ["12:00 PM", "4:00 PM", "8:00 PM"],
  },
  {
    title: "Jawan",
    posterUrl: "https://m.media-amazon.com/images/I/81z8AsWxJBL._AC_SL1500_.jpg",
    description: "A common man confronts corrupt powers.",
    genre: "Action",
    language: "Hindi",
    duration: "2h 45min",
    releaseDate: new Date("2023-09-07"),
    showTimes: ["9:30 AM", "1:30 PM", "5:30 PM"],
  },
  {
    title: "Oppenheimer",
    posterUrl: "https://m.media-amazon.com/images/I/81nwnHTlR1L._AC_SL1500_.jpg",
    description: "The life story of J. Robert Oppenheimer.",
    genre: "Biography",
    language: "English",
    duration: "3h 0min",
    releaseDate: new Date("2023-07-21"),
    showTimes: ["10:00 AM", "2:00 PM", "6:00 PM"],
  },
  {
    title: "Dunki",
    posterUrl: "https://m.media-amazon.com/images/I/61vMBW1zn7L._AC_SL1500_.jpg",
    description: "A social-comedy about illegal immigration.",
    genre: "Drama",
    language: "Hindi",
    duration: "2h 35min",
    releaseDate: new Date("2023-12-21"),
    showTimes: ["9:00 AM", "1:00 PM", "5:00 PM"],
  },
  {
    title: "Spider-Man: No Way Home",
    posterUrl: "https://m.media-amazon.com/images/I/71T0mM0e5oL._AC_SL1500_.jpg",
    description: "Peter Parker deals with multiverse chaos.",
    genre: "Superhero",
    language: "English",
    duration: "2h 28min",
    releaseDate: new Date("2021-12-17"),
    showTimes: ["10:00 AM", "2:00 PM", "6:00 PM"],
  },
  {
    title: "Baahubali 2",
    posterUrl: "https://m.media-amazon.com/images/I/81NYvfk8JBL._AC_SL1500_.jpg",
    description: "A prince avenges his father’s murder.",
    genre: "Epic",
    language: "Telugu",
    duration: "2h 47min",
    releaseDate: new Date("2017-04-28"),
    showTimes: ["11:00 AM", "3:00 PM", "7:00 PM"],
  },
  {
    title: "Shershaah",
    posterUrl: "https://m.media-amazon.com/images/I/71V1Z0wO9DL._AC_SL1500_.jpg",
    description: "A biopic on war hero Vikram Batra.",
    genre: "Biography",
    language: "Hindi",
    duration: "2h 15min",
    releaseDate: new Date("2021-08-12"),
    showTimes: ["10:30 AM", "2:30 PM", "6:30 PM"],
  },
  {
    title: "Tanhaji",
    posterUrl: "https://m.media-amazon.com/images/I/71OIVDU6pQL._AC_SL1181_.jpg",
    description: "A warrior fights to recapture a fort.",
    genre: "Historical",
    language: "Hindi",
    duration: "2h 15min",
    releaseDate: new Date("2020-01-10"),
    showTimes: ["9:30 AM", "1:30 PM", "5:30 PM"],
  },
  {
    title: "Chhichhore",
    posterUrl: "https://m.media-amazon.com/images/I/71rmW+dHECL._AC_SL1000_.jpg",
    description: "College life, friendship and growing up.",
    genre: "Comedy/Drama",
    language: "Hindi",
    duration: "2h 23min",
    releaseDate: new Date("2019-09-06"),
    showTimes: ["10:00 AM", "2:00 PM", "6:00 PM"],
  },
  {
    title: "Zindagi Na Milegi Dobara",
    posterUrl: "https://m.media-amazon.com/images/I/91xD8HkzdoL._AC_SL1500_.jpg",
    description: "Three friends rediscover life on a trip.",
    genre: "Drama",
    language: "Hindi",
    duration: "2h 33min",
    releaseDate: new Date("2011-07-15"),
    showTimes: ["11:00 AM", "3:00 PM", "7:00 PM"],
  },
  {
    title: "Dilwale Dulhania Le Jayenge",
    posterUrl: "https://m.media-amazon.com/images/I/81O%2BGNdkzKL._AC_SL1500_.jpg",
    description: "Two young people fall in love during a trip.",
    genre: "Romance",
    language: "Hindi",
    duration: "3h 9min",
    releaseDate: new Date("1995-10-20"),
    showTimes: ["10:30 AM", "2:30 PM", "6:30 PM"],
  },
  {
    title: "Barfi!",
    posterUrl: "https://m.media-amazon.com/images/I/71L4dpvbeXL._AC_SL1000_.jpg",
    description: "A deaf-mute boy finds love and friendship.",
    genre: "Romantic Comedy",
    language: "Hindi",
    duration: "2h 31min",
    releaseDate: new Date("2012-09-14"),
    showTimes: ["9:30 AM", "1:30 PM", "5:30 PM"],
  }
];

const seedMovies = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Movie.deleteMany(); // Clears previous movies
    await Movie.insertMany(movies);
    console.log("✅ Movies seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Failed to seed movies:", error);
    process.exit(1);
  }
};

seedMovies();
