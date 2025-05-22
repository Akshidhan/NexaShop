import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const Seller = () => {
    const location = useLocation();
    const { isAuthenticated, role } = useSelector(state => state.user);
    
    const isAdminAuthenticated = isAuthenticated && role==='seller' && localStorage.getItem("token");
    
    return isAdminAuthenticated ? (
        <Navigate to="/seller/sellerPanel" state={{ from: location }} replace />
    ) : (
        <Navigate to="/seller/login" state={{ from: location }} replace />
    );
}

export default Seller