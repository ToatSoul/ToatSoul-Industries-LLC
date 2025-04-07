import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./lib/auth";
import { AccessibilityProvider } from "./lib/accessibility-context";
import { AccessibilityMenu } from "./components/accessibility/accessibility-menu";
import { lazy, Suspense, useEffect, useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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

// Page transition context
interface PageTransitionContextType {
  previousPath: string;
  currentPath: string;
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  previousPath: '/',
  currentPath: '/'
});

export const usePageTransition = () => useContext(PageTransitionContext);

// Loading spinner component with animation
function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center"
      >
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" variant="spinner" text="Loading..." />
        </div>
      </motion.div>
    </div>
  );
}

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
                <Suspense fallback={<Loading />}>
                  <AnimatePresence mode="wait">
                    <PageTransition key={location}>
                      <Switch>
                        <Route path="/" component={Home} />
                        <Route path="/forums" component={Forums} />
                        <Route path="/forums/category/:categoryId" component={Forums} />
                        <Route path="/thread/:id" component={ThreadDetail} />
                        <Route path="/profile/:id" component={Profile} />
                        <Route path="/profile/:id/edit" component={ProfileEdit} />
                        <Route path="/new-thread" component={NewThread} />
                        <Route path="/store" component={Store} />
                        <Route path="/rewards" component={RewardsStore} />
                        <Route path="/blog/new" component={NewBlogPost} />
                        <Route path="/blog/:slug" component={BlogPost} />
                        <Route path="/blog" component={Blog} />
                        <Route path="/projects" component={Projects} />
                        <Route path="/" component={Home} />
                        <Route path="*" component={NotFound} />
                      </Switch>
                    </PageTransition>
                  </AnimatePresence>
                </Suspense>
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