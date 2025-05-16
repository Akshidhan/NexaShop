import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  totalCount: 0,
  filters: {
    status: null,
    startDate: null,
    endDate: null,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Fetch orders actions
    fetchOrdersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrdersSuccess: (state, action) => {
      state.loading = false;
      state.orders = action.payload.orders || action.payload;
      state.totalCount = action.payload.totalCount || action.payload.length;
    },
    fetchOrdersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch orders';
    },

    // Fetch single order actions
    fetchOrderByIdStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrderByIdSuccess: (state, action) => {
      state.loading = false;
      state.currentOrder = action.payload;
    },
    fetchOrderByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch order';
    },

    // Create order actions
    createOrderStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createOrderSuccess: (state, action) => {
      state.loading = false;
      state.currentOrder = action.payload;
      state.orders.unshift(action.payload);
    },
    createOrderFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to create order';
    },

    // Update order status actions
    updateOrderStatusStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateOrderStatusSuccess: (state, action) => {
      state.loading = false;
      
      // Update in orders array
      const index = state.orders.findIndex(o => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
      
      // Update current order if it's the same one
      if (state.currentOrder?.id === action.payload.id) {
        state.currentOrder = action.payload;
      }
    },
    updateOrderStatusFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to update order status';
    },

    // Filter actions
    setOrderFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearOrderFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearOrderError: (state) => {
      state.error = null;
    },
    resetCurrentOrder: (state) => {
      state.currentOrder = null;
    }
  }
});

export const { 
  fetchOrdersStart, 
  fetchOrdersSuccess, 
  fetchOrdersFailure,
  fetchOrderByIdStart,
  fetchOrderByIdSuccess,
  fetchOrderByIdFailure,
  createOrderStart,
  createOrderSuccess,
  createOrderFailure,
  updateOrderStatusStart,
  updateOrderStatusSuccess,
  updateOrderStatusFailure,
  setOrderFilters, 
  clearOrderFilters, 
  clearOrderError,
  resetCurrentOrder
} = orderSlice.actions;

export default orderSlice.reducer;