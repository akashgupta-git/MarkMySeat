import React, { createContext, useState, useEffect, useCallback } from "react";
import { getCities } from "../api/movies";

interface CityContextType {
  /** currently selected city, or empty string for "All Cities" */
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  /** list of cities that have active movie listings */
  cities: string[];
  loading: boolean;
  refreshCities: () => Promise<void>;
}

export const CityContext = createContext<CityContextType>({
  selectedCity: "",
  setSelectedCity: () => {},
  cities: [],
  loading: true,
  refreshCities: async () => {},
});

const STORAGE_KEY = "mms_selectedCity";

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // grab last-picked city from localStorage so it sticks between page reloads
  const [selectedCity, setSelectedCityState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) || ""
  );
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCities();
      setCities(data);

      // if the user's saved city disappeared from the list, fall back to "All Cities"
      if (selectedCity && data.length > 0 && !data.some(
        (c) => c.toLowerCase() === selectedCity.toLowerCase()
      )) {
        setSelectedCityState("");
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // cities are nice-to-have — the app works fine without them
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const setSelectedCity = (city: string) => {
    setSelectedCityState(city);
    if (city) {
      localStorage.setItem(STORAGE_KEY, city);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <CityContext.Provider
      value={{ selectedCity, setSelectedCity, cities, loading, refreshCities: fetchCities }}
    >
      {children}
    </CityContext.Provider>
  );
};