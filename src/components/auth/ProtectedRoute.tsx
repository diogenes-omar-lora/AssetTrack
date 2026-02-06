import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, profile, signOut } = useAuth();
  const location = useLocation();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (profile?.status !== "inactive" || isSigningOut) return;

    setIsSigningOut(true);
    signOut()
      .catch(() => undefined)
      .finally(() => {
        setIsSigningOut(false);
      });
  }, [profile?.status, signOut, isSigningOut]);

  if (loading || isSigningOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect pending users to approval page
  if (profile?.status === "pending") {
    return <Navigate to="/pending-approval" replace />;
  }

  // Redirect inactive users to login
  if (profile?.status === "inactive") {
    return <Navigate to="/login" state={{ message: "Tu cuenta esta inactiva." }} replace />;
  }

  return <>{children}</>;
}
