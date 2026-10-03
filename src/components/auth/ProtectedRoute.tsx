import { Navigate, Outlet, useLocation } from "react-router-dom";

import { isApiConfigured, readApiSession } from "@/lib/api-client";

export function ProtectedRoute() {
  const location = useLocation();

  if (!isApiConfigured()) return <Outlet />;
  if (readApiSession()) return <Outlet />;

  return <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
