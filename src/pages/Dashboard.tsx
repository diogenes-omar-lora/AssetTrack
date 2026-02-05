import { useEffect, useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Monitor, Laptop, ClipboardList, Wrench, Phone, Tablet, Printer, Server, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useEquipmentStats } from "@/hooks/useEquipment";
import { useMovements, MovementWithEquipment } from "@/hooks/useMovements";
import { useDepartments } from "@/hooks/useDepartments";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

// Colors for department chart
const DEPARTMENT_COLORS = [
  "hsl(217, 91%, 50%)",
  "hsl(217, 91%, 60%)",
  "hsl(217, 91%, 70%)",
  "hsl(217, 91%, 80%)",
  "hsl(199, 89%, 48%)",
  "hsl(199, 89%, 58%)",
  "hsl(199, 89%, 68%)",
  "hsl(142, 76%, 36%)",
];
const StatusBadge = ({ status }: { status: string }) => {
  const statusClasses: Record<string, string> = {
    assigned: "status-badge status-assigned",
    returned: "status-badge status-returned",
    maintenance: "status-badge status-maintenance",
    active: "status-badge status-active",
    repair: "status-badge status-repair",
  };

  const statusLabels: Record<string, string> = {
    assigned: "Asignado",
    returned: "Devuelto",
    maintenance: "Mantenimiento",
    active: "Activo",
    repair: "En Reparación",
  };

  return (
    <span className={statusClasses[status] || statusClasses.active}>
      {statusLabels[status] || status}
    </span>
  );
};

const getEquipmentIcon = (type: string) => {
  switch (type) {
    case "Laptop":
      return Laptop;
    case "Monitor":
      return Monitor;
    case "CPU":
      return Server;
    case "Tablet":
      return Tablet;
    case "Impresora":
      return Printer;
    case "Servidor":
      return Server;
    default:
      return Monitor;
  }
};

interface DepartmentChartProps {
  data: { name: string; value: number }[];
  total: number;
  selectedBuilding?: string;
}

function DepartmentChart({ data, total, selectedBuilding }: DepartmentChartProps) {
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length],
      percentage: total > 0 ? Math.round((item.value / total) * 100) : 0,
    }));
  }, [data, total]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <p>No hay equipos asignados a departamentos</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-8">
      <div className="relative w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{total}</span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
        {chartData.map((dept) => (
          <div key={dept.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: dept.color }}
            />
            <span className="text-sm text-muted-foreground truncate">
              {dept.name} ({dept.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: statsData, isLoading: statsLoading } = useEquipmentStats();
  const { departments } = useDepartments();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all");
  const itemsPerPage = 10;
  
  const { movements, totalCount, totalPages, isLoading: movementsLoading } = useMovements({ 
    page: currentPage, 
    pageSize: itemsPerPage 
  });

  // Obtener edificios únicos
  const buildings = useMemo(() => {
    const uniqueBuildings = Array.from(
      new Set(departments.map((d) => d.building).filter((b): b is string => !!b))
    ).sort((a, b) => a.localeCompare(b));
    return uniqueBuildings;
  }, [departments]);

  // Filtrar departamentos por edificio seleccionado
  const filteredDepartments = useMemo(() => {
    if (selectedBuilding === "all") {
      return statsData?.byDepartment || [];
    }
    const deptNames = departments
      .filter((d) => d.building === selectedBuilding)
      .map((d) => d.name);
    return (statsData?.byDepartment || []).filter((dept) =>
      deptNames.includes(dept.name)
    );
  }, [selectedBuilding, statsData?.byDepartment, departments]);

  // Calcular total filtrado
  const filteredTotal = useMemo(() => {
    return filteredDepartments.reduce((sum, dept) => sum + dept.value, 0);
  }, [filteredDepartments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [totalCount]);

  // Los movimientos ya vienen ordenados y paginados del servidor
  const displayedMovements = movements;

  const stats = [
    {
      title: "Total Equipos",
      value: statsData?.total ?? 0,
      change: "+5%",
      trend: "up",
      icon: Monitor,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Asignados",
      value: statsData?.assigned ?? 0,
      change: "+12%",
      trend: "up",
      icon: Laptop,
      iconBg: "bg-status-maintenance-bg",
      iconColor: "text-status-maintenance",
    },
    {
      title: "Disponibles",
      value: statsData?.available ?? 0,
      change: "-2%",
      trend: "down",
      icon: ClipboardList,
      iconBg: "bg-status-repair-bg",
      iconColor: "text-status-repair",
    },
    {
      title: "En Reparación",
      value: statsData?.inRepair ?? 0,
      label: "Necesita Acción",
      icon: Wrench,
      iconBg: "bg-status-maintenance-bg",
      iconColor: "text-status-maintenance",
    },
  ];

  const typeData = [
    { name: "Laptops", value: statsData?.byType?.Laptop ?? 0 },
    { name: "Monitores", value: statsData?.byType?.Monitor ?? 0 },
    { name: "CPUs", value: statsData?.byType?.CPU ?? 0 },
    { name: "Tablets", value: statsData?.byType?.Tablet ?? 0 },
    { name: "Impresoras", value: statsData?.byType?.Impresora ?? 0 },
    { name: "Servidores", value: statsData?.byType?.Servidor ?? 0 },
    { name: "Otros", value: statsData?.byType?.Otro ?? 0 },
  ];

  return (
    <>
      <TopNavbar title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.title} className="stat-card">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                {stat.label && (
                  <span className="text-xs text-status-maintenance font-medium">
                    {stat.label}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-4">{stat.title}</p>
              {statsLoading ? (
                <Skeleton className="h-9 w-20 mt-1" />
              ) : (
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Chart */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Equipos por Departamento</h3>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Todos los edificios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los edificios</SelectItem>
                    {buildings.map((building) => (
                      <SelectItem key={building} value={building}>
                        {building}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {statsLoading ? (
              <div className="flex items-center gap-8">
                <Skeleton className="w-48 h-48 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ) : (
              <DepartmentChart 
                data={filteredDepartments} 
                total={filteredTotal}
                selectedBuilding={selectedBuilding}
              />
            )}
          </div>

          {/* Type Chart */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Inventario por Tipo</h3>
                <p className="text-sm text-muted-foreground">Stock activo actual</p>
              </div>
              <select className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background">
                <option>Este Mes</option>
                <option>Último Mes</option>
                <option>Este Año</option>
              </select>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    width={80}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(217, 91%, 60%)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Movements */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Movimientos Recientes</h3>
            <Link
              to="/movimientos"
              className="text-sm text-primary hover:underline font-medium"
            >
              Ver Todo
            </Link>
          </div>
          {movementsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : displayedMovements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay movimientos registrados aún.</p>
              <Link to="/movimientos/nuevo" className="text-primary hover:underline text-sm">
                Registrar primer movimiento
              </Link>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr className="border-b border-border">
                  <th>Fecha</th>
                  <th>Equipo</th>
                  <th>Destinatario</th>
                  <th>Dept. Destino</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {displayedMovements.map((movement: MovementWithEquipment) => {
                  const Icon = movement.equipment ? getEquipmentIcon(movement.equipment.type) : Monitor;
                  return (
                    <tr key={movement.id}>
                      <td className="text-muted-foreground">
                        {format(new Date(movement.movement_date), "MMM dd, yyyy")}
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {movement.equipment
                                ? `${movement.equipment.brand} ${movement.equipment.model}`
                                : "Equipo eliminado"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              S/N: {movement.equipment?.serial_number || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                            {movement.recipient
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <span className="text-foreground">{movement.recipient}</span>
                        </div>
                      </td>
                      <td className="text-foreground">{movement.destination_department}</td>
                      <td>
                        <StatusBadge status="assigned" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {totalCount > itemsPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Mostrando <span className="font-medium text-foreground">{displayedMovements.length}</span> de <span className="font-medium text-foreground">{totalCount}</span>
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
        </div>
      </div>
    </>
  );
}
