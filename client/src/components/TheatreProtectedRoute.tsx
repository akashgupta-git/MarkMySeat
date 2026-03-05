import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { TheatreContext } from "../context/TheatreContext";

const TheatreProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theatre, loading } = useContext(TheatreContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!theatre) {
    return <Navigate to="/theatre/login" />;
  }

  return <>{children}</>;
};

export default TheatreProtectedRoute;