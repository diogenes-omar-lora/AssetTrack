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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface EquipmentType {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

const EQUIPMENT_TYPES_STORAGE_KEY = "equipment_types_list";

// Función para generar UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
      v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function EquipmentTypesManagement() {
  const [types, setTypes] = useState<EquipmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<EquipmentType | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadEquipmentTypes();
  }, []);

  const loadEquipmentTypes = async () => {
    try {
      setIsLoading(true);
      
      // Intentar cargar de Supabase primero
      try {
        const { data, error } = await (supabase as any)
          .from("equipment_types")
          .select("*")
          .order("name", { ascending: true });

        if (!error && data && Array.isArray(data)) {
          setTypes(data);
          localStorage.setItem(EQUIPMENT_TYPES_STORAGE_KEY, JSON.stringify(data));
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Supabase no disponible, usando localStorage");
      }

      // Fallback a localStorage
      const stored = localStorage.getItem(EQUIPMENT_TYPES_STORAGE_KEY);
      if (stored) {
        setTypes(JSON.parse(stored));
      } else {
        setTypes([]);
      }
    } catch (error) {
      console.error("Error loading equipment types:", error);
      toast.error("Error al cargar tipos de equipos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (type?: EquipmentType) => {
    if (type) {
      setSelectedType(type);
      setFormData({ name: type.name, description: type.description || "" });
    } else {
      setSelectedType(null);
      setFormData({ name: "", description: "" });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedType(null);
    setFormData({ name: "", description: "" });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("El nombre del tipo de equipo es requerido");
      return;
    }

    try {
      let updatedTypes: EquipmentType[];

      if (selectedType) {
        // Update
        updatedTypes = types.map((t) =>
          t.id === selectedType.id ? { ...t, name: formData.name, description: formData.description } : t
        );

        // Sincronizar con Supabase
        try {
          await (supabase as any)
            .from("equipment_types")
            .update({ name: formData.name, description: formData.description, updated_at: new Date().toISOString() })
            .eq("id", selectedType.id);
        } catch (err) {
          console.warn("No se pudo actualizar en Supabase, datos guardados localmente");
        }

        toast.success("Tipo de equipo actualizado correctamente");
      } else {
        // Create
        const newType: EquipmentType = {
          id: generateUUID(),
          name: formData.name,
          description: formData.description,
          created_at: new Date().toISOString(),
        };

        updatedTypes = [...types, newType];

        // Sincronizar con Supabase
        try {
          const { error } = await (supabase as any).from("equipment_types").insert([
            {
              id: newType.id,
              name: newType.name,
              description: newType.description,
              created_at: newType.created_at,
            },
          ]);
          if (error) console.warn("Error al insertar en Supabase:", error);
        } catch (err) {
          console.warn("No se pudo insertar en Supabase, datos guardados localmente");
        }

        toast.success("Tipo de equipo creado correctamente");
      }

      // Guardar localmente
      const sortedTypes = updatedTypes.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setTypes(sortedTypes);
      localStorage.setItem(EQUIPMENT_TYPES_STORAGE_KEY, JSON.stringify(sortedTypes));
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving equipment type:", error);
      toast.error("Error al guardar tipo de equipo");
    }
  };

  const handleDeleteClick = (type: EquipmentType) => {
    setSelectedType(type);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedType) return;

    try {
      const updatedTypes = types.filter((t) => t.id !== selectedType.id);

      // Sincronizar con Supabase
      try {
        await (supabase as any)
          .from("equipment_types")
          .delete()
          .eq("id", selectedType.id);
      } catch (err) {
        console.warn("No se pudo eliminar en Supabase, datos eliminados localmente");
      }

      setTypes(updatedTypes);
      localStorage.setItem(EQUIPMENT_TYPES_STORAGE_KEY, JSON.stringify(updatedTypes));

      toast.success("Tipo de equipo eliminado correctamente");
      setIsDeleteDialogOpen(false);
      setSelectedType(null);
    } catch (error) {
      console.error("Error deleting equipment type:", error);
      toast.error("Error al eliminar tipo de equipo");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [types.length]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Cargando tipos de equipos...</p>
      </div>
    );
  }

  const sortedTypes = [...types].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const totalPages = Math.max(1, Math.ceil(sortedTypes.length / itemsPerPage));
  const paginatedTypes = sortedTypes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 px-6 pb-6 pt-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tipos de Equipos</h1>
          <p className="text-sm text-muted-foreground">
            Administra los tipos de equipos que puedes registrar en el inventario
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Tipo
        </Button>
      </div>

      {/* Tabla de Tipos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Tipos Registrados</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {types.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No hay tipos de equipos registrados</p>
              <Button onClick={() => handleOpenDialog()} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Crear primer tipo
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell className="text-muted-foreground">{type.description || "-"}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(type)}
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(type)}
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

      {sortedTypes.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{paginatedTypes.length}</span> de <span className="font-medium text-foreground">{sortedTypes.length}</span>
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
              {selectedType ? "Editar Tipo de Equipo" : "Nuevo Tipo de Equipo"}
            </DialogTitle>
            <DialogDescription>
              {selectedType ? "Modifica los datos del tipo de equipo." : "Crea un nuevo tipo de equipo para el inventario."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Tipo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Laptop, Monitor, etc."
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del tipo de equipo..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {selectedType ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para confirmar eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>¿Eliminar tipo de equipo?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar "{selectedType?.name}"? Esta acción no se puede deshacer.
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
