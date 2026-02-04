import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      {/* Add padding-top for mobile header and padding-left for desktop sidebar */}
      <div className="pt-14 lg:pt-0 lg:pl-64">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
