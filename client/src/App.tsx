import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./lib/auth";
import { AccessibilityProvider } from "./lib/accessibility-context";
import { AccessibilityMenu } from "./components/accessibility/accessibility-menu";
import { useEffect, useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProtectedRoute, PublicOrProtectedRoute } from "./lib/protected-route";

// Components
import Navbar from "./components/navbar";
import Footer from "./components/footer";

// Pages
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Forums from "@/pages/forums";
import ThreadDetail from "@/pages/thread-detail";
import Profile from "@/pages/profile";
import NewThread from "@/pages/new-thread";
import Store from "@/pages/store";
import RewardsStore from "@/pages/rewards";
import ProfileEdit from "@/pages/profile-edit";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import NewBlogPost from "@/pages/blog-new";
import Projects from "@/pages/projects";
import AuthPage from "@/pages/auth-page";

// Page transition context
interface PageTransitionContextType {
  previousPath: string;
  currentPath: string;
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  previousPath: '/',
  currentPath: '/'
});

// Moved to a separate hook file to avoid Fast Refresh errors
const usePageTransition = () => useContext(PageTransitionContext);

// Page transition wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      transition={{ 
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

function App() {
  const [location] = useLocation();
  const [previousPath, setPreviousPath] = useState('/');
  const [currentPath, setCurrentPath] = useState('/');

  // Update path tracking for transitions
  useEffect(() => {
    if (location !== currentPath) {
      setPreviousPath(currentPath);
      setCurrentPath(location);
    }
  }, [location, currentPath]);

  // Initialize theme from local storage or default to system preference
  useEffect(() => {
    const theme = localStorage.getItem("theme") || "system";
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AccessibilityProvider>
          <PageTransitionContext.Provider value={{ previousPath, currentPath }}>
            <div className="min-h-screen flex flex-col bg-background text-foreground">
              <Navbar />
              <div className="flex-grow">
                <AnimatePresence mode="wait">
                  <PageTransition key={location}>
                    <Switch>
                      <Route path="/" component={Home} />
                      <Route path="/auth" component={AuthPage} />
                      <ProtectedRoute path="/forums" component={Forums} />
                      <ProtectedRoute path="/forums/category/:categoryId" component={Forums} />
                      <ProtectedRoute path="/thread/:id" component={ThreadDetail} />
                      <ProtectedRoute path="/profile/:id" component={Profile} />
                      <ProtectedRoute path="/profile/:id/edit" component={ProfileEdit} />
                      <ProtectedRoute path="/new-thread" component={NewThread} />
                      <ProtectedRoute path="/store" component={Store} />
                      <ProtectedRoute path="/rewards" component={RewardsStore} />
                      <ProtectedRoute path="/blog/new" component={NewBlogPost} />
                      <ProtectedRoute path="/blog/:slug" component={BlogPost} />
                      <ProtectedRoute path="/blog" component={Blog} />
                      <ProtectedRoute path="/projects" component={Projects} />
                      <Route path="*" component={NotFound} />
                    </Switch>
                  </PageTransition>
                </AnimatePresence>
              </div>
              <Footer />
              <AccessibilityMenu />
            </div>
            <Toaster />
          </PageTransitionContext.Provider>
        </AccessibilityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;