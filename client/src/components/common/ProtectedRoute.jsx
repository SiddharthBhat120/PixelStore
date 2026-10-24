import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FullLoader } from "./Loader";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading && !user) return <FullLoader label="Checking your session" />;
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading && !user) return <FullLoader label="Checking your session" />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};
