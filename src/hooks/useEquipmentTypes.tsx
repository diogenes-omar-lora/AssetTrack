import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EquipmentType {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

const EQUIPMENT_TYPES_STORAGE_KEY = "equipment_types_list";

export const useEquipmentTypes = () => {
  const [types, setTypes] = useState<EquipmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEquipmentTypes();
  }, []);

  const loadEquipmentTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Intentar cargar de Supabase primero (fuente primaria)
      try {
        const { data, error: fetchError } = await (supabase as any)
          .from("equipment_types")
          .select("*")
          .order("name", { ascending: true });

        if (!fetchError && data && Array.isArray(data)) {
          setTypes(data);
          // Actualizar localStorage como caché
          localStorage.setItem(EQUIPMENT_TYPES_STORAGE_KEY, JSON.stringify(data));
          return;
        }
      } catch (err) {
        console.warn("No se pudo cargar de Supabase, usando localStorage como fallback");
      }

      // Fallback a localStorage si Supabase falla
      const stored = localStorage.getItem(EQUIPMENT_TYPES_STORAGE_KEY);
      const localTypes = stored ? JSON.parse(stored) : [];
      
      if (localTypes.length > 0) {
        setTypes(localTypes);
      } else {
        // Fallback a tipos por defecto si no hay nada en localStorage
        const defaultTypes: EquipmentType[] = [
          { id: "1", name: "Laptop", description: "Computadora portátil", created_at: new Date().toISOString() },
          { id: "2", name: "Monitor", description: "Monitor de pantalla", created_at: new Date().toISOString() },
          { id: "3", name: "CPU", description: "Unidad central de procesamiento", created_at: new Date().toISOString() },
          { id: "4", name: "Tablet", description: "Tableta", created_at: new Date().toISOString() },
          { id: "5", name: "Impresora", description: "Dispositivo de impresión", created_at: new Date().toISOString() },
          { id: "6", name: "Servidor", description: "Servidor de red", created_at: new Date().toISOString() },
          { id: "7", name: "Otro", description: "Otro tipo de equipo", created_at: new Date().toISOString() },
        ];
        setTypes(defaultTypes);
        localStorage.setItem(EQUIPMENT_TYPES_STORAGE_KEY, JSON.stringify(defaultTypes));
      }
    } catch (err) {
      console.error("Error loading equipment types:", err);
      setError("Error al cargar tipos de equipos");
      // Último intento: cargar desde localStorage
      const stored = localStorage.getItem(EQUIPMENT_TYPES_STORAGE_KEY);
      if (stored) {
        setTypes(JSON.parse(stored));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    types,
    isLoading,
    error,
    refetch: loadEquipmentTypes,
  };
};
