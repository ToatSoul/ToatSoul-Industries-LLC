import { ReactNode } from "react";
import { Route, useLocation, RouteComponentProps } from "wouter";
import { useAuth } from "./auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!user) {
          // Redirect to login page if user is not authenticated
          setTimeout(() => setLocation("/auth"), 100);
          return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        return <Component />;
      }}
    </Route>
  );
}

export function PublicOrProtectedRoute({
  path,
  component: Component,
  fallback,
}: {
  path: string;
  component: React.ComponentType;
  fallback: ReactNode;
}) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!user && fallback) {
          return <>{fallback}</>;
        }

        return <Component />;
      }}
    </Route>
  );
}