
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

interface AuthModalProps {
  mode: "login" | "signup" | null;
  onClose: () => void;
  onToggleMode: () => void;
}

export default function AuthModal({ mode, onClose, onToggleMode }: AuthModalProps) {
  const { login, register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (mode === "login") {
        await login(formData.username, formData.password);
        onClose();
      } else if (mode === "signup") {
        if (!formData.email || !formData.username || !formData.password) {
          setError("Please fill in all required fields");
          return;
        }
        
        await register({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          name: formData.name,
        });
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  };

  return (
    <Dialog open={mode !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "login" ? "Log In" : "Sign Up"}</DialogTitle>
          <DialogDescription>
            {mode === "login" 
              ? "Enter your credentials to access your account" 
              : "Create a new account to join our community"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              placeholder="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
          
          {mode === "signup" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="flex flex-col space-y-2 pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "login" ? "Log in" : "Sign up"}
            </Button>
            
            <div className="text-center text-sm mt-2">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              <Button variant="link" type="button" onClick={onToggleMode} className="pl-1">
                {mode === "login" ? "Sign up" : "Log in"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
