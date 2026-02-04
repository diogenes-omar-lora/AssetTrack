import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, User, Building, Send, X } from "lucide-react";
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
import { useMovements } from "@/hooks/useMovements";
import { useEquipment } from "@/hooks/useEquipment";
import { useAuth } from "@/hooks/useAuth";
import { useDepartments } from "@/hooks/useDepartments";

export default function MovementForm() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { equipment } = useEquipment();
  const { departments } = useDepartments();
  const { createMovement } = useMovements();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    originBuilding: "",
    originDept: "",
    destBuilding: "",
    destDept: "",
    recipient: "",
    description: "",
  });

  // Filter available equipment (only those that exist)
  const availableEquipment = equipment.filter((eq) =>
    eq.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedEquipments = equipment.filter((eq) => selectedEquipmentIds.includes(eq.id));
  const buildingOptions = Array.from(
    new Set(departments.map((d) => d.building).filter((b): b is string => !!b))
  ).sort((a, b) => a.localeCompare(b));

  const originDepartments = formData.originBuilding
    ? departments.filter((d) => d.building === formData.originBuilding)
    : [];

  const destDepartments = formData.destBuilding
    ? departments.filter((d) => d.building === formData.destBuilding)
    : [];

  const handleAddEquipment = (equipmentId: string) => {
    if (!selectedEquipmentIds.includes(equipmentId)) {
      setSelectedEquipmentIds([...selectedEquipmentIds, equipmentId]);
      
      // Auto-fill origin if first equipment and has department
      if (selectedEquipmentIds.length === 0) {
        const eq = equipment.find((e) => e.id === equipmentId);
        if (eq?.current_department) {
          const deptMatch = departments.find((d) => d.name === eq.current_department);
          setFormData((prev) => ({
            ...prev,
            originDept: eq.current_department || "",
            originBuilding: deptMatch?.building || prev.originBuilding,
          }));
        }
      }
      setSearchTerm("");
    }
  };

  const handleRemoveEquipment = (equipmentId: string) => {
    setSelectedEquipmentIds(selectedEquipmentIds.filter((id) => id !== equipmentId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedEquipmentIds.length === 0 || !formData.originBuilding || !formData.originDept || !formData.destBuilding || !formData.destDept || !formData.recipient) {
      return;
    }

    if (!user) return;

    setIsSubmitting(true);

    try {
      // Create a movement for each selected equipment
      for (const equipmentId of selectedEquipmentIds) {
        await createMovement.mutateAsync({
          equipment_id: equipmentId,
          origin_department: formData.originDept,
          destination_department: formData.destDept,
          recipient: formData.recipient,
          assigner_id: user.id,
          assigner_name: profile?.full_name || user.email || "Usuario",
          description: formData.description || null,
        });
      }
      navigate("/movimientos");
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <TopNavbar title="Movimientos" />
      <div className="p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-4">
          <Link to="/" className="text-primary hover:underline">
            Inicio
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link to="/movimientos" className="text-primary hover:underline">
            Movimientos
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">Registrar Movimiento</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Registrar Movimiento de Equipo</h1>
          <p className="text-muted-foreground mt-1">
            Registra la transferencia de activos entre departamentos o empleados.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="stat-card space-y-6">
            {/* Equipment Search/Select */}
            <div className="space-y-2">
              <Label htmlFor="equipment">
                Seleccionar Equipos <span className="text-destructive">*</span>
              </Label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por Número de Serie, Marca o Modelo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Selected Equipment List */}
              {selectedEquipments.length > 0 && (
                <div className="space-y-2 mb-3">
                  <p className="text-sm font-medium">Equipos seleccionados ({selectedEquipments.length}):</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {selectedEquipments.map((eq) => (
                      <div
                        key={eq.id}
                        className="flex items-center justify-between bg-muted p-2 rounded-md text-sm"
                      >
                        <span className="flex-1">
                          {eq.serial_number} - {eq.brand} {eq.model} ({eq.type})
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEquipment(eq.id)}
                          className="h-6 w-6 p-0 hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Available Equipment Dropdown */}
              {searchTerm && (
                <div className="border rounded-md max-h-60 overflow-y-auto">
                  {availableEquipment.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground text-center">
                      No se encontraron equipos
                    </div>
                  ) : (
                    <div className="divide-y">
                      {availableEquipment
                        .filter((eq) => !selectedEquipmentIds.includes(eq.id))
                        .map((eq) => (
                          <button
                            key={eq.id}
                            type="button"
                            onClick={() => handleAddEquipment(eq.id)}
                            className="w-full text-left p-3 hover:bg-muted transition-colors text-sm"
                          >
                            <div className="font-medium">
                              {eq.serial_number} - {eq.brand} {eq.model}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Tipo: {eq.type} | Estado: {eq.status}
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <hr className="border-border" />

            {/* Departments Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin-building">
                  Edificio Origen <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.originBuilding}
                  onValueChange={(value) => setFormData({ ...formData, originBuilding: value, originDept: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Edificio..." />
                  </SelectTrigger>
                  <SelectContent>
                    {buildingOptions.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin">
                  Departamento Origen <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.originDept}
                  onValueChange={(value) => setFormData({ ...formData, originDept: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Origen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {originDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dest-building">
                  Edificio Destino <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.destBuilding}
                  onValueChange={(value) => setFormData({ ...formData, destBuilding: value, destDept: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Edificio..." />
                  </SelectTrigger>
                  <SelectContent>
                    {buildingOptions.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dest">
                  Departamento Destino <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.destDept}
                  onValueChange={(value) => setFormData({ ...formData, destDept: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Destino..." />
                  </SelectTrigger>
                  <SelectContent>
                    {destDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Recipient and Assigner Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">
                  Nombre del Destinatario <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="recipient"
                    placeholder="Nombre completo del destinatario"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigner">Asignador (Tú)</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="assigner"
                    value={profile?.full_name || user?.email || "Usuario"}
                    disabled
                    className="pl-10 bg-muted"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción Adicional / Notas</Label>
              <Textarea
                id="description"
                placeholder="Agrega detalles específicos sobre la condición del equipo o razón de la transferencia..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => navigate("/movimientos")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Registrando..." : "Confirmar Movimiento"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
