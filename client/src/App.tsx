import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./lib/auth";
import { queryClient } from "./lib/queryClient";

// Components
import Navbar from "./components/navbar";
import Footer from "./components/footer";

// Pages
import Home from "@/pages/home";
import Forums from "@/pages/forums";
import ThreadDetail from "@/pages/thread-detail";
import Profile from "@/pages/profile";
import NewThread from "@/pages/new-thread";
import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/forums" component={Forums} />
            <Route path="/thread/:id" component={ThreadDetail} />
            <Route path="/profile/:id" component={Profile} />
            <Route path="/new-thread" component={NewThread} />
            <Route component={NotFound} />
          </Switch>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}