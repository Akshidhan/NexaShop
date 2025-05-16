import { createSlice } from '@reduxjs/toolkit';
import * as cartApi from '../../api/cartApi';

// Helper to check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Helper to get cart from localStorage
const loadCartFromStorage = () => {
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    return [];
  }
};

// Helper to save cart to localStorage
const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

const initialState = {
  items: loadCartFromStorage(),
  loading: false,
  error: null,
  total: 0,
  itemCount: 0,
  isDbSynced: false
};

// Helper function to calculate totals
const calculateTotals = (state) => {
  const { total, itemCount } = state.items.reduce(
    (acc, item) => ({
      total: acc.total + (item.price * item.quantity),
      itemCount: acc.itemCount + item.quantity
    }),
    { total: 0, itemCount: 0 }
  );
  
  state.total = total;
  state.itemCount = itemCount;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { id, name, price, image, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.id === id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ id, name, price, image, quantity });
      }
      
      calculateTotals(state);
      saveCartToStorage(state.items);
      state.isDbSynced = false;
    },
    
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      calculateTotals(state);
      saveCartToStorage(state.items);
      state.isDbSynced = false;
    },
    
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (item && quantity > 0) {
        item.quantity = quantity;
      }
      
      calculateTotals(state);
      saveCartToStorage(state.items);
      state.isDbSynced = false;
    },
    
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
      localStorage.removeItem('cart');
      state.isDbSynced = false;
    },

    // Database sync actions
    syncWithDatabaseStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    syncWithDatabaseSuccess: (state) => {
      state.loading = false;
      state.isDbSynced = true;
    },
    
    syncWithDatabaseFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to sync with database';
      state.isDbSynced = false;
    },

    // Cart fetch actions
    fetchCartStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    fetchCartSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload.items || action.payload;
      calculateTotals(state);
      saveCartToStorage(state.items);
      state.isDbSynced = true;
    },
    
    fetchCartFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch cart';
    },
    
    // Set sync status 
    setDbSyncStatus: (state, action) => {
      state.isDbSynced = action.payload;
    }
  }
});

// Export all actions
export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  fetchCartStart,
  fetchCartSuccess,
  fetchCartFailure,
  syncWithDatabaseStart,
  syncWithDatabaseSuccess,
  syncWithDatabaseFailure,
  setDbSyncStatus
} = cartSlice.actions;

// Helper action creator to handle cart operations with database syncing
export const addToCartWithSync = (item) => async (dispatch, getState) => {
  // First add to local cart
  dispatch(addToCart(item));
  
  // If user is authenticated, sync with database
  if (isAuthenticated()) {
    try {
      dispatch(syncWithDatabaseStart());
      await cartApi.addItemToDB(item);
      dispatch(syncWithDatabaseSuccess());
    } catch (error) {
      console.error('Failed to add item to database:', error);
      dispatch(syncWithDatabaseFailure(error.message));
    }
  }
};

export const removeFromCartWithSync = (itemId) => async (dispatch, getState) => {
  // First remove from local cart
  dispatch(removeFromCart(itemId));
  
  // If user is authenticated, sync with database
  if (isAuthenticated()) {
    try {
      dispatch(syncWithDatabaseStart());
      await cartApi.removeItemFromDB(itemId);
      dispatch(syncWithDatabaseSuccess());
    } catch (error) {
      console.error('Failed to remove item from database:', error);
      dispatch(syncWithDatabaseFailure(error.message));
    }
  }
};

export const updateQuantityWithSync = (id, quantity) => async (dispatch, getState) => {
  // First update local cart
  dispatch(updateQuantity({ id, quantity }));
  
  // If user is authenticated, sync with database
  if (isAuthenticated()) {
    try {
      dispatch(syncWithDatabaseStart());
      await cartApi.updateItemQuantityInDB(id, quantity);
      dispatch(syncWithDatabaseSuccess());
    } catch (error) {
      console.error('Failed to update quantity in database:', error);
      dispatch(syncWithDatabaseFailure(error.message));
    }
  }
};

export const clearCartWithSync = () => async (dispatch, getState) => {
  // First clear local cart
  dispatch(clearCart());
  
  // If user is authenticated, sync with database
  if (isAuthenticated()) {
    try {
      dispatch(syncWithDatabaseStart());
      await cartApi.clearCartInDB();
      dispatch(syncWithDatabaseSuccess());
    } catch (error) {
      console.error('Failed to clear cart in database:', error);
      dispatch(syncWithDatabaseFailure(error.message));
    }
  }
};

export const fetchCartFromDB = () => async (dispatch) => {
  if (!isAuthenticated()) {
    return; // Don't fetch if not authenticated
  }
  
  try {
    dispatch(fetchCartStart());
    const cartData = await cartApi.fetchUserCartFromDB();
    dispatch(fetchCartSuccess(cartData));
  } catch (error) {
    console.error('Failed to fetch cart from database:', error);
    dispatch(fetchCartFailure(error.message));
  }
};

export const syncCartWithDB = () => async (dispatch, getState) => {
  if (!isAuthenticated()) {
    return; // Don't sync if not authenticated
  }
  
  const { cart } = getState();
  
  if (cart.isDbSynced) {
    return; // Already synced
  }
  
  try {
    dispatch(syncWithDatabaseStart());
    await cartApi.saveCartToDB(cart.items);
    dispatch(syncWithDatabaseSuccess());
  } catch (error) {
    console.error('Failed to sync cart with database:', error);
    dispatch(syncWithDatabaseFailure(error.message));
  }
};

export default cartSlice.reducer;