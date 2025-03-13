import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { Separator } from "@/components/ui/separator";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Menu, X, Search, ChevronDown } from "lucide-react";
import { AuthModal } from "./auth/auth-modal";

export default function Navbar() {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuthModal, setShowAuthModal] = useState<"login" | "signup" | null>(null);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/forums?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };
  
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  
  const closeAuthModal = () => {
    setShowAuthModal(null);
  };
  
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };
  
  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-primary font-bold text-xl">ToastSoul</span>
                <span className="text-gray-700 font-medium text-lg">Industries</span>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:ml-8 md:flex md:space-x-4">
                <Link href="/">
                  <a className={`px-3 py-2 font-medium rounded-md ${isActive("/") ? "text-gray-900 bg-gray-100" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                    Home
                  </a>
                </Link>
                <Link href="/forums">
                  <a className={`px-3 py-2 font-medium rounded-md ${isActive("/forums") ? "text-gray-900 bg-gray-100" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                    Forums
                  </a>
                </Link>
                <Link href="/resources">
                  <a className={`px-3 py-2 font-medium rounded-md ${isActive("/resources") ? "text-gray-900 bg-gray-100" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                    Resources
                  </a>
                </Link>
                <Link href="/about">
                  <a className={`px-3 py-2 font-medium rounded-md ${isActive("/about") ? "text-gray-900 bg-gray-100" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                    About
                  </a>
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center">
              <div className="relative flex-shrink-0 md:mr-4">
                <div className="md:hidden flex items-center">
                  <button 
                    type="button" 
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={toggleMobileMenu}
                  >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                </div>
                
                {/* Search bar (desktop only) */}
                <div className="hidden md:block">
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input 
                        type="text" 
                        className="block w-full pl-10 pr-3 py-2 border-gray-300 rounded-md text-sm" 
                        placeholder="Search forums..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </form>
                </div>
              </div>
              
              {/* Auth buttons (desktop) */}
              {!user ? (
                <div className="hidden md:flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAuthModal("login")}
                    className="text-sm"
                  >
                    Log in
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => setShowAuthModal("signup")}
                    className="text-sm"
                  >
                    Sign up
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2 h-8">
                        <AvatarWithFallback user={user} className="h-8 w-8" />
                        <span className="text-sm font-medium hidden md:block">
                          {user.name || user.username}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/profile/${user.id}`}>
                          <a className="cursor-pointer w-full">Your Profile</a>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings">
                          <a className="cursor-pointer w-full">Settings</a>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/">
                <a className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/") ? "text-gray-900 bg-gray-100" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
                  Home
                </a>
              </Link>
              <Link href="/forums">
                <a className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/forums") ? "text-gray-900 bg-gray-100" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
                  Forums
                </a>
              </Link>
              <Link href="/resources">
                <a className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/resources") ? "text-gray-900 bg-gray-100" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
                  Resources
                </a>
              </Link>
              <Link href="/about">
                <a className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/about") ? "text-gray-900 bg-gray-100" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
                  About
                </a>
              </Link>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0 w-full">
                  {/* Mobile search */}
                  <form onSubmit={handleSearch}>
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input 
                        type="text" 
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm" 
                        placeholder="Search forums..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </form>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                {!user ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAuthModal("login")} 
                      className="w-full justify-center"
                    >
                      Log in
                    </Button>
                    <Button 
                      variant="default" 
                      onClick={() => setShowAuthModal("signup")} 
                      className="w-full justify-center"
                    >
                      Sign up
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      asChild 
                      className="w-full justify-start"
                    >
                      <Link href={`/profile/${user.id}`}>
                        <a className="flex items-center">
                          <AvatarWithFallback user={user} className="h-6 w-6 mr-2" />
                          Your Profile
                        </a>
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      asChild 
                      className="w-full justify-start"
                    >
                      <Link href="/settings">
                        <a>Settings</a>
                      </Link>
                    </Button>
                    <Separator />
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      Sign out
                    </Button>
                  </>
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
