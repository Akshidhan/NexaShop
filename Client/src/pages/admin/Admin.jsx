import { Navigate, useLocation } from "react-router-dom";

// Simulate authentication check
const isAuthenticated = () => {
    return !!localStorage.getItem("adminToken");
};

const Admin = () => {
    const location = useLocation();
    return isAuthenticated() ? (
        <Navigate to="/admin/adminPanel" state={{ from: location }} replace />
    ) : (
        <Navigate to="/admin/login" state={{ from: location }} replace />
    );
};

export default Admin