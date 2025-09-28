
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";

import Landing from "@/pages/public/Landing";
import NotFound from "@/pages/public/NotFound";

import DashboardPage from "@/pages/studentdashboard/index.jsx";
import SocietyAdminDashboard from "@/pages/societyadmindashboard/index.jsx";
import AdminDashboard from "@/pages/admindashboard/index.jsx";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/student",
        element: (
          <RoleRoute allowed={["student"]}>
            <DashboardPage />
          </RoleRoute>
        ),
      },
      {
        path: "/society-admin",
        element: (
          <RoleRoute allowed={["society-admin"]}>
            <SocietyAdminDashboard />
          </RoleRoute>
        ),
      },
      {
        path: "/admin",
        element: (
          <RoleRoute allowed={["admin"]}>
            <AdminDashboard />
          </RoleRoute>
        ),
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
