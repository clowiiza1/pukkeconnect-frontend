import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-purple-200">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
