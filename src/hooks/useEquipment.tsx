import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage, logError } from "@/lib/errorHandler";
import { Database } from "@/integrations/supabase/types";

type Equipment = Database["public"]["Tables"]["equipment"]["Row"];
type EquipmentInsert = Database["public"]["Tables"]["equipment"]["Insert"];
type EquipmentUpdate = Database["public"]["Tables"]["equipment"]["Update"];

interface UseEquipmentParams {
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

interface PaginatedEquipmentResult {
  data: Equipment[];
  count: number;
  totalPages: number;
}

export function useEquipment(params?: UseEquipmentParams) {
  const { page = 1, pageSize = 50, enabled = true } = params || {};
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["equipment", page, pageSize],
    queryFn: async (): Promise<PaginatedEquipmentResult> => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("equipment")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      return {
        data: data as Equipment[],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    enabled,
  });

  const equipment = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = data?.totalPages || 1;

  const createEquipment = useMutation({
    mutationFn: async (newEquipment: EquipmentInsert) => {
      const { data, error } = await supabase
        .from("equipment")
        .insert(newEquipment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast({
        title: "Equipo creado",
        description: "El equipo ha sido registrado exitosamente.",
      });
    },
    onError: (error) => {
      logError("createEquipment", error);
      const { title, description } = getErrorMessage(error);
      toast({
        variant: "destructive",
        title,
        description,
      });
    },
  });

  const updateEquipment = useMutation({
    mutationFn: async ({ id, ...updates }: EquipmentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("equipment")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast({
        title: "Equipo actualizado",
        description: "El equipo ha sido actualizado exitosamente.",
      });
    },
    onError: (error) => {
      logError("updateEquipment", error);
      const { title, description } = getErrorMessage(error);
      toast({
        variant: "destructive",
        title,
        description,
      });
    },
  });

  const deleteEquipment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("equipment").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast({
        title: "Equipo eliminado",
        description: "El equipo ha sido eliminado del inventario.",
      });
    },
    onError: (error) => {
      logError("deleteEquipment", error);
      const { title, description } = getErrorMessage(error);
      toast({
        variant: "destructive",
        title,
        description,
      });
    },
  });

  const getEquipmentById = async (id: string) => {
    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as Equipment | null;
  };

  return {
    equipment,
    totalCount,
    totalPages,
    isLoading,
    error,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    getEquipmentById,
  };
}

// Hook para obtener todos los equipos (usar solo cuando sea necesario)
export function useAllEquipment() {
  return useQuery({
    queryKey: ["equipment-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Equipment[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useEquipmentStats() {
  return useQuery({
    queryKey: ["equipment-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("equipment").select("*");

      if (error) throw error;

      const total = data.length;
      const assigned = data.filter((e) => e.status === "Asignado").length;
      const available = data.filter((e) => e.status === "Disponible").length;
      const inRepair = data.filter((e) => e.status === "En reparación").length;

      const byType = {
        Laptop: data.filter((e) => e.type === "Laptop").length,
        Monitor: data.filter((e) => e.type === "Monitor").length,
        CPU: data.filter((e) => e.type === "CPU").length,
        Tablet: data.filter((e) => e.type === "Tablet").length,
        Impresora: data.filter((e) => e.type === "Impresora").length,
        Servidor: data.filter((e) => e.type === "Servidor").length,
        Teléfono: data.filter((e) => e.type === "Teléfono").length,
        Otro: data.filter((e) => e.type === "Otro").length,
      };

      // Group by department
      const departmentCounts: Record<string, number> = {};
      data.forEach((e) => {
        const dept = e.current_department || "Sin asignar";
        departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
      });

      const byDepartment = Object.entries(departmentCounts).map(([name, value]) => ({
        name,
        value,
      }));

      return { total, assigned, available, inRepair, byType, byDepartment };
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
}
