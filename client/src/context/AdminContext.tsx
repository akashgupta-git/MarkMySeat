import React, { createContext, useState, useEffect } from "react";
import { getAdminMe } from "../api/admin";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminContextType {
  admin: AdminUser | null;
  setAdmin: (admin: AdminUser | null) => void;
  loading: boolean;
}

export const AdminContext = createContext<AdminContextType>({
  admin: null,
  setAdmin: () => {},
  loading: true,
});

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const data = await getAdminMe();
        if (data) setAdmin(data);
      } catch {
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  return (
    <AdminContext.Provider value={{ admin, setAdmin, loading }}>
      {children}
    </AdminContext.Provider>
  );
};
