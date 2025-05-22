import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const Admin = () => {
    const location = useLocation();
    const { isAuthenticated, role } = useSelector(state => state.user);
    debugger;
    console.log("Role:", role);
    
    const isAdminAuthenticated = isAuthenticated && role==='admin' && localStorage.getItem("token");
    
    return isAdminAuthenticated ? (
        <Navigate to="/admin" state={{ from: location }} replace />
    ) : (
        <Navigate to="/admin/login" state={{ from: location }} replace />
    );
};

export default Admin;