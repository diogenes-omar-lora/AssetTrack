import { supabase } from './client';

/**
 * Asegura que la tabla de departamentos exista en Supabase
 * Solo verifica, no intenta crear (se crea vía migrations)
 */
export async function ensureDepartmentsTableExists() {
  try {
    // Intentar hacer un query simple para verificar que la tabla existe
    const { error } = await (supabase as any)
      .from("departments")
      .select("*")
      .limit(1);

    // Si no hay error, la tabla existe
    if (!error) {
      return true;
    }

    // Si hay error, la tabla probablemente no existe aún
    console.warn("Tabla de departamentos no disponible, usando localStorage");
    return false;
  } catch (err) {
    console.warn("Error verificando tabla de departamentos:", err);
    return false;
  }
}

/**
 * Intenta sincronizar departamentos locales con Supabase
 * Sube los departamentos que existen en localStorage a Supabase
 */
export async function syncDepartmentsToSupabase(departments: any[]) {
  try {
    const { error } = await (supabase as any)
      .from("departments")
      .upsert(
        departments.map(d => ({
          id: d.id,
          name: d.name,
          created_at: d.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        })),
        { onConflict: "id" }
      );

    if (error) {
      console.warn("Error sincronizando departamentos:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.warn("Error en sincronización de departamentos:", err);
    return false;
  }
}
