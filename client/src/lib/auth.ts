import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";
import { User, InsertUser } from "@shared/schema";

interface AuthContextType {
  user: Omit<User, "password"> | null;
  login: (username: string, password: string) => Promise<Omit<User, "password">>;
  register: (userData: Omit<InsertUser, "password"> & { password: string }) => Promise<Omit<User, "password">>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Omit<User, "password"> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Check if user is already logged in on initial load
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/current-user", {
          credentials: "include"
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (username: string, password: string): Promise<Omit<User, "password">> => {
    const response = await apiRequest("POST", "/api/auth/login", { username, password });
    const userData = await response.json();
    setUser(userData);
    return userData;
  };
  
  const register = async (userData: Omit<InsertUser, "password"> & { password: string }): Promise<Omit<User, "password">> => {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    const newUser = await response.json();
    setUser(newUser);
    return newUser;
  };
  
  const logout = async (): Promise<void> => {
    await apiRequest("POST", "/api/auth/logout", {});
    setUser(null);
  };
  
  const value = {
    user,
    login,
    register,
    logout,
    isLoading
  };
  
  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
