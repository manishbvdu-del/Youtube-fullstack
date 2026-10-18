import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait until we know if the user is logged in (e.g. checking token on refresh)
  if (loading) {
    return <div>Loading...</div>;
  }

  // Not logged in: send to login and remember where they wanted to go
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in: render the child route
  return <Outlet />;
};

export default ProtectedRoute;