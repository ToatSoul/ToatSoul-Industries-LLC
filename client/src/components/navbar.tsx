import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Menu, X, User, LogOut } from "lucide-react";
import AuthModal from "@/components/auth-modal";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState<"login" | "signup" | null>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeMenu();
  };

  const openLoginModal = () => {
    setShowAuthModal("login");
    closeMenu();
  };

  const openSignupModal = () => {
    setShowAuthModal("signup");
    closeMenu();
  };

  const closeAuthModal = () => {
    setShowAuthModal(null);
  };

  return (
    <>
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-xl font-bold text-primary">
                ToastSoul
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-4">
              <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary/20">
                Home
              </Link>
              <Link href="/forums" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary/20">
                Forums
              </Link>
              <Link href="/store" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary/20">
                Rewards Store
              </Link>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <ThemeToggle />
              
              {user ? (
                <div className="flex items-center space-x-2 ml-2">
                  <Link href={`/profile/${user.id}`}>
                    <Button 
                      variant="ghost" 
                      className="flex items-center space-x-2"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl || ""} alt={user.username} />
                        <AvatarFallback>
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.username}</span>
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2 ml-2">
                  <Button variant="ghost" size="sm" onClick={openLoginModal}>
                    Log in
                  </Button>
                  <Button size="sm" onClick={openSignupModal}>
                    Sign up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-primary hover:bg-secondary/20 focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="container mx-auto px-4 pt-2 pb-3 space-y-1">
              <Link href="/" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-secondary/20">
                Home
              </Link>
              <Link href="/forums" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-secondary/20">
                Forums
              </Link>

              <div className="pt-4 border-t border-border flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Toggle Theme</span>
                  <ThemeToggle />
                </div>
                
                {user ? (
                  <>
                    <Link href={`/profile/${user.id}`}>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={closeMenu}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-500"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button variant="outline" className="w-full" onClick={openLoginModal}>
                      Log in
                    </Button>
                    <Button className="w-full" onClick={openSignupModal}>
                      Sign up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Auth Modals */}
      <AuthModal 
        mode={showAuthModal} 
        onClose={closeAuthModal}
        onToggleMode={() => setShowAuthModal(showAuthModal === "login" ? "signup" : "login")}
      />
    </>
  );
}