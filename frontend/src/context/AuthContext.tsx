import React, { createContext, useContext, useState, useEffect } from "react";
import type { UserRead } from "../types/api";

interface AuthContextType {
  user: UserRead | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user: UserRead) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("procurex_token")
  );
  const [user, setUser] = useState<UserRead | null>(() => {
    const saved = localStorage.getItem("procurex_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("procurex_token", token);
    } else {
      localStorage.removeItem("procurex_token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("procurex_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("procurex_user");
    }
  }, [user]);

  const login = (newToken: string, newUser: UserRead) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("procurex_token");
    localStorage.removeItem("procurex_user");
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
