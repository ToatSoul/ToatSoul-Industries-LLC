import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./lib/auth";
import { lazy, Suspense, useEffect } from "react";

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

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

function App() {
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

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <Navbar />
          <div className="flex-grow">
            <Suspense fallback={<Loading />}>
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/forums" component={Forums} />
                <Route path="/forums/category/:categoryId" component={Forums} />
                <Route path="/thread/:id" component={ThreadDetail} />
                <Route path="/profile/:id" component={Profile} />
                <Route path="/new-thread" component={NewThread} />
                <Route path="/store" component={Store} />
                <Route path="/rewards" component={RewardsStore} />
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </div>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;