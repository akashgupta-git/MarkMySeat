import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { TheatreProvider } from "./context/TheatreContext";
import { AdminProvider } from "./context/AdminContext";
import { CityProvider } from "./context/CityContext";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <TooltipProvider delayDuration={200}>
        <AuthProvider>
          <CityProvider>
            <TheatreProvider>
              <AdminProvider>
                <App />
                <Toaster />
              </AdminProvider>
            </TheatreProvider>
          </CityProvider>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </React.StrictMode>
);
