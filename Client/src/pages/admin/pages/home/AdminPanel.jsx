import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/sidebar/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';
import Dashboard from '../dashboard/Dashboard';
import { logout } from '../../../../store/slices/userSlice';

export default function AdminPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, role, loading } = useSelector(state => state.user);
  const isRootPath = location.pathname === '/admin/adminPanel';
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      const token = localStorage.getItem('token');
      
      if (!token || !isAuthenticated) {
        navigate('/admin/login');
        return;
      }

      if (role !== 'admin') {
        console.log(`The role is not admin, it is ${role}`);
        handleLogout();
        return;
      }

      setAuthChecked(true);
    }
  }, [loading, isAuthenticated, role, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };

  // Don't render content until authentication check is complete
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Show a loading state until auth check completes
  if (!authChecked && !loading) {
    return <div className="flex justify-center items-center h-screen">Verifying authentication...</div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow p-4">
        {isRootPath ? <Dashboard /> : <Outlet />}
      </div>
    </div>
  );
}
