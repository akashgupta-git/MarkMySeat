import React from "react";
import { Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Film, Home, ArrowLeft } from "lucide-react";
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

const NotFound: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center"
  >
    <div className="relative mb-6">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
        <Film className="w-12 h-12 text-primary/60" />
      </div>
      <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl" />
    </div>
    <h1 className="text-6xl font-bold gradient-text-gold mb-2">404</h1>
    <p className="text-gray-400 text-lg mb-1">Scene not found</p>
    <p className="text-gray-600 text-sm mb-8 max-w-sm">
      Looks like this scene was left on the cutting room floor. Let's get you back to the show.
    </p>
    <div className="flex gap-3">
      <Link
        to="/"
        className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-2 shadow-lg shadow-primary/20"
      >
        <Home className="w-4 h-4" />
        Go Home
      </Link>
      <button
        onClick={() => window.history.back()}
        className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-2 border border-white/[0.06]"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Back
      </button>
    </div>
  </motion.div>
);

const App: React.FC = () => {
  const location = useLocation();
  const isTheatreRoute = location.pathname.startsWith("/theatre");
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col bg-dark">
      {!isTheatreRoute && !isAdminRoute && <Navbar />}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
      {!isTheatreRoute && !isAdminRoute && <Footer />}
    </div>
  );
};

export default App;
