import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Department {
  id: string;
  name: string;
  building?: string;
  created_at: string;
}

const DEPARTMENTS_STORAGE_KEY = "departments_list";

// Función para generar UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
      v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: "", building: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [buildingFilter, setBuildingFilter] = useState("all");
  const itemsPerPage = 10;

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setIsLoading(true);
      
      // Intentar cargar de Supabase primero
      try {
        const { data, error } = await (supabase as any)
          .from("departments")
          .select("*")
          .order("name", { ascending: true });

        if (!error && data && Array.isArray(data)) {
          setDepartments(data);
          localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(data));
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Supabase not available, using localStorage");
      }

      // Fallback a localStorage
      const stored = localStorage.getItem(DEPARTMENTS_STORAGE_KEY);
      if (stored) {
        setDepartments(JSON.parse(stored));
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error("Error loading departments:", error);
      toast.error("Error al cargar departamentos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (department?: Department) => {
    if (department) {
      setSelectedDepartment(department);
      setFormData({ name: department.name, building: department.building || "" });
    } else {
      setSelectedDepartment(null);
      setFormData({ name: "", building: "" });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedDepartment(null);
    setFormData({ name: "", building: "" });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("El nombre del departamento es requerido");
      return;
    }

    try {
      let updatedDepartments: Department[];
      
      // Normalizar building a minúsculas
      const normalizedBuilding = formData.building.toLowerCase();

      if (selectedDepartment) {
        // Update
        updatedDepartments = departments.map((d) =>
          d.id === selectedDepartment.id
            ? { ...d, name: formData.name, building: normalizedBuilding }
            : d
        );

        // Sincronizar con Supabase
        try {
          await (supabase as any)
            .from("departments")
            .update({ name: formData.name, building: normalizedBuilding || null, updated_at: new Date().toISOString() })
            .eq("id", selectedDepartment.id);
        } catch (err) {
          console.warn("Could not update in Supabase, data saved locally");
        }

        toast.success("Departamento actualizado correctamente");
      } else {
        // Create
        const newDepartment: Department = {
          id: generateUUID(),
          name: formData.name,
          building: normalizedBuilding || undefined,
          created_at: new Date().toISOString(),
        };

        updatedDepartments = [...departments, newDepartment];

        // Sincronizar con Supabase
        try {
          const { error } = await (supabase as any)
            .from("departments")
            .upsert(
              [
                {
                  id: newDepartment.id,
                  name: newDepartment.name,
                  building: newDepartment.building || null,
                  created_at: newDepartment.created_at,
                },
              ],
              { onConflict: "name,building" }
            );
          if (error) {
            console.warn("Supabase upsert error:", error);
            if (error.code === "23505") {
              toast.error("Ya existe un departamento con ese nombre en ese edificio");
            }
          }
        } catch (err) {
          console.warn("No se pudo insertar en Supabase, datos guardados localmente");
        }

        toast.success("Departamento creado correctamente");
      }

      // Guardar localmente
      const sortedDepartments = updatedDepartments.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setDepartments(sortedDepartments);
      localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(sortedDepartments));
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving department:", error);
      toast.error("Error al guardar departamento");
    }
  };

  const handleDeleteClick = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDepartment) return;

    try {
      const updatedDepartments = departments.filter((d) => d.id !== selectedDepartment.id);

      // Sincronizar con Supabase
      try {
        await (supabase as any)
          .from("departments")
          .delete()
          .eq("id", selectedDepartment.id);
      } catch (err) {
        console.warn("Could not delete from Supabase, data deleted locally");
      }

      setDepartments(updatedDepartments);
      localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(updatedDepartments));

      toast.success("Departamento eliminado correctamente");
      setIsDeleteDialogOpen(false);
      setSelectedDepartment(null);
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error("Error al eliminar departamento");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [departments.length, buildingFilter]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Cargando departamentos...</p>
      </div>
    );
  }

  const buildingOptions = Array.from(
    new Set(departments.map((d) => d.building).filter((b): b is string => !!b))
  ).sort((a, b) => a.localeCompare(b));

  const filteredDepartments = buildingFilter === "all"
    ? departments
    : departments.filter((d) => d.building === buildingFilter);

  const sortedDepartments = [...filteredDepartments].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const totalPages = Math.max(1, Math.ceil(sortedDepartments.length / itemsPerPage));
  const paginatedDepartments = sortedDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 px-6 pb-6 pt-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Departamentos</h1>
          <p className="text-sm text-muted-foreground">
            Administra los departamentos para los movimientos de equipos
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Departamento
        </Button>
      </div>

      {/* Tabla de Departamentos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Departamentos Registrados</CardTitle>
          <div className="mt-3 w-full sm:max-w-xs">
            <Select value={buildingFilter} onValueChange={setBuildingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por edificio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los edificios</SelectItem>
                {buildingOptions.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {departments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No hay departamentos registrados</p>
              <Button onClick={() => handleOpenDialog()} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Crear primer departamento
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Edificio</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDepartments.map((department) => (
                    <TableRow key={department.id}>
                      <TableCell className="font-medium">{department.name}</TableCell>
                      <TableCell className="text-muted-foreground">{department.building || "-"}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(department)}
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(department)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {sortedDepartments.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{paginatedDepartments.length}</span> de <span className="font-medium text-foreground">{sortedDepartments.length}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Dialog para crear/editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDepartment ? "Editar Departamento" : "Nuevo Departamento"}
            </DialogTitle>
            <DialogDescription>
              {selectedDepartment ? "Modifica los datos del departamento." : "Crea un nuevo departamento asociado a un edificio."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Departamento</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Almacén, Oficina, Gerencia, etc."
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="building">Edificio</Label>
              <Input
                id="building"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                placeholder="Ej: Edificio A, Sede Central"
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {selectedDepartment ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para confirmar eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>¿Eliminar departamento?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar "{selectedDepartment?.name}"? Esta acción no se puede deshacer.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
