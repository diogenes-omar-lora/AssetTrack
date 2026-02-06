import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Monitor, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

// Estilos de animación elegantes
const animationStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInScaleSmooth {
    from {
      opacity: 0;
      transform: scale(0.97);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .fade-in {
    animation: fadeIn 0.6s ease-out forwards;
    opacity: 0;
  }

  .slide-in-up {
    animation: slideInUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    opacity: 0;
  }

  .scale-in-smooth {
    animation: fadeInScaleSmooth 0.5s ease-out forwards;
    opacity: 0;
  }

  .tab-content-fade {
    animation: fadeIn 0.5s ease-in-out;
  }

  .tab-content-size {
    min-height: 340px;
  }

  @media (min-width: 640px) {
    .tab-content-size {
      min-height: 360px;
    }
  }

  .input-smooth {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .button-smooth {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .button-smooth:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }

  .button-smooth:active:not(:disabled) {
    transform: translateY(0);
  }
`;

export default function Login() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [forcePasswordChange, setForcePasswordChange] = useState(false);
  const [forcePasswordChecked, setForcePasswordChecked] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setForcePasswordChange(false);
      setForcePasswordChecked(false);
      return;
    }

    if (forcePasswordChecked) {
      if (!forcePasswordChange) {
        navigate("/dashboard");
      }
      return;
    }

    const checkForcePasswordChange = async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("force_password_change")
        .eq("user_id", user.id)
        .maybeSingle();

      const needsChange = !error && profile && (profile as any).force_password_change === true;
      setForcePasswordChange(needsChange);
      setForcePasswordChecked(true);

      if (!needsChange) {
        navigate("/dashboard");
      }
    };

    checkForcePasswordChange();
  }, [user, loading, navigate, forcePasswordChange, forcePasswordChecked]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setChangePasswordError("");
    try {
      await signIn(email, password);
      setForcePasswordChecked(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      // Error handled in useAuth
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError("");
    
    if (newPassword !== confirmPassword) {
      setChangePasswordError("Las contraseñas no coinciden");
      return;
    }
    
    if (newPassword.length < 6) {
      setChangePasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      // Update profile to remove force_password_change flag
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        await supabase
          .from("profiles")
          .update({
            force_password_change: false,
          } as any)
          .eq("user_id", currentUser.id);
      }

      setForcePasswordChange(false);
      navigate("/dashboard");
    } catch (error: any) {
      setChangePasswordError(error.message || "Error al cambiar la contraseña");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signUp(email, password, fullName);
      // Don't navigate - user needs to verify email
    } catch (error) {
      // Error handled in useAuth
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If force password change is needed
  if (forcePasswordChange) {
    return (
      <div className="login-background min-h-screen flex flex-col items-center justify-center p-4">
        <style>{animationStyles}</style>
        
        <div className="scale-in-smooth w-full max-w-md bg-card rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-6 scale-in-smooth" style={{ animationDelay: "0.1s" }}>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-500/10">
              <AlertCircle className="h-7 w-7 text-orange-500" />
            </div>
          </div>

          <div className="text-center mb-6 slide-in-up" style={{ animationDelay: "0.2s" }}>
            <h1 className="text-2xl font-bold text-foreground">Cambio de Contraseña Requerido</h1>
            <p className="text-muted-foreground mt-2">Tu contraseña temporal ha expirado. Por favor, establece una nueva contraseña.</p>
          </div>

          {changePasswordError && (
            <Alert variant="destructive" className="mb-4 slide-in-up" style={{ animationDelay: "0.25s" }}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{changePasswordError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2 slide-in-up" style={{ animationDelay: "0.3s" }}>
              <Label htmlFor="new-password" className="text-sm font-medium">Nueva Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10 input-smooth border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2 slide-in-up" style={{ animationDelay: "0.35s" }}>
              <Label htmlFor="confirm-password" className="text-sm font-medium">Confirmar Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 input-smooth border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full button-smooth slide-in-up" 
              style={{ animationDelay: "0.4s" }} 
              size="lg" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Cambiando..." : "Cambiar Contraseña"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="login-background min-h-screen flex flex-col items-center justify-center p-4">
      <style>{animationStyles}</style>
      
      {/* Login Card */}
      <div className="scale-in-smooth w-full max-w-md bg-card rounded-2xl shadow-xl p-8" style={{ animationDelay: "0s" }}>
        {/* Logo */}
        <div className="flex justify-center mb-6 scale-in-smooth" style={{ animationDelay: "0.1s" }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Monitor className="h-7 w-7 text-primary" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6 slide-in-up" style={{ animationDelay: "0.2s" }}>
          <h1 className="text-2xl font-bold text-foreground">IT Inventory Manager</h1>
          <p className="text-muted-foreground mt-2">Sistema de Control de Activos de TI</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 slide-in-up" style={{ animationDelay: "0.3s" }}>
            <TabsTrigger value="login" className="transition-all duration-300">Ingresar</TabsTrigger>
            <TabsTrigger value="register" className="transition-all duration-300">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="tab-content-fade tab-content-size">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2 slide-in-up" style={{ animationDelay: "0.1s" }}>
                <Label htmlFor="login-email" className="text-sm font-medium">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="nombre@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 input-smooth border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 slide-in-up" style={{ animationDelay: "0.15s" }}>
                <Label htmlFor="login-password" className="text-sm font-medium">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 input-smooth border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between slide-in-up" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Recordarme
                  </label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full button-smooth slide-in-up" 
                style={{ animationDelay: "0.25s" }} 
                size="lg" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="tab-content-fade tab-content-size">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2 slide-in-up" style={{ animationDelay: "0.1s" }}>
                <Label htmlFor="register-name" className="text-sm font-medium">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Juan Pérez"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 input-smooth border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 slide-in-up" style={{ animationDelay: "0.15s" }}>
                <Label htmlFor="register-email" className="text-sm font-medium">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="nombre@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 input-smooth border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 slide-in-up" style={{ animationDelay: "0.2s" }}>
                <Label htmlFor="register-password" className="text-sm font-medium">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 input-smooth border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full button-smooth slide-in-up" 
                style={{ animationDelay: "0.25s" }} 
                size="lg" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registrando..." : "Crear Cuenta"}
              </Button>

              <p className="text-xs text-muted-foreground text-center slide-in-up" style={{ animationDelay: "0.3s" }}>
                Recibirás un correo de confirmación para activar tu cuenta.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center fade-in" style={{ animationDelay: "0.4s" }}>
        <p className="text-sm text-card/70">
          © 2026 WebSolution. Todos los derechos reservados.
        </p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <a href="#" className="text-sm text-card/70 hover:text-card transition-colors duration-300">
            Política de Privacidad
          </a>
          <span className="text-card/50">•</span>
          <a href="#" className="text-sm text-card/70 hover:text-card transition-colors duration-300">
            Términos de Servicio
          </a>
        </div>
      </div>
    </div>
  );
}
