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
  } | null;
}

export function useMovements() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: movements = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["movements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movements")
        .select(`
          *,
          equipment (
            serial_number,
            brand,
            model,
            type
          )
        `)
        .order("movement_date", { ascending: false });

      if (error) throw error;
      return data as MovementWithEquipment[];
    },
  });

  const createMovement = useMutation({
    mutationFn: async (newMovement: MovementInsert) => {
      const { data, error } = await supabase
        .from("movements")
        .insert(newMovement)
        .select()
        .single();

      if (error) throw error;

      // Update equipment's current department
      await supabase
        .from("equipment")
        .update({
          current_department: newMovement.destination_department,
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
          type
        )
      `)
      .order("movement_date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as MovementWithEquipment[];
  };

  return {
    movements,
    isLoading,
    error,
    createMovement,
    getRecentMovements,
  };
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
            type
          )
        `)
        .order("movement_date", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as MovementWithEquipment[];
    },
  });
}
