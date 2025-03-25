import { useState } from "react";
import Link from "wouter/link";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { ThemeToggle } from "./theme-toggle";

export default function Navbar({ 
  user, 
  handleLogout, 
  openLoginModal, 
  openSignupModal 
}: {
  user?: { id: number; username: string; avatarUrl?: string };
  handleLogout: () => void;
  openLoginModal: () => void;
  openSignupModal: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center justify-between">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-4">
              <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary/20">
                Home
              </Link>
              <Link href="/forums" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary/20">
                Forums
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
              {user ? (
                <>
                  <Link href={`/profile/${user.id}`} onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-secondary/20">
                    Profile
                  </Link>
                  <button onClick={() => { closeMenu(); handleLogout(); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-secondary/20">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { closeMenu(); openLoginModal(); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-secondary/20">
                    Log in
                  </button>
                  <button onClick={() => { closeMenu(); openSignupModal(); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-secondary/20">
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}