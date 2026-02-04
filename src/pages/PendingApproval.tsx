import { Monitor, Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function PendingApproval() {
  const { signOut, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-500/10">
            <Clock className="h-7 w-7 text-yellow-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Cuenta Pendiente de Aprobación
        </h1>
        
        <p className="text-muted-foreground mb-6">
          Hola {profile?.full_name || "Usuario"}, tu cuenta ha sido verificada pero está pendiente de aprobación por un administrador.
        </p>

        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground">
            Un administrador revisará tu solicitud y te notificará cuando tu cuenta sea activada. 
            Este proceso puede tomar hasta 24-48 horas hábiles.
          </p>
        </div>

        <Button 
          variant="outline" 
          onClick={handleSignOut}
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Monitor className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">IT Inventory Manager</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2024 IT Inventory Systems. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
