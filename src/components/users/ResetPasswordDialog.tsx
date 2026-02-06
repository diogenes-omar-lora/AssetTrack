import { useState } from "react";
import { Lock, Eye, EyeOff, Copy } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useResetUserPassword } from "@/hooks/useUserRoles";
import type { UserWithProfile } from "@/hooks/useUserRoles";

interface ResetPasswordDialogProps {
  user: UserWithProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetPasswordDialog({
  user,
  open,
  onOpenChange,
}: ResetPasswordDialogProps) {
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const resetPassword = useResetUserPassword();

  if (!user) return null;

  const handleReset = async () => {
    if (!temporaryPassword.trim()) {
      alert("Por favor ingresa una contraseña temporal");
      return;
    }

    if (temporaryPassword.trim().length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    resetPassword.mutate(
      { userId: user.id, temporaryPassword: temporaryPassword.trim() },
      {
        onSuccess: () => {
          setTemporaryPassword("");
          setTimeout(() => {
            onOpenChange(false);
          }, 1500);
        },
      }
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(temporaryPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-orange-600" />
            <AlertDialogTitle>Resetear Contraseña</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Ingresa una contraseña temporal para <strong>{user.full_name}</strong>. El usuario deberá cambiarla al iniciar sesión.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="temp-password" className="text-sm font-medium">
              Contraseña Temporal
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="temp-password"
                type={showPassword ? "text" : "password"}
                placeholder="Ej: Temporal123!"
                value={temporaryPassword}
                onChange={(e) => setTemporaryPassword(e.target.value)}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Mínimo 6 caracteres. Se recomienda incluir mayúsculas, números y símbolos.
            </p>
          </div>

          {temporaryPassword && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
                Contraseña a configurar:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-sm font-mono">
                  {temporaryPassword}
                </code>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 w-8 p-0"
                >
                  {copied ? "✓" : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReset}
            disabled={!temporaryPassword.trim() || resetPassword.isPending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {resetPassword.isPending ? "Reseteando..." : "Resetear Contraseña"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
