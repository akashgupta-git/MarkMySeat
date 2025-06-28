import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BookingPage from "./pages/BookingPage";
import ShowPage from "./pages/ShowPage";
import ConfirmBooking from "./pages/ConfirmBooking";
import SuccessPage from "./pages/SuccessPage";
import BookingHistory from "./pages/BookingHistory";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; // ✅ Import Footer

const App: React.FC = () => {
  const token = localStorage.getItem("token");

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/book/:movieId"
            element={token ? <BookingPage /> : <Navigate to="/login" />}
          />

          <Route
            path="/confirm-booking"
            element={token ? <ConfirmBooking /> : <Navigate to="/login" />}
          />

          <Route
            path="/shows/:id"
            element={token ? <ShowPage /> : <Navigate to="/login" />}
          />

          <Route
            path="/my-bookings"
            element={token ? <BookingHistory /> : <Navigate to="/login" />}
          />

          <Route path="/success" element={<SuccessPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <Footer /> {/* ✅ Displayed at the bottom */}
    </div>
  );
};

export default App;
