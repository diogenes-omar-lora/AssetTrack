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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// Estilos para transiciones suaves del menú
const sidebarStyles = `
  @keyframes slideInMenuLeft {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .menu-item {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }

  .menu-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    background-color: currentColor;
    transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 0 2px 2px 0;
  }

  .menu-item:hover::before,
  .menu-item.active::before {
    height: 20px;
  }

  .menu-item:hover {
    transform: translateX(4px);
  }

  .menu-item.active {
    transform: translateX(0);
  }

  .sidebar-icon {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .menu-item:hover .sidebar-icon {
    transform: scale(1.1) translateX(2px);
  }

  .menu-item.active .sidebar-icon {
    transform: scale(1.05);
  }

  .nav-section-label {
    transition: color 0.3s ease;
  }

  .nav-section:hover .nav-section-label {
    color: var(--color-foreground);
  }
`;

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
      <style>{sidebarStyles}</style>
      
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6 transition-all duration-300">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary transition-transform duration-300 hover:scale-110">
          <Boxes className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-sidebar-foreground transition-colors duration-300">AssetTrack</h1>
          <p className="text-xs text-muted-foreground transition-colors duration-300">Admin Console</p>
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
                "menu-item flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                isActive
                  ? "active bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="sidebar-icon h-5 w-5 flex-shrink-0" />
              <span className="transition-all duration-300">{item.name}</span>
            </Link>
          );
        })}

        {/* Admin Navigation */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <p className="nav-section nav-section-label px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors duration-300">
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
                    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-sidebar-accent-foreground">
                      <item.icon className="sidebar-icon h-5 w-5 flex-shrink-0 transition-transform duration-300 hover:scale-110" />
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
                              "menu-item flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium",
                              subIsActive
                                ? "active bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <subitem.icon className="sidebar-icon h-4 w-4 flex-shrink-0" />
                            <span className="transition-all duration-300">{subitem.name}</span>
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
                    "menu-item flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                    isActive
                      ? "active bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="sidebar-icon h-5 w-5 flex-shrink-0" />
                  <span className="transition-all duration-300">{item.name}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-4 transition-all duration-300">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted transition-all duration-300 group-hover:bg-sidebar-accent group-hover:text-sidebar-accent-foreground">
            <Users className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-sidebar-accent-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate transition-colors duration-300">
              {profile?.full_name || "Usuario"}
            </p>
            <p className="text-xs text-muted-foreground truncate transition-colors duration-300">
              {isAdmin ? "Administrador" : "Operador"}
            </p>
          </div>
          <button 
            onClick={handleSignOut}
            className="p-2 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/30 rounded-lg transition-all duration-300"
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
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-sidebar-border bg-sidebar lg:block transition-all duration-300">
        <SidebarContent />
      </aside>

      {/* Mobile Header with Menu Button */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center gap-4 border-b border-border bg-background px-4 lg:hidden transition-all duration-300">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden transition-all duration-300 hover:bg-accent"
            >
              {open ? (
                <X className="h-5 w-5 transition-transform duration-300 rotate-90" />
              ) : (
                <Menu className="h-5 w-5 transition-transform duration-300" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="w-64 p-0 bg-sidebar transition-all duration-300 ease-out"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>Navegacion principal</SheetDescription>
            </SheetHeader>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 transition-all duration-300">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-transform duration-300 hover:scale-110">
            <Boxes className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold transition-colors duration-300">AssetTrack</span>
        </div>
      </div>
    </>
  );
}
