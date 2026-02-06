import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage, logError } from "@/lib/errorHandler";
import type { AppRole } from "@/hooks/useUserRoles";

interface CreateUserParams {
  email: string;
  password: string;
  fullName: string;
  department: string | null;
  role: AppRole | null;
  status: string;
}

interface UpdateUserParams {
  userId: string;
  fullName: string;
  department: string | null;
  role: AppRole | null;
  status: string;
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ email, password, fullName, department, role, status }: CreateUserParams) => {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        throw new Error("No hay sesión activa o token expirado");
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Configuración de Supabase incompleta");
      }

      // Direct fetch with proper headers
      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseAnonKey}`,
            "apikey": supabaseAnonKey,
            "x-user-token": accessToken,
          },
          body: JSON.stringify({ email, password, fullName, department, role, status }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `Error ${response.status}`);
      }

      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsersWithRoles"] });
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente.",
      });
    },
    onError: (error: Error) => {
      logError("createUser", error);
      const { title, description } = getErrorMessage(error);
      toast({
        variant: "destructive",
        title,
        description,
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, fullName, department, role, status }: UpdateUserParams) => {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          department,
          status,
        })
        .eq("user_id", userId);

      if (profileError) throw profileError;

      // Handle role update
      if (role) {
        // Check if user already has a role
        const { data: existingRole } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (existingRole) {
          // Update existing role
          const { error: roleError } = await supabase
            .from("user_roles")
            .update({ role })
            .eq("user_id", userId);

          if (roleError) throw roleError;
        } else {
          // Insert new role
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({ user_id: userId, role });

          if (roleError) throw roleError;
        }
      } else {
        // Remove role if set to none
        await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsersWithRoles"] });
      queryClient.invalidateQueries({ queryKey: ["userRole"] });
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados.",
      });
    },
    onError: (error: Error) => {
      logError("updateUser", error);
      const { title, description } = getErrorMessage(error);
      toast({
        variant: "destructive",
        title,
        description,
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Delete user role first
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      // Delete profile
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsersWithRoles"] });
      toast({
        title: "Usuario eliminado",
        description: "El perfil del usuario ha sido eliminado.",
      });
    },
    onError: (error: Error) => {
      logError("deleteUser", error);
      const { title, description } = getErrorMessage(error);
      toast({
        variant: "destructive",
        title,
        description,
      });
    },
  });
}
