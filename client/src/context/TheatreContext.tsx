import React, { createContext, useState, useEffect } from "react";
import { Theatre } from "../types/User";
import { getTheatreMe } from "../api/theatre";

interface TheatreContextType {
  theatre: Theatre | null;
  setTheatre: (theatre: Theatre | null) => void;
  loading: boolean;
}

export const TheatreContext = createContext<TheatreContextType>({
  theatre: null,
  setTheatre: () => {},
  loading: true,
});

export const TheatreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theatre, setTheatre] = useState<Theatre | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTheatre = async () => {
      try {
        const data = await getTheatreMe();
        if (data) setTheatre(data);
      } catch {
        setTheatre(null);
      } finally {
        setLoading(false);
      }
    };
    checkTheatre();
  }, []);

  return (
    <TheatreContext.Provider value={{ theatre, setTheatre, loading }}>
      {children}
    </TheatreContext.Provider>
  );
};
