import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { getMovies } from "../api/auth";
import { useNavigate } from "react-router-dom";

interface Movie {
  _id: string;
  title: string;
  poster: string;
}

const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies();
        setMovies(data);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      }
    };
    fetchMovies();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="px-8 py-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">🎬 Now Showing</h1>
      <Slider {...settings}>
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="px-2 cursor-pointer"
            onClick={() => navigate(`/book/${movie._id}`)}
          >
            <img
              src={"/fallback.jpg"}
              alt={movie.title}
              onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
              className="w-full h-72 object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
            />
            <p className="text-center mt-2 font-semibold text-gray-800">
              {movie.title}
            </p>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HomePage;
