import { createSlice } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

const initialState = {
  items: [],
  loading: false,
  error: null,
  totalItems: 0,
  totalPrice: 0
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    fetchCartSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload.items || [];
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce(
        (total, item) => total + (item.priceAtAddition * item.quantity), 
        0
      );
    },
    
    updateCartSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload.items || [];
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce(
        (total, item) => total + (item.priceAtAddition * item.quantity), 
        0
      );
    },
    
    createCartSuccess: (state) => {
      state.loading = false;
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
    },
    
    cartError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
    },
    
    calculateTotals: (state) => {
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce(
        (total, item) => total + (item.priceAtAddition * item.quantity), 
        0
      );
    }
  }
});

export const { 
  setLoading, 
  fetchCartSuccess, 
  updateCartSuccess, 
  createCartSuccess, 
  cartError,
  clearCart, 
  calculateTotals 
} = cartSlice.actions;

export const fetchCart = (userId) => async (dispatch) => {
  try {
    dispatch(setLoading());
    const response = await axios.get(`/cart/${userId}`);
    dispatch(fetchCartSuccess(response.data));
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch cart';
    dispatch(cartError(errorMessage));
    throw error;
  }
};

export const updateCart = ({ userId, items }) => async (dispatch) => {
  try {
    dispatch(setLoading());
    const response = await axios.put(`/cart/${userId}`, { items });
    dispatch(updateCartSuccess(response.data.cart));
    return response.data.cart;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update cart';
    dispatch(cartError(errorMessage));
    throw error;
  }
};

export const addToCart = ({ userId, product, quantity = 1 }) => async (dispatch, getState) => {
  try {
    const { items } = getState().cart;
    const currentItems = [...items];
    
    const existingItemIndex = currentItems.findIndex(
      item => item.product && item.product._id === product._id
    );
    
    let updatedItems;
    
    if (existingItemIndex >= 0) {
      updatedItems = currentItems.map((item, index) => 
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updatedItems = [
        ...currentItems,
        {
          product: product._id,
          quantity: quantity,
          priceAtAddition: product.basePrice
        }
      ];
    }
    
    return dispatch(updateCart({ userId, items: updatedItems }));
  } catch (error) {
    throw error;
  }
};

export const removeFromCart = ({ userId, itemId }) => async (dispatch, getState) => {
  try {
    const { items } = getState().cart;
    const updatedItems = items.filter(item => item._id !== itemId);
    return dispatch(updateCart({ userId, items: updatedItems }));
  } catch (error) {
    throw error;
  }
};

export const createCart = (userId) => async (dispatch) => {
  try {
    dispatch(setLoading());
    const response = await axios.post(`/cart/${userId}`);
    dispatch(createCartSuccess());
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to create cart';
    dispatch(cartError(errorMessage));
    throw error;
  }
};

export default cartSlice.reducer;
