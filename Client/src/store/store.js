import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import cartReducer from './slices/cartSlice';
import cartMiddleware from './middleware/cartMiddleware';

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(cartMiddleware)
});

// Make store available globally for the axios interceptor
window.store = store;

export default store;