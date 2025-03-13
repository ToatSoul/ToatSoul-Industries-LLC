
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";
import { User, InsertUser } from "@shared/schema";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const fetchCurrentUser = async () => {
      try {
        const userData = await apiRequest<Omit<User, "password">>("/api/auth/current-user");
        setUser(userData);
      } catch (error) {
        // Not logged in, that's fine
        console.log("User not logged in");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await apiRequest<Omit<User, "password">>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      
      setUser(userData);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.username}!`,
        variant: "default",
      });
      
      return userData;
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid username or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<InsertUser, "password"> & { password: string }) => {
    setIsLoading(true);
    try {
      const newUser = await apiRequest<Omit<User, "password">>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      
      setUser(newUser);
      toast({
        title: "Registration successful",
        description: `Welcome to the community, ${newUser.username}!`,
        variant: "default",
      });
      
      return newUser;
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Could not create account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
      });
      
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an issue logging you out",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
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
