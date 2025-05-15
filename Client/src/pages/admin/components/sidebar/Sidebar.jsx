import { HiHome, HiMiniUser, HiShoppingCart, HiMiniClipboardDocumentList, HiChatBubbleLeftEllipsis } from "react-icons/hi2";
import './sidebar.scss';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  // Helper function to determine if a link is active
  const isActive = (path) => {
    return location.pathname === path;
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
      </div>
    </>
  );
};

export default Sidebar;