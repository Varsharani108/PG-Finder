import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * Wrap a route element with <PrivateRoute roles={["owner","admin"]}> to
 * require authentication (and optionally specific roles).
 */
export default function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-shell min-h-[60vh] flex items-center justify-center bg-background">
        <p className="text-primary/70">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
