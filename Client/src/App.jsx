import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logout } from './store/slices/userSlice';

// Admin imports
import Admin from "./pages/admin/Admin.jsx";
import AdminPanel from "./pages/admin/pages/home/AdminPanel.jsx";
import AdminLogin from "./pages/admin/pages/login/AdminLogin.jsx";

// Seller imports
import Seller from "./pages/seller/Seller.jsx";
import SellerPanel from "./pages/seller/pages/home/SellerPanel.jsx";
import SellerLogin from "./pages/seller/pages/login/SellerLogin.jsx";

//Home imports
import Home from "./pages/home/Homepage.jsx";
import Signin from "./pages/home/pages/signin/Signin.jsx";
import Signup from "./pages/home/pages/signup/Signup.jsx";
import Userpanel from "./pages/home/pages/userpanel/Userpanel.jsx";
import Cart from "./pages/home/pages/cart/Cart.jsx";
import Checkout from "./pages/home/pages/checkout/Checkout.jsx";
import OrderConfirmation from "./pages/home/pages/order-confirmation/OrderConfirmation.jsx";
import ProductView from "./pages/home/pages/productView/ProductView.jsx";

// Importing the admin components
import AdminDashboard from "./pages/admin/pages/dashboard/Dashboard.jsx";
import AdminUsers from "./pages/admin/pages/users/Users.jsx";
import AdminProducts from "./pages/admin/pages/products/Products.jsx";
import AdminCategories from "./pages/admin/pages/categories/Categories.jsx";
import AdminReviews from "./pages/admin/pages/reviews/Reviews.jsx";
import AdminOrders from "./pages/admin/pages/orders/Orders.jsx";

// Importing the seller components
import SellerDashboard from "./pages/seller/pages/dashboard/Dashboard.jsx";
import SellerProducts from "./pages/seller/pages/products/Products.jsx";
import SellerReviews from "./pages/seller/pages/reviews/Reviews.jsx";
import SellerOrders from "./pages/seller/pages/orders/Orders.jsx";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector(state => state.user);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        console.log('JWT payload:', payload);

        // Extract ID and role from the token payload
        // Check for different possible structures of the token
        let userId, userRole;
        
        if (payload.UserInfo) {
          // If the token has a UserInfo structure
          userId = payload.UserInfo.id;
          userRole = payload.UserInfo.role;
        } else if (payload.id && payload.role) {
          // If the token has direct id and role properties
          userId = payload.id;
          userRole = payload.role;
        } else if (payload.sub) {
          // Some JWT tokens use 'sub' for the subject (user id)
          userId = payload.sub;
          userRole = payload.role || payload.authorities;
        }
        
        
        if (userId) {
          
          dispatch(loginSuccess({
            id: userId,
            role: userRole,
            accessToken: token
          }));
        } else {
          console.warn('Token found but missing user info');
          localStorage.removeItem('token');
          dispatch(logout());
        }
      } catch (error) {
        console.error('Failed to parse JWT token:', error);
        localStorage.removeItem('token');
        dispatch(logout());
      }
    }
  }, [dispatch]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Initializing app...</div>;
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* AdminPanel with nested routes */}
          <Route path="/admin" element={<AdminPanel />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="adminPanel" element={<AdminDashboard />} />
          </Route>
          
          {/* Homepage routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/userpanel" element={<Userpanel />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/checkout' element={<Checkout />} />
          <Route path='/order-confirmation' element={<OrderConfirmation />} />
          <Route path='/product/:productId' element={<ProductView />} />

          {/*Seller Routes*/}
          <Route path="/seller/login" element={<SellerLogin />} />

          <Route path="/seller" element={<SellerPanel />}>
            <Route index element={<SellerDashboard />} />
            <Route path="dashboard" element={<SellerDashboard />} />
            <Route path="products" element={<SellerProducts />} />
            <Route path="reviews" element={<SellerReviews />} />
            <Route path="orders" element={<SellerOrders />} />
            <Route path="sellerPanel" element={<SellerDashboard />} />
          </Route>
          
          {/* Redirect to homepage if no match */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
