import { HiHome, HiMiniUser, HiShoppingCart, HiMiniClipboardDocumentList, HiChatBubbleLeftEllipsis, HiArrowRightOnRectangle } from "react-icons/hi2";
import './sidebar.scss';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../../../store/slices/userSlice';

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };

  return (
    <>
      <div className="flex flex-col items-center w-60 h-screen overflow-hidden text bg-neutral-400 rounded-r-sm">
        <div className="flex items-center w-full px-3 mt-3 flex-col">
          <img src="/Nexashop.png" alt="Nexashop" className="w-30" />
          <span className="ml-2 text-sm font-bold">Admin</span>
        </div>
        <div className="w-full px-2">
          <div className="flex flex-col items-center w-full mt-3 border-t border-gray-700">
            <NavLink 
              to="/admin/dashboard" 
              className={({ isActive }) => 
                `flex items-center w-full h-12 px-3 mt-2 rounded ${
                  isActive ? 'text-gray-200 bg-gray-700' : 'hover:bg-gray-700 hover:text-gray-300'
                }`
              }
            >
              <HiHome className="size-6" />
              <span className="ml-2 text-sm font-medium">Dashboard</span>
            </NavLink>
            
            <NavLink 
              to="/admin/users" 
              className={({ isActive }) => 
                `flex items-center w-full h-12 px-3 mt-2 rounded ${
                  isActive ? 'text-gray-200 bg-gray-700' : 'hover:bg-gray-700 hover:text-gray-300'
                }`
              }
            >
              <HiMiniUser className="size-6" />
              <span className="ml-2 text-sm font-medium">Users</span>
            </NavLink>
            
            <NavLink 
              to="/admin/products" 
              className={({ isActive }) => 
                `flex items-center w-full h-12 px-3 mt-2 rounded ${
                  isActive ? 'text-gray-200 bg-gray-700' : 'hover:bg-gray-700 hover:text-gray-300'
                }`
              }
            >
              <HiShoppingCart className="size-6" />
              <span className="ml-2 text-sm font-medium">Products</span>
            </NavLink>
            
            <NavLink 
              to="/admin/reviews" 
              className={({ isActive }) => 
                `flex items-center w-full h-12 px-3 mt-2 rounded ${
                  isActive ? 'text-gray-200 bg-gray-700' : 'hover:bg-gray-700 hover:text-gray-300'
                }`
              }
            >
              <HiChatBubbleLeftEllipsis className="size-6" />
              <span className="ml-2 text-sm font-medium">Reviews</span>
            </NavLink>

            <NavLink 
              to="/admin/orders" 
              className={({ isActive }) => 
                `flex items-center w-full h-12 px-3 mt-2 rounded ${
                  isActive ? 'text-gray-200 bg-gray-700' : 'hover:bg-gray-700 hover:text-gray-300'
                }`
              }
            >
              <HiMiniClipboardDocumentList className="size-6" />
              <span className="ml-2 text-sm font-medium">Orders</span>
            </NavLink>
          </div>
        </div>
        <div className="flex items-center justify-center w-full mt-auto border-t border-gray-700 py-3">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full h-12 px-5 rounded hover:bg-gray-700 hover:text-gray-300"
          >
            <HiArrowRightOnRectangle className="size-6" />
            <span className="ml-2 text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;