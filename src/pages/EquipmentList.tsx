import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Edit2, Trash2, Monitor, Laptop, Phone, MoreVertical } from "lucide-react";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEquipment } from "@/hooks/useEquipment";
import { useEquipmentTypes } from "@/hooks/useEquipmentTypes";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";
import {
  ResponsiveTable,
  ResponsiveTableRow,
  ResponsiveTableCell,
  ResponsiveTableHead,
  ResponsiveTableHeaderCell,
} from "@/components/ui/responsive-table";

type EquipmentType = Database["public"]["Enums"]["equipment_type"];
type EquipmentStatus = Database["public"]["Enums"]["equipment_status"];

const StatusBadge = ({ status }: { status: EquipmentStatus }) => {
  const statusClasses: Record<EquipmentStatus, string> = {
    Disponible: "status-badge status-active",
    Asignado: "status-badge status-assigned",
    "En reparación": "status-badge status-repair",
    "Dado de baja": "status-badge status-maintenance",
  };

  return (
    <span className={statusClasses[status] || "status-badge status-active"}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
};

const getEquipmentIcon = (type: EquipmentType) => {
  switch (type) {
    case "Laptop":
      return Laptop;
    case "Teléfono":
      return Phone;
    default:
      return Monitor;
  }
};

export default function EquipmentList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const isMobile = useIsMobile();

  const { equipment, totalCount, totalPages, isLoading, deleteEquipment } = useEquipment({ 
    page: currentPage, 
    pageSize: itemsPerPage 
  });
  const { types } = useEquipmentTypes();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter]);

  // Aplicar filtros locales sobre los datos paginados
  const filteredEquipment = equipment.filter((eq) => {
    const matchesSearch =
      eq.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (eq.asset_code?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesType = typeFilter === "all" || eq.type === typeFilter;
    const matchesStatus = statusFilter === "all" || eq.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Ya no necesitamos ordenar ni paginar del lado del cliente
  const displayedEquipment = filteredEquipment;

  const handleDelete = () => {
    if (deleteId) {
      deleteEquipment.mutate(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <TopNavbar title="Inventario" />
      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="filter-card">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por serial, marca, modelo o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Tipos</SelectItem>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="Asignado">Asignado</SelectItem>
                  <SelectItem value="En reparación">En Reparación</SelectItem>
                  <SelectItem value="Dado de baja">Dado de Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Link to="/equipos/nuevo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Equipo
              </Button>
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="stat-card overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Monitor className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No se encontraron equipos.</p>
              <Link to="/equipos/nuevo" className="text-primary hover:underline text-sm">
                Agregar primer equipo
              </Link>
            </div>
          ) : (
            <ResponsiveTable
              isMobile={isMobile}
              columns={[
                "Equipo",
                "Número de Serie",
                "Tipo",
                "Edificio",
                "Departamento",
                "Asignado A",
                "Estado",
                "Acciones",
              ]}
            >
              {isMobile ? (
                displayedEquipment.map((equipment) => {
                  const Icon = getEquipmentIcon(equipment.type);
                  return (
                    <ResponsiveTableRow
                      key={equipment.id}
                      isMobile
                      label={`Equipo ${equipment.serial_number}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {equipment.brand} {equipment.model}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Código: {equipment.asset_code || "N/A"}
                          </p>
                        </div>
                      </div>
                      <ResponsiveTableCell isMobile label="Número de Serie">
                        {equipment.serial_number}
                      </ResponsiveTableCell>
                      <ResponsiveTableCell isMobile label="Tipo">
                        {equipment.type}
                      </ResponsiveTableCell>
                      <ResponsiveTableCell isMobile label="Edificio">
                        {equipment.current_building || "-"}
                      </ResponsiveTableCell>
                      <ResponsiveTableCell isMobile label="Departamento">
                        {equipment.current_department || "-"}
                      </ResponsiveTableCell>
                      <ResponsiveTableCell isMobile label="Asignado A">
                        {equipment.current_assignee ? (
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                              {equipment.current_assignee
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <span className="text-foreground">
                              {equipment.current_assignee}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Sin asignar</span>
                        )}
                      </ResponsiveTableCell>
                      <ResponsiveTableCell isMobile label="Estado">
                        <StatusBadge status={equipment.status} />
                      </ResponsiveTableCell>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9"
                              aria-label="Acciones del equipo"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/equipos/${equipment.id}/editar`}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(equipment.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </ResponsiveTableRow>
                  );
                })
              ) : (
                <>
                  <ResponsiveTableHead isMobile={false}>
                    <tr className="border-b border-border">
                      <ResponsiveTableHeaderCell>Equipo</ResponsiveTableHeaderCell>
                      <ResponsiveTableHeaderCell>Número de Serie</ResponsiveTableHeaderCell>
                      <ResponsiveTableHeaderCell>Tipo</ResponsiveTableHeaderCell>
                      <ResponsiveTableHeaderCell>Edificio</ResponsiveTableHeaderCell>
                      <ResponsiveTableHeaderCell>Departamento</ResponsiveTableHeaderCell>
                      <ResponsiveTableHeaderCell>Asignado A</ResponsiveTableHeaderCell>
                      <ResponsiveTableHeaderCell>Estado</ResponsiveTableHeaderCell>
                      <ResponsiveTableHeaderCell>Acciones</ResponsiveTableHeaderCell>
                    </tr>
                  </ResponsiveTableHead>
                  <tbody>
                    {displayedEquipment.map((equipment) => {
                      const Icon = getEquipmentIcon(equipment.type);
                      return (
                        <ResponsiveTableRow key={equipment.id} isMobile={false}>
                          <ResponsiveTableCell isMobile={false}>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-muted rounded-lg">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {equipment.brand} {equipment.model}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Código: {equipment.asset_code || "N/A"}
                                </p>
                              </div>
                            </div>
                          </ResponsiveTableCell>
                          <ResponsiveTableCell isMobile={false}>
                            <span className="font-medium text-foreground">
                              {equipment.serial_number}
                            </span>
                          </ResponsiveTableCell>
                          <ResponsiveTableCell isMobile={false}>
                            {equipment.type}
                          </ResponsiveTableCell>
                          <ResponsiveTableCell isMobile={false}>
                            {equipment.current_building || "-"}
                          </ResponsiveTableCell>
                          <ResponsiveTableCell isMobile={false}>
                            {equipment.current_department || "-"}
                          </ResponsiveTableCell>
                          <ResponsiveTableCell isMobile={false}>
                            {equipment.current_assignee ? (
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                                  {equipment.current_assignee
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </div>
                                <span className="text-foreground">{equipment.current_assignee}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic">Sin asignar</span>
                            )}
                          </ResponsiveTableCell>
                          <ResponsiveTableCell isMobile={false}>
                            <StatusBadge status={equipment.status} />
                          </ResponsiveTableCell>
                          <ResponsiveTableCell isMobile={false}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  aria-label="Acciones del equipo"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/equipos/${equipment.id}/editar`}>
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Editar
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setDeleteId(equipment.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </ResponsiveTableCell>
                        </ResponsiveTableRow>
                      );
                    })}
                  </tbody>
                </>
              )}
            </ResponsiveTable>
          )}

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium text-foreground">{displayedEquipment.length}</span> de <span className="font-medium text-foreground">{totalCount}</span>
            </p>
            {totalCount > itemsPerPage && (
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
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar equipo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El equipo será eliminado permanentemente del inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
