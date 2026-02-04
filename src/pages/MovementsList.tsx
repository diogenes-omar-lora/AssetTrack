import { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, Monitor, Calendar, Laptop, Phone, Printer } from "lucide-react";
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
import { useMovements, MovementWithEquipment } from "@/hooks/useMovements";
import { useDepartments } from "@/hooks/useDepartments";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const StatusBadge = ({ status }: { status: string }) => {
  const isCompleted = status === "completed";
  return (
    <span
      className={`status-badge ${isCompleted ? "status-active" : "status-maintenance"}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {isCompleted ? "Completado" : "Pendiente"}
    </span>
  );
};

const getEquipmentIcon = (type: string | undefined) => {
  switch (type) {
    case "Laptop":
      return Laptop;
    case "Teléfono":
      return Phone;
    default:
      return Monitor;
  }
};

const handlePrintMovement = (movement: MovementWithEquipment) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Traslado de Equipo</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          font-size: 12px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .header h1 {
          font-size: 13px;
          font-weight: bold;
          margin-bottom: 3px;
          text-transform: uppercase;
        }
        
        .header h2 {
          font-size: 12px;
          font-weight: normal;
          color: #0066cc;
          margin-bottom: 2px;
        }
        
        .title {
          text-align: center;
          font-size: 14px;
          font-weight: bold;
          margin: 20px 0;
          text-transform: uppercase;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        
        .info-field {
          display: flex;
          align-items: center;
        }
        
        .info-field label {
          font-weight: bold;
          margin-right: 10px;
        }
        
        .info-field input {
          border: none;
          border-bottom: 1px solid #000;
          padding: 2px 5px;
          min-width: 300px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        
        table, th, td {
          border: 1px solid #000;
        }
        
        th {
          background-color: #f0f0f0;
          padding: 8px;
          text-align: center;
          font-weight: bold;
          font-size: 11px;
        }
        
        td {
          padding: 8px;
          text-align: left;
          font-size: 11px;
        }
        
        .section {
          margin: 15px 0;
        }
        
        .section-label {
          font-weight: bold;
          display: inline-block;
          min-width: 80px;
        }
        
        .section-value {
          border-bottom: 1px solid #000;
          display: inline-block;
          min-width: 400px;
          padding: 2px 5px;
        }
        
        .observations {
          margin-top: 15px;
        }
        
        .observations-label {
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .observations-box {
          border: 1px solid #000;
          min-height: 100px;
          padding: 10px;
          white-space: pre-wrap;
        }
        
        .footer-section {
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
        }
        
        .footer-box {
          width: 48%;
          border: 1px solid #000;
          padding: 10px;
          min-height: 80px;
        }
        
        .footer-box-title {
          font-weight: bold;
          text-align: center;
          margin-bottom: 5px;
        }
        
        .notes {
          margin-top: 20px;
          font-size: 10px;
        }
        
        .signature {
          margin-top: 30px;
          font-weight: bold;
        }
        
        @media print {
          body {
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
          <svg width="80" height="80" viewBox="0 0 100 100" style="margin-right: 15px;">
            <!-- Libro abierto -->
            <path d="M 20 30 L 20 75 L 48 70 L 48 25 Z" fill="#CC0000" stroke="#000" stroke-width="1"/>
            <path d="M 52 25 L 52 70 L 80 75 L 80 30 Z" fill="#CC0000" stroke="#000" stroke-width="1"/>
            <!-- Balanza superior -->
            <circle cx="50" cy="20" r="3" fill="#003087"/>
            <line x1="50" y1="23" x2="50" y2="35" stroke="#003087" stroke-width="2"/>
            <line x1="35" y1="35" x2="65" y2="35" stroke="#003087" stroke-width="2"/>
            <path d="M 32 35 L 35 42 L 38 35 Z" fill="#003087"/>
            <path d="M 62 35 L 65 42 L 68 35 Z" fill="#003087"/>
          </svg>
          <div>
            <div style="font-size: 11px; color: #CC0000; font-weight: bold;">REPÚBLICA DOMINICANA</div>
            <div style="font-size: 16px; color: #003087; font-weight: bold;">PODER JUDICIAL</div>
          </div>
        </div>
        <h1>DIRECCIÓN GENERAL DE ADMINISTRACIÓN Y CARRERA JUDICIAL</h1>
        <h2>DIRECCIÓN DE TECNOLOGÍAS DE LA INFORMACIÓN Y LA COMUNICACIÓN</h2>
      </div>
      
      <div class="title">
        TRASLADO DE MUEBLES, EQUIPOS Y/O DESCARGO
      </div>
      
      <div class="info-row">
        <div class="info-field">
          <label>OFICINA:</label>
          <input type="text" value="${movement.origin_department}" readonly />
        </div>
        <div class="info-field">
          <label>FECHA:</label>
          <input type="text" value="${format(new Date(movement.movement_date), "dd/MM/yyyy")}" readonly style="min-width: 100px;" />
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th style="width: 15%;">Código/Activo</th>
            <th style="width: 30%;">DESCRIPCIÓN</th>
            <th style="width: 20%;">MARCA</th>
            <th style="width: 20%;">MODELO</th>
            <th style="width: 15%;">No. Serie o Chasis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${movement.equipment?.asset_code || "N/A"}</td>
            <td>${movement.equipment?.type || "N/A"}</td>
            <td>${movement.equipment?.brand || "N/A"}</td>
            <td>${movement.equipment?.model || "N/A"}</td>
            <td>${movement.equipment?.serial_number || "N/A"}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="section">
        <span class="section-label">ORIGEN:</span>
        <span class="section-value">${movement.origin_department}</span>
      </div>
      
      <div class="section">
        <span class="section-label">DESTINO:</span>
        <span class="section-value">${movement.destination_department} - ${movement.recipient}</span>
      </div>
      
      <div class="observations">
        <div class="observations-label">OBSERVACIONES:</div>
        <div class="observations-box">${movement.equipment?.specifications || ""}</div>
      </div>
      
      <div class="footer-section">
        <div class="footer-box">
          <div class="footer-box-title">OFICINA O TRIBUNAL DE ORIGEN</div>
          <div>(Nombres y Código)</div>
        </div>
        <div class="footer-box">
          <div class="footer-box-title">OFICINA O TRIBUNAL DESTINO</div>
          <div>(Nombres y Código)</div>
        </div>
      </div>
      
      <div class="notes">
        <div>Original: Al destino del equipo</div>
        <div>Copia: Gerencia de Servicios</div>
        <div>Copia: Oficina Remitente</div>
      </div>
      
      <div class="signature">
        Movimiento realizado por: ${movement.assigner_name}
      </div>
      
      <script>
        window.print();
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export default function MovementsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [originFilter, setOriginFilter] = useState("all");
  const [destFilter, setDestFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { movements, isLoading } = useMovements();
  const { departments } = useDepartments();

  const filteredMovements = movements.filter((mov) => {
    const matchesSearch =
      mov.equipment?.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.equipment?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.recipient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrigin = originFilter === "all" || mov.origin_department === originFilter;
    const matchesDest = destFilter === "all" || mov.destination_department === destFilter;

    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(mov.movement_date) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDate = matchesDate && new Date(mov.movement_date) <= new Date(dateTo);
    }

    return matchesSearch && matchesOrigin && matchesDest && matchesDate;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, originFilter, destFilter, dateFrom, dateTo]);

  const sortedMovements = [...filteredMovements].sort((a, b) =>
    new Date(b.movement_date).getTime() - new Date(a.movement_date).getTime()
  );
  const totalPages = Math.max(1, Math.ceil(sortedMovements.length / itemsPerPage));
  const paginatedMovements = sortedMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <TopNavbar title="Movimientos" />
      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="filter-card space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Filter className="h-4 w-4" />
            Filtrar Datos
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Fecha Desde</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Fecha Hasta</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Dept. Origen</label>
              <Select value={originFilter} onValueChange={setOriginFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Dept. Destino</label>
              <Select value={destFilter} onValueChange={setDestFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setOriginFilter("all");
                  setDestFilter("all");
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Add */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por serial o destinatario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Link to="/movimientos/nuevo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Movimiento
            </Button>
          </Link>
        </div>

        {/* Table */}
        <div className="stat-card overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredMovements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Monitor className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No se encontraron movimientos.</p>
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
                    <th>Dept. Origen</th>
                    <th>Dept. Destino</th>
                    <th>Asignador</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMovements.map((movement: MovementWithEquipment) => {
                    const Icon = getEquipmentIcon(movement.equipment?.type);
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
                        <td className="text-foreground">{movement.origin_department}</td>
                        <td className="text-foreground">{movement.destination_department}</td>
                        <td className="text-muted-foreground">{movement.assigner_name}</td>
                        <td>
                          <StatusBadge status="completed" />
                        </td>
                        <td>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintMovement(movement)}
                            title="Imprimir movimiento"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium text-foreground">{paginatedMovements.length}</span> de <span className="font-medium text-foreground">{sortedMovements.length}</span>
            </p>
            {sortedMovements.length > itemsPerPage && (
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
    </>
  );
}
