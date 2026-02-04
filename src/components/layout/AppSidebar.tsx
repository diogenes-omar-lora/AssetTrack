import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  FileText,
  Settings,
  Users,
  LogOut,
  Shield,
  Menu,
  X,
  Building2,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRoles";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventario", href: "/equipos", icon: Boxes },
  { name: "Movimientos", href: "/movimientos", icon: ArrowLeftRight },
  { name: "Reportes", href: "/reportes", icon: FileText },
  { name: "Configuración", href: "/configuracion", icon: Settings },
];

const adminNavigation = [
  { name: "Usuarios", href: "/usuarios", icon: Shield },
  { 
    name: "Gestión", 
    icon: Building2,
    submenu: [
      { name: "Departamentos", href: "/gestion", icon: Building2 },
      { name: "Tipos de Equipos", href: "/gestion/tipos", icon: Cpu },
    ]
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useIsAdmin(user?.id);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleLinkClick = () => {
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Boxes className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-sidebar-foreground">AssetTrack</h1>
          <p className="text-xs text-muted-foreground">Admin Console</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== "/dashboard" && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}

        {/* Admin Navigation */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Administración
              </p>
            </div>
            {adminNavigation.map((item) => {
              const hasSubmenu = "submenu" in item;
              const isActive = hasSubmenu 
                ? location.pathname.startsWith(item.icon ? "/gestion" : "")
                : location.pathname === item.href || location.pathname.startsWith(item.href);
              
              if (hasSubmenu && "submenu" in item) {
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground">
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </div>
                    <div className="pl-6 space-y-1">
                      {item.submenu.map((subitem) => {
                        const subIsActive = location.pathname === subitem.href;
                        return (
                          <Link
                            key={subitem.name}
                            to={subitem.href}
                            onClick={handleLinkClick}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                              subIsActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <subitem.icon className="h-4 w-4" />
                            {subitem.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile?.full_name || "Usuario"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {isAdmin ? "Administrador" : "Operador"}
            </p>
          </div>
          <button 
            onClick={handleSignOut}
            className="p-2 text-muted-foreground hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Header with Menu Button */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center gap-4 border-b border-border bg-background px-4 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Boxes className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">AssetTrack</span>
        </div>
      </div>
    </>
  );
}
