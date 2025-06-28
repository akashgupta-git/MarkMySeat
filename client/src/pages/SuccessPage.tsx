import React from "react";
import { Link } from "react-router-dom";

const SuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-green-50">
      <h1 className="text-4xl font-bold text-green-700">🎉 Booking Successful!</h1>
      <p className="mt-4 text-lg">Your tickets have been booked. Enjoy your movie!</p>
      <Link to="/" className="mt-6 text-blue-600 underline">
        Go to Home
      </Link>
    </div>
  );
};

export default SuccessPage;
