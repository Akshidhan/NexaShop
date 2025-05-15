import Sidebar from '../../components/sidebar/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';
import Dashboard from '../dashboard/Dashboard';

export default function AdminPanel() {
  const location = useLocation();
  const isRootPath = location.pathname === '/admin/adminPanel';
  
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow p-4">
        {isRootPath ? <Dashboard /> : <Outlet />}
      </div>
    </div>
  )
}
