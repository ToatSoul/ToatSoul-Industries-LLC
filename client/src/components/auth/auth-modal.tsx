import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";

interface AuthModalProps {
  mode: "login" | "signup" | null;
  onClose: () => void;
  onToggleMode: () => void;
}

export function AuthModal({ mode, onClose, onToggleMode }: AuthModalProps) {
  if (!mode) return null;
  
  return (
    <Dialog open={!!mode} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === "login" ? "Log in to your account" : "Create an account"}
          </DialogTitle>
          <DialogDescription>
            {mode === "login" 
              ? "Enter your credentials to access the forum." 
              : "Join the ToastSoul Industries community to participate in discussions."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {mode === "login" ? (
            <LoginForm onSuccess={onClose} onToggleMode={onToggleMode} />
          ) : (
            <SignupForm onSuccess={onClose} onToggleMode={onToggleMode} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
