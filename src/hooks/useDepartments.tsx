import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureDepartmentsTableExists } from "@/integrations/supabase/departmentsSetup";

interface Department {
  id: string;
  name: string;
  building?: string;
  created_at: string;
}

const DEPARTMENTS_STORAGE_KEY = "departments_list";

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDepartments();
  }, []);


  const loadDepartments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Intentar cargar de Supabase primero (fuente primaria)
      try {
        await ensureDepartmentsTableExists();

        const { data, error: fetchError } = await (supabase as any)
          .from("departments")
          .select("*")
          .order("name", { ascending: true });

        if (!fetchError && data && Array.isArray(data)) {
          setDepartments(data);
          // Actualizar localStorage como caché
          localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(data));
          return;
        }
      } catch (err) {
        console.warn("No se pudo cargar de Supabase, usando localStorage como fallback");
      }

      // Fallback a localStorage si Supabase falla
      const stored = localStorage.getItem(DEPARTMENTS_STORAGE_KEY);
      const localDepts = stored ? JSON.parse(stored) : [];
      
      if (localDepts.length > 0) {
        setDepartments(localDepts);
      } else {
        setDepartments([]);
      }
    } catch (err) {
      console.error("Error loading departments:", err);
      setError("Error al cargar departamentos");
      // Último intento: cargar desde localStorage
      const stored = localStorage.getItem(DEPARTMENTS_STORAGE_KEY);
      if (stored) {
        setDepartments(JSON.parse(stored));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    departments,
    isLoading,
    error,
    refetch: loadDepartments,
  };
};
