import { useState, useMemo } from "react";
import { FileText, Download, Filter, TrendingUp, Wrench, Users, Monitor, Loader2, Laptop, Phone, Package, ArrowLeftRight, Tablet, Printer, Server } from "lucide-react";
import * as XLSX from "xlsx";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEquipment, useEquipmentStats } from "@/hooks/useEquipment";
import { useMovements } from "@/hooks/useMovements";
import { format, subDays, subMonths, startOfYear, isAfter } from "date-fns";
import { es } from "date-fns/locale";

const StatusBadge = ({ status }: { status: string }) => {
  const statusClasses: Record<string, string> = {
    "Disponible": "status-badge status-active",
    "Asignado": "status-badge status-maintenance",
    "En reparación": "status-badge status-repair",
    "Dado de baja": "status-badge bg-muted text-muted-foreground",
  };

  return (
    <span className={statusClasses[status] || "status-badge status-active"}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
};

const EquipmentIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactNode> = {
    "Laptop": <Laptop className="h-4 w-4 text-muted-foreground" />,
    "Monitor": <Monitor className="h-4 w-4 text-muted-foreground" />,
    "CPU": <Server className="h-4 w-4 text-muted-foreground" />,
    "Tablet": <Tablet className="h-4 w-4 text-muted-foreground" />,
    "Impresora": <Printer className="h-4 w-4 text-muted-foreground" />,
    "Servidor": <Server className="h-4 w-4 text-muted-foreground" />,
    "Otro": <Package className="h-4 w-4 text-muted-foreground" />,
  };
  return icons[type] || <Package className="h-4 w-4 text-muted-foreground" />;
};

export default function Reports() {
  const [dateRange, setDateRange] = useState("all");
  const [department, setDepartment] = useState("all");
  const [equipmentType, setEquipmentType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Movement filters
  const [movementDateRange, setMovementDateRange] = useState("all");
  const [originDept, setOriginDept] = useState("all");
  const [destDept, setDestDept] = useState("all");

  const { equipment, isLoading } = useEquipment();
  const { data: stats, isLoading: statsLoading } = useEquipmentStats();
  const { movements, isLoading: movementsLoading } = useMovements();

  // Get unique departments from equipment data
  const departments = useMemo(() => {
    const depts = new Set<string>();
    equipment.forEach((e) => {
      if (e.current_department) depts.add(e.current_department);
    });
    return Array.from(depts).sort();
  }, [equipment]);

  // Get unique departments from movements
  const movementDepartments = useMemo(() => {
    const depts = new Set<string>();
    movements.forEach((m) => {
      if (m.origin_department) depts.add(m.origin_department);
      if (m.destination_department) depts.add(m.destination_department);
    });
    return Array.from(depts).sort();
  }, [movements]);

  // Filter equipment based on selected filters
  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      // Date filter
      if (dateRange !== "all" && item.acquisition_date) {
        const acquisitionDate = new Date(item.acquisition_date);
        let startDate: Date;

        switch (dateRange) {
          case "7days":
            startDate = subDays(new Date(), 7);
            break;
          case "30days":
            startDate = subDays(new Date(), 30);
            break;
          case "90days":
            startDate = subMonths(new Date(), 3);
            break;
          case "year":
            startDate = startOfYear(new Date());
            break;
          default:
            startDate = new Date(0);
        }

        if (!isAfter(acquisitionDate, startDate)) {
          return false;
        }
      }

      // Department filter
      if (department !== "all" && item.current_department !== department) {
        return false;
      }

      // Type filter
      if (equipmentType !== "all" && item.type !== equipmentType) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [equipment, dateRange, department, equipmentType, statusFilter]);

  // Filter movements based on selected filters
  const filteredMovements = useMemo(() => {
    return movements.filter((item) => {
      // Date filter
      if (movementDateRange !== "all") {
        const movementDate = new Date(item.movement_date);
        let startDate: Date;

        switch (movementDateRange) {
          case "7days":
            startDate = subDays(new Date(), 7);
            break;
          case "30days":
            startDate = subDays(new Date(), 30);
            break;
          case "90days":
            startDate = subMonths(new Date(), 3);
            break;
          case "year":
            startDate = startOfYear(new Date());
            break;
          default:
            startDate = new Date(0);
        }

        if (!isAfter(movementDate, startDate)) {
          return false;
        }
      }

      // Origin department filter
      if (originDept !== "all" && item.origin_department !== originDept) {
        return false;
      }

      // Destination department filter
      if (destDept !== "all" && item.destination_department !== destDept) {
        return false;
      }

      return true;
    });
  }, [movements, movementDateRange, originDept, destDept]);

  const handleExportEquipmentCSV = () => {
    const headers = ["Número de Serie", "Código de Activo", "Marca", "Modelo", "Tipo", "Asignado A", "Departamento", "Edificio", "Fecha Adquisición", "Estado"];
    const rows = filteredEquipment.map((item) => ({
      "Número de Serie": item.serial_number,
      "Código de Activo": item.asset_code || "-",
      "Marca": item.brand,
      "Modelo": item.model,
      "Tipo": item.type,
      "Asignado A": item.current_assignee || "Sin asignar",
      "Departamento": item.current_department || "Sin departamento",
      "Edificio": item.current_building || "-",
      "Fecha Adquisición": item.acquisition_date ? format(new Date(item.acquisition_date), "dd/MM/yyyy") : "N/A",
      "Estado": item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");
    XLSX.writeFile(workbook, `reporte-inventario-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  const handleExportMovementsCSV = () => {
    const rows = filteredMovements.map((item) => ({
      "Fecha": format(new Date(item.movement_date), "dd/MM/yyyy HH:mm"),
      "Equipo": item.equipment ? `${item.equipment.brand} ${item.equipment.model}` : "N/A",
      "Número de Serie": item.equipment?.serial_number || "N/A",
      "Origen": item.origin_department,
      "Destino": item.destination_department,
      "Receptor": item.recipient,
      "Responsable": item.assigner_name,
      "Descripción": item.description || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Movimientos");
    XLSX.writeFile(workbook, `reporte-movimientos-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  const utilizationRate = stats ? Math.round((stats.assigned / stats.total) * 100) || 0 : 0;

  return (
    <>
      <TopNavbar title="Reportes" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reportes de Inventario</h1>
            <p className="text-muted-foreground mt-1">
              Genera información y rastrea la distribución de activos en la organización.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Equipos</p>
              <Monitor className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <p className="text-3xl font-bold text-foreground">{stats?.total || 0}</p>
              )}
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Disponibles</p>
              <TrendingUp className="h-5 w-5 text-status-active" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <p className="text-3xl font-bold text-foreground">{stats?.available || 0}</p>
              )}
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">En Reparación</p>
              <Wrench className="h-5 w-5 text-status-repair" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-foreground">{stats?.inRepair || 0}</p>
                  {(stats?.inRepair || 0) > 0 && (
                    <span className="text-xs text-status-repair font-medium">Acción Necesaria</span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Asignados</p>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-foreground">{stats?.assigned || 0}</p>
                  <span className="text-xs text-status-active font-medium">{utilizationRate}% Utilizados</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs for Equipment and Movements Reports */}
        <Tabs defaultValue="equipment" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Equipos
            </TabsTrigger>
            <TabsTrigger value="movements" className="flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              Movimientos
            </TabsTrigger>
          </TabsList>

          {/* Equipment Report Tab */}
          <TabsContent value="equipment" className="space-y-4">
            {/* Export Button */}
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleExportEquipmentCSV} disabled={filteredEquipment.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exportar a Excel
              </Button>
            </div>

            {/* Filters */}
            <div className="filter-card space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Filter className="h-4 w-4" />
                Filtrar Datos
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Rango de Fechas</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las fechas</SelectItem>
                      <SelectItem value="7days">Últimos 7 días</SelectItem>
                      <SelectItem value="30days">Últimos 30 días</SelectItem>
                      <SelectItem value="90days">Últimos 90 días</SelectItem>
                      <SelectItem value="year">Este año</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Departamento</label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Departamentos</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Tipo de Equipo</label>
                  <Select value={equipmentType} onValueChange={setEquipmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Tipos</SelectItem>
                      <SelectItem value="Laptop">Laptop</SelectItem>
                      <SelectItem value="Monitor">Monitor</SelectItem>
                      <SelectItem value="Teléfono">Teléfono</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Estado</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquier Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Cualquier Estado</SelectItem>
                      <SelectItem value="Disponible">Disponible</SelectItem>
                      <SelectItem value="Asignado">Asignado</SelectItem>
                      <SelectItem value="En reparación">En Reparación</SelectItem>
                      <SelectItem value="Dado de baja">Dado de Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="stat-card overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredEquipment.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground">No hay equipos que coincidan</p>
                  <p className="text-muted-foreground mt-1">Ajusta los filtros para ver más resultados</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr className="border-b border-border">
                          <th>Número de Serie</th>
                          <th>Equipo</th>
                          <th>Tipo</th>
                          <th>Asignado A</th>
                          <th>Departamento</th>
                          <th>Edificio</th>
                          <th>Fecha Adquisición</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEquipment.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-lg">
                                  <EquipmentIcon type={item.type} />
                                </div>
                                <span className="font-medium text-foreground">{item.serial_number}</span>
                              </div>
                            </td>
                            <td className="text-foreground">{item.brand} {item.model}</td>
                            <td className="text-foreground">{item.type}</td>
                            <td>
                              {item.current_assignee ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                                    {item.current_assignee
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .slice(0, 2)
                                      .toUpperCase()}
                                  </div>
                                  <span className="text-foreground">{item.current_assignee}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic">Sin asignar</span>
                              )}
                            </td>
                            <td className="text-foreground">{item.current_department || <span className="text-muted-foreground italic">N/A</span>}</td>
                            <td className="text-foreground">{item.current_building || <span className="text-muted-foreground italic">-</span>}</td>
                            <td className="text-muted-foreground">
                              {item.acquisition_date
                                ? format(new Date(item.acquisition_date), "dd MMM yyyy", { locale: es })
                                : "N/A"}
                            </td>
                            <td>
                              <StatusBadge status={item.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Results count */}
                  <div className="flex items-center justify-between px-4 py-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Mostrando <span className="font-medium text-foreground">{filteredEquipment.length}</span> de{" "}
                      <span className="font-medium text-foreground">{equipment.length}</span> equipos
                    </p>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Movements Report Tab */}
          <TabsContent value="movements" className="space-y-4">
            {/* Export Button */}
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleExportMovementsCSV} disabled={filteredMovements.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exportar a Excel
              </Button>
            </div>

            {/* Filters */}
            <div className="filter-card space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Filter className="h-4 w-4" />
                Filtrar Movimientos
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Rango de Fechas</label>
                  <Select value={movementDateRange} onValueChange={setMovementDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las fechas</SelectItem>
                      <SelectItem value="7days">Últimos 7 días</SelectItem>
                      <SelectItem value="30days">Últimos 30 días</SelectItem>
                      <SelectItem value="90days">Últimos 90 días</SelectItem>
                      <SelectItem value="year">Este año</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Departamento Origen</label>
                  <Select value={originDept} onValueChange={setOriginDept}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {movementDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Departamento Destino</label>
                  <Select value={destDept} onValueChange={setDestDept}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {movementDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Movements Table */}
            <div className="stat-card overflow-hidden">
              {movementsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredMovements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ArrowLeftRight className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground">No hay movimientos que coincidan</p>
                  <p className="text-muted-foreground mt-1">Ajusta los filtros para ver más resultados</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr className="border-b border-border">
                          <th>Fecha</th>
                          <th>Equipo</th>
                          <th>Origen</th>
                          <th>Destino</th>
                          <th>Receptor</th>
                          <th>Responsable</th>
                          <th>Descripción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMovements.map((item) => (
                          <tr key={item.id}>
                            <td className="text-foreground whitespace-nowrap">
                              {format(new Date(item.movement_date), "dd MMM yyyy", { locale: es })}
                              <span className="block text-xs text-muted-foreground">
                                {format(new Date(item.movement_date), "HH:mm")}
                              </span>
                            </td>
                            <td>
                              {item.equipment ? (
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-muted rounded-lg">
                                    <EquipmentIcon type={item.equipment.type} />
                                  </div>
                                  <div>
                                    <span className="font-medium text-foreground block">
                                      {item.equipment.brand} {item.equipment.model}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {item.equipment.serial_number}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic">Equipo eliminado</span>
                              )}
                            </td>
                            <td>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                                {item.origin_department}
                              </span>
                            </td>
                            <td>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {item.destination_department}
                              </span>
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                                  {item.recipient
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </div>
                                <span className="text-foreground">{item.recipient}</span>
                              </div>
                            </td>
                            <td className="text-muted-foreground">{item.assigner_name}</td>
                            <td className="text-muted-foreground max-w-[200px] truncate">
                              {item.description || <span className="italic">Sin descripción</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Results count */}
                  <div className="flex items-center justify-between px-4 py-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Mostrando <span className="font-medium text-foreground">{filteredMovements.length}</span> de{" "}
                      <span className="font-medium text-foreground">{movements.length}</span> movimientos
                    </p>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
