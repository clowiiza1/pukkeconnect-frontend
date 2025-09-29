import { Outlet,Link } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
