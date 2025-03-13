
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  
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
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Login failed");
      }
      
      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };
  
  const register = async (userData: Omit<InsertUser, "password"> & { password: string }): Promise<Omit<User, "password">> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Registration failed");
      }
      
      const newUser = await response.json();
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };
  
  const logout = async (): Promise<void> => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Logout failed");
      }
      
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
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
