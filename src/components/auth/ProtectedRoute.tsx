import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    async function checkUserStatus() {
      if (!user) {
        setCheckingStatus(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();

      setProfileStatus(profile?.status ?? null);
      setCheckingStatus(false);
    }

    if (!loading) {
      checkUserStatus();
    }
  }, [user, loading]);

  if (loading || checkingStatus) {
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
  if (profileStatus === "pending") {
    return <Navigate to="/pending-approval" replace />;
  }

  // Redirect inactive users to login
  if (profileStatus === "inactive") {
    return <Navigate to="/login" state={{ message: "Tu cuenta ha sido desactivada." }} replace />;
  }

  return <>{children}</>;
}
