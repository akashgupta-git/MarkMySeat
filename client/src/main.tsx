import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { TheatreProvider } from "./context/TheatreContext";
import { AdminProvider } from "./context/AdminContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TheatreProvider>
          <AdminProvider>
            <App />
          </AdminProvider>
        </TheatreProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);