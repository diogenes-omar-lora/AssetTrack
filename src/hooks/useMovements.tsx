import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage, logError } from "@/lib/errorHandler";
import { Database } from "@/integrations/supabase/types";

type Movement = Database["public"]["Tables"]["movements"]["Row"];
type MovementInsert = Database["public"]["Tables"]["movements"]["Insert"];

export interface MovementWithEquipment extends Movement {
  equipment: {
    serial_number: string;
    brand: string;
    model: string;
    type: Database["public"]["Enums"]["equipment_type"];
    asset_code: string | null;
    current_building: string | null;
  } | null;
}

interface UseMovementsParams {
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

interface PaginatedMovementsResult {
  data: MovementWithEquipment[];
  count: number;
  totalPages: number;
}

export function useMovements(params?: UseMovementsParams) {
  const { page = 1, pageSize = 50, enabled = true } = params || {};
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["movements", page, pageSize],
    queryFn: async (): Promise<PaginatedMovementsResult> => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("movements")
        .select(`
          *,
          equipment (
            serial_number,
            brand,
            model,
            type,
            asset_code,
            current_building
          )
        `, { count: "exact" })
        .order("movement_date", { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      return {
        data: data as MovementWithEquipment[],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    enabled,
  });

  const movements = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = data?.totalPages || 1;

  const createMovement = useMutation({
    mutationFn: async (newMovement: MovementInsert) => {
      const { data, error } = await supabase
        .from("movements")
        .insert(newMovement)
        .select()
        .single();

      if (error) throw error;

      // Obtener el edificio del departamento de destino
      const { data: deptData } = await supabase
        .from("departments")
        .select("building")
        .eq("name", newMovement.destination_department)
        .single();

      // Update equipment's current department and building
      await supabase
        .from("equipment")
        .update({
          current_department: newMovement.destination_department,
          current_building: deptData?.building?.toLowerCase() || null,
          current_assignee: newMovement.recipient,
          status: "Asignado",
        })
        .eq("id", newMovement.equipment_id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["equipment-stats"] });
      toast({
        title: "Movimiento registrado",
        description: "El movimiento ha sido registrado exitosamente.",
      });
    },
    onError: (error) => {
      logError("createMovement", error);
      const { title, description } = getErrorMessage(error);
      toast({
        variant: "destructive",
        title,
        description,
      });
    },
  });

  const getRecentMovements = async (limit: number = 5) => {
    const { data, error } = await supabase
      .from("movements")
      .select(`
        *,
        equipment (
          serial_number,
          brand,
          model,
          type,
          asset_code,
          current_building
        )
      `)
      .order("movement_date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as MovementWithEquipment[];
  };

  return {
    movements,
    totalCount,
    totalPages,
    isLoading,
    error,
    createMovement,
    getRecentMovements,
  };
}

// Hook para obtener todos los movimientos (usar solo cuando sea necesario, ej: reportes)
export function useAllMovements() {
  return useQuery({
    queryKey: ["movements-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movements")
        .select(`
          *,
          equipment (
            serial_number,
            brand,
            model,
            type,
            asset_code,
            current_building
          )
        `)
        .order("movement_date", { ascending: false });

      if (error) throw error;
      return data as MovementWithEquipment[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useRecentMovements(limit: number = 5) {
  return useQuery({
    queryKey: ["movements", "recent", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movements")
        .select(`
          *,
          equipment (
            serial_number,
            brand,
            model,
            type,
            asset_code,
            current_building
          )
        `)
        .order("movement_date", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as MovementWithEquipment[];
    },
  });
}
