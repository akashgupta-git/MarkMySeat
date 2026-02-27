import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BookingPage from "./pages/BookingPage";
import ConfirmBooking from "./pages/ConfirmBooking";
import SuccessPage from "./pages/SuccessPage";
import BookingHistory from "./pages/BookingHistory";
import BookingDetail from "./pages/BookingDetail";
import ProfilePage from "./pages/ProfilePage";
import VerifyBookingPage from "./pages/VerifyBookingPage";
import TheatreLogin from "./pages/TheatreLogin";
import TheatreRegister from "./pages/TheatreRegister";
import TheatreDashboard from "./pages/TheatreDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import TheatreProtectedRoute from "./components/TheatreProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

const App: React.FC = () => {
  const location = useLocation();
  const isTheatreRoute = location.pathname.startsWith("/theatre");
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col bg-dark">
      {!isTheatreRoute && !isAdminRoute && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/book/:movieId"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/confirm-booking"
            element={
              <ProtectedRoute>
                <ConfirmBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <BookingHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/:id"
            element={
              <ProtectedRoute>
                <BookingDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/verify/:bookingId" element={<VerifyBookingPage />} />

          {/* Theatre routes */}
          <Route path="/theatre/login" element={<TheatreLogin />} />
          <Route path="/theatre/register" element={<TheatreRegister />} />
          <Route
            path="/theatre/dashboard"
            element={
              <TheatreProtectedRoute>
                <TheatreDashboard />
              </TheatreProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!isTheatreRoute && !isAdminRoute && <Footer />}
    </div>
  );
};

export default App;
