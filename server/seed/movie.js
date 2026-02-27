const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Movie = require("../models/Movie");

dotenv.config();

const movies = [
  {
    title: "Inception",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
    description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
    genre: "Sci-Fi",
    language: "English",
    duration: "2h 28min",
    releaseDate: new Date("2010-07-16"),
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "The Dark Knight",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
    description: "When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological and physical tests of his ability.",
    genre: "Action",
    language: "English",
    duration: "2h 32min",
    releaseDate: new Date("2008-07-18"),
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "Interstellar",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival as Earth becomes uninhabitable.",
    genre: "Sci-Fi",
    language: "English",
    duration: "2h 49min",
    releaseDate: new Date("2014-11-07"),
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "RRR",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BODUwNDNjYzctODUxNy00ZTA2LWIyYTEtMDc5Y2E5ZjBmNTMzXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg",
    description: "A tale of two legendary Indian revolutionaries and their journey far away from home during the British Raj.",
    genre: "Action",
    language: "Telugu",
    duration: "3h 7min",
    releaseDate: new Date("2022-03-25"),
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "3 Idiots",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BNTkyOGVjMGEtNmQzZi00NzFlLTlhOWQtODYyMDJlZDVlMDVhXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    description: "Two friends search for their long-lost companion while revisiting memories of their time at Imperial College of Engineering.",
    genre: "Comedy",
    language: "Hindi",
    duration: "2h 51min",
    releaseDate: new Date("2009-12-25"),
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "Avatar",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BZDA0OGQxNTItMDZkMC00N2UyLTg3MzMtYTJmNjg3Nzk5MzRiXkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_.jpg",
    description: "A paraplegic marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.",
    genre: "Sci-Fi",
    language: "English",
    duration: "2h 42min",
    releaseDate: new Date("2009-12-18"),
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "Pathaan",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BM2I0ZDFiMmUtNmY0OC00NjA5LTgxMmQtMDM3NjQyOGNhNDg3XkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg",
    description: "An Indian spy takes on the leader of a group of mercenaries who have nefarious plans to target his homeland.",
    genre: "Action",
    language: "Hindi",
    duration: "2h 26min",
    releaseDate: new Date("2023-01-25"),
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "KGF Chapter 2",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BY2Y5ZWMwMDUtNDhkYy00MmRiLTg1Y2YtYTlhNDkyMmUzZTY2XkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg",
    description: "Rocky's return to the blood-soaked Kolar Gold Fields as he seeks to fulfill his mother's dying wish of becoming the most powerful man in the world.",
    genre: "Action",
    language: "Kannada",
    duration: "2h 48min",
    releaseDate: new Date("2022-04-14"),
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "Drishyam 2",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BYjk0MTgzMmQtZmY3Yy00NmFkLTk0MzgtNGRhYjYzNTY1MGExXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg",
    description: "A gripping sequel where Vijay Salgaonkar's carefully constructed alibi begins crumbling when a determined police officer reopens the investigation.",
    genre: "Thriller",
    language: "Hindi",
    duration: "2h 25min",
    releaseDate: new Date("2022-11-18"),
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "Jawan",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BNTQzNjc0OTQtOTFkYy00MDg1LThlZWEtYzQ4YTBmNTRhYTM2XkEyXkFqcGdeQXVyMTUyNjIwMDEw._V1_.jpg",
    description: "A prison warden recruits inmates to commit acts of vigilantism that bring him face-to-face with a corrupt politician.",
    genre: "Action",
    language: "Hindi",
    duration: "2h 45min",
    releaseDate: new Date("2023-09-07"),
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "Oppenheimer",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_.jpg",
    description: "The story of J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    genre: "Drama",
    language: "English",
    duration: "3h 0min",
    releaseDate: new Date("2023-07-21"),
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "Dunki",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BYjlhN2M0ZmQtN2RhNy00YjVhLTliMjktYzRjMWE4NjRiMTRmXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg",
    description: "Four friends from a small village in Punjab dream of migrating abroad and embark on a journey through the illegal route known as 'donkey flight'.",
    genre: "Drama",
    language: "Hindi",
    duration: "2h 35min",
    releaseDate: new Date("2023-12-21"),
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "Spider-Man: No Way Home",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BZWMyYzFjYTYtNTRjYi00OGExLWE2YzgtOGRmYjAxZTU3NzBiXkEyXkFqcGdeQXVyMzQ0MzA0NTM@._V1_.jpg",
    description: "When spell to make the world forget Peter Parker goes wrong, the multiverse is ripped open, bringing visitors from other realities.",
    genre: "Action",
    language: "English",
    duration: "2h 28min",
    releaseDate: new Date("2021-12-17"),
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "Baahubali 2",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BOTYzODA5MjctMjdlMS00NGM2LTliZGQtMjQ3Y2E1NDFhY2FmXkEyXkFqcGdeQXVyNjQ2MjQ5NzM@._V1_.jpg",
    description: "When Shiva learns about his heritage as the son of Baahubali, he begins to look for answers. His story parallels his father's as both face their destinies.",
    genre: "Action",
    language: "Telugu",
    duration: "2h 47min",
    releaseDate: new Date("2017-04-28"),
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "Shershaah",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMjgyNGYxMjktN2JmMS00ZjVjLTkyMjAtNGJjMjlkZjQ2MWI0XkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg",
    description: "The true story of Captain Vikram Batra, who led his troops to victory in the Kargil War with his inspiring courage and audacious battle strategies.",
    genre: "Drama",
    language: "Hindi",
    duration: "2h 15min",
    releaseDate: new Date("2021-08-12"),
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "Tanhaji",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BNmMwMTczN2EtY2Y0NC00NDE0LTk1MjYtZGRhMGMxZWIzMjdlXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg",
    description: "The legendary Maratha warrior Tanhaji Malusare fights to capture the strategically important Kondhana Fort from the Mughal empire.",
    genre: "Action",
    language: "Hindi",
    duration: "2h 15min",
    releaseDate: new Date("2020-01-10"),
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "Chhichhore",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMGVkNGM0MDctZmM3Ni00MjVjLWEyNTUtMmIyNmExNGNiMGIwXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg",
    description: "A man narrates the story of his college days and how their group of friends who were known as losers overcame every challenge to become winners.",
    genre: "Comedy",
    language: "Hindi",
    duration: "2h 23min",
    releaseDate: new Date("2019-09-06"),
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "Zindagi Na Milegi Dobara",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BYjUyNjgwMTg0MV5BMl5BanBnXkFtZTcwNDQyMTEwNg@@._V1_.jpg",
    description: "Three college friends reunite for a bachelor road trip across Spain, facing fears and rediscovering the joys of life.",
    genre: "Drama",
    language: "Hindi",
    duration: "2h 33min",
    releaseDate: new Date("2011-07-15"),
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "Dilwale Dulhania Le Jayenge",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BNDdjYjI0MjUtOTEwNC00NzUzLWJjN2QtODI2M2IzOWFjMWFlXkEyXkFqcGdeQXVyNDY5MTUyNjc@._V1_.jpg",
    description: "Raj and Simran fall in love during a trip across Europe, but cultural expectations and family honour stand in their way.",
    genre: "Romance",
    language: "Hindi",
    duration: "3h 9min",
    releaseDate: new Date("1995-10-20"),
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "Barfi!",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMTUzNjk1MjA0OV5BMl5BanBnXkFtZTcwODgyMjY0OA@@._V1_.jpg",
    description: "A hearing and speech-impaired young man navigates love and friendship with his quirky charm, winning hearts along the way.",
    genre: "Romance",
    language: "Hindi",
    duration: "2h 31min",
    releaseDate: new Date("2012-09-14"),
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"],
  }
];

const seedMovies = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Movie.deleteMany();
    await Movie.insertMany(movies);
    console.log("Movies seeded successfully");
    process.exit();
  } catch (error) {
    console.error("Failed to seed movies:", error);
    process.exit(1);
  }
};

seedMovies();
