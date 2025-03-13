import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./lib/auth";
import { lazy, Suspense } from "react";

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

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
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