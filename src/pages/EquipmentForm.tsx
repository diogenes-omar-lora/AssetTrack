import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { Camera, Save } from "lucide-react";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEquipment } from "@/hooks/useEquipment";
import { useAuth } from "@/hooks/useAuth";
import { useDepartments } from "@/hooks/useDepartments";
import { useEquipmentTypes } from "@/hooks/useEquipmentTypes";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type EquipmentType = Database["public"]["Enums"]["equipment_type"];
type EquipmentStatus = Database["public"]["Enums"]["equipment_status"];

const equipmentStatuses: EquipmentStatus[] = ["Disponible", "Asignado", "En reparación", "Dado de baja"];

export default function EquipmentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { createEquipment, updateEquipment, getEquipmentById } = useEquipment();
  const { departments } = useDepartments();
  const { types: equipmentTypes } = useEquipmentTypes();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    serial_number: "",
    type: "" as EquipmentType | "",
    brand: "",
    model: "",
    status: "Disponible" as EquipmentStatus,
    acquisition_date: "",
    current_building: "",
    current_department: "",
    notes: "",
    asset_code: "",
  });

  const isEditing = !!id;

  const buildingOptions = Array.from(
    new Set(
      departments
        .map((d) => d.building?.toLowerCase()) // Normalizar a minúsculas
        .filter((b): b is string => !!b)
    )
  ).sort((a, b) => a.localeCompare(b));

  const filteredDepartments = formData.current_building
    ? departments.filter(
        (d) => d.building?.toLowerCase() === formData.current_building?.toLowerCase()
      )
    : [];

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getEquipmentById(id).then((equipment) => {
        if (equipment) {
          // Usar current_building si existe, sino calcular del departamento
          let buildingForDept = equipment.current_building?.toLowerCase() || "";
          let departmentValue = equipment.current_department || "";
          
          if (!buildingForDept && equipment.current_department) {
            // Fallback: encontrar el edificio del departamento
            buildingForDept = 
              departments
                .find((d) => d.name === equipment.current_department)
                ?.building?.toLowerCase() || "";
          }

          // SINCRONIZACIÓN: Si hay departamento, usar su edificio como source of truth
          if (departmentValue) {
            const deptInfo = departments.find((d) => d.name === departmentValue);
            if (deptInfo?.building) {
              const correctBuilding = deptInfo.building.toLowerCase();
              // Si el building del equipo no coincide con el del departamento, sincronizar
              if (buildingForDept !== correctBuilding) {
                toast({
                  title: "Sincronización automática",
                  description: `El edificio de "${departmentValue}" se ha actualizado a "${correctBuilding}".`,
                });
                buildingForDept = correctBuilding;
              }
            }
          }

          setFormData({
            serial_number: equipment.serial_number,
            type: equipment.type,
            brand: equipment.brand,
            model: equipment.model,
            status: equipment.status,
            acquisition_date: equipment.acquisition_date || "",
            current_building: buildingForDept,
            current_department: departmentValue,
            notes: "",
            asset_code: equipment.asset_code || "",
          });
        }
        setIsLoading(false);
      });
    }
  }, [id, departments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type) {
      return;
    }

    // VALIDACIÓN: Verificar compatibilidad edificio-departamento
    if (formData.current_building && formData.current_department) {
      const deptInfo = departments.find((d) => d.name === formData.current_department);
      const isDeptCompatible = deptInfo?.building?.toLowerCase() === formData.current_building.toLowerCase();
      
      if (!isDeptCompatible) {
        toast({
          variant: "destructive",
          title: "Error de validación",
          description: `El departamento "${formData.current_department}" no pertenece al edificio "${formData.current_building}". Por favor, seleccione un departamento compatible.`,
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isEditing) {
        const updateData: any = {
          serial_number: formData.serial_number,
          type: formData.type as EquipmentType,
          brand: formData.brand,
          model: formData.model,
          status: formData.status,
          acquisition_date: formData.acquisition_date || null,
          current_building: formData.current_building?.toLowerCase() || null,
          current_department: formData.current_department || null,
          asset_code: formData.asset_code || null,
        };
        
        await updateEquipment.mutateAsync({
          id,
          ...updateData,
        });
      } else {
        const createData: any = {
          serial_number: formData.serial_number,
          type: formData.type as EquipmentType,
          brand: formData.brand,
          model: formData.model,
          status: formData.status,
          acquisition_date: formData.acquisition_date || null,
          current_building: formData.current_building?.toLowerCase() || null,
          current_department: formData.current_department || null,
          asset_code: formData.asset_code || null,
          created_by: user?.id,
        };
        
        await createEquipment.mutateAsync(createData);
      }
      navigate("/equipos");
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <TopNavbar title="Inventario" />
      <div className="p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-4">
          <Link to="/equipos" className="text-primary hover:underline">
            Inventario
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">
            {isEditing ? "Editar Equipo" : "Agregar Nuevo"}
          </span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? "Editar Equipo" : "Agregar Nuevo Equipo"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing
              ? "Actualiza los detalles del equipo en el inventario."
              : "Ingresa los detalles para registrar un nuevo activo en el inventario."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="stat-card space-y-6">
            {/* Image Upload and Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Image Upload */}
              <div>
                <Label className="mb-2 block">Foto del Activo</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[200px] hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="p-3 bg-muted rounded-xl mb-3">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm text-primary font-medium">Subir Imagen</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Formatos soportados: JPG, PNG. Máx: 5MB.
                </p>
              </div>

              {/* Form Fields */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serial">
                    Número de Serie <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="serial"
                    placeholder="ej. SN-4829104"
                    value={formData.serial_number}
                    onChange={(e) =>
                      setFormData({ ...formData, serial_number: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">
                    Tipo <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as EquipmentType })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo de equipo" />
                    </SelectTrigger>
                    <SelectContent>
                        {equipmentTypes.map((type, index) => {
                          const key = typeof type === "string" ? `type-${index}` : type.id;
                          const value = typeof type === "string" ? type : type.name;
                          const label = typeof type === "string" ? type : type.name;
                          return (
                            <SelectItem key={key} value={value}>
                              {label}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">
                    Marca <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="brand"
                    placeholder="ej. Dell, Apple"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">
                    Modelo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="model"
                    placeholder="ej. Latitude 5420"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asset_code">Código de Activo</Label>
                  <Input
                    id="asset_code"
                    placeholder="ej. ACT-001234"
                    value={formData.asset_code}
                    onChange={(e) => setFormData({ ...formData, asset_code: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Status, Date and Department */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado Actual</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as EquipmentStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Fecha de Adquisición</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.acquisition_date}
                  onChange={(e) =>
                    setFormData({ ...formData, acquisition_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="building">Edificio</Label>
                <Select
                  value={formData.current_building || "no-building"}
                  onValueChange={(value) => setFormData({ ...formData, current_building: value === "no-building" ? "" : value, current_department: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar edificio..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-building">Sin edificio</SelectItem>
                    {buildingOptions.map((building) => (
                      <SelectItem key={building} value={building}>
                        {building}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departamento Actual</Label>
              <Select
                value={formData.current_department || "none"}
                onValueChange={(value) => setFormData({ ...formData, current_department: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar departamento..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin departamento</SelectItem>
                  {filteredDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Cualquier daño visible, configuraciones específicas, etc."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => navigate("/equipos")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Guardando..." : isEditing ? "Actualizar Equipo" : "Guardar Equipo"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
