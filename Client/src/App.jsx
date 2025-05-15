import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Admin from "./pages/admin/Admin.jsx";
import AdminPanel from "./pages/admin/pages/home/AdminPanel.jsx";
import Login from "./pages/admin/pages/login/Login.jsx";

// import Home from "./pages/home/Home.jsx";
// import Seller from "./pages/seller/Seller.jsx";

// Import or create these dashboard components
import Dashboard from "./pages/admin/pages/dashboard/Dashboard.jsx";
const Users = () => <h1>Users Management</h1>;
const Products = () => <h1>Products Management</h1>;
const Reviews = () => <h1>Reviews Management</h1>;
const Orders = () => <h1>Orders Management</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin routes */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login" element={<Login />} />
        
        {/* AdminPanel with nested routes */}
        <Route path="/admin" element={<AdminPanel />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="products" element={<Products />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="orders" element={<Orders />} />
          {/* Default route when accessing /admin/adminPanel */}
          <Route path="adminPanel" element={<Dashboard />} />
        </Route>
        
        {/* <Route path="/home" element={<Home />} /> */}
        {/* <Route path="/seller" element={<Seller />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
