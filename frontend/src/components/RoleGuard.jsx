import { Navigate } from "react-router-dom";

const RoleGuard = ({ role, allowedRoles, children }) => {
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleGuard;
