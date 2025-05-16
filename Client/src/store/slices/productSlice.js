import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  totalCount: 0,
  filters: {
    category: null,
    minPrice: null,
    maxPrice: null,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    // Fetch products actions
    fetchProductsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProductsSuccess: (state, action) => {
      state.loading = false;
      state.products = action.payload.products || action.payload;
      state.totalCount = action.payload.totalCount || action.payload.length;
    },
    fetchProductsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch products';
    },

    // Fetch single product actions
    fetchProductByIdStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProductByIdSuccess: (state, action) => {
      state.loading = false;
      state.currentProduct = action.payload;
    },
    fetchProductByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch product';
    },

    // Create product actions
    createProductStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createProductSuccess: (state, action) => {
      state.loading = false;
      state.products.unshift(action.payload);
    },
    createProductFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to create product';
    },

    // Update product actions
    updateProductStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateProductSuccess: (state, action) => {
      state.loading = false;
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
      if (state.currentProduct?.id === action.payload.id) {
        state.currentProduct = action.payload;
      }
    },
    updateProductFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to update product';
    },

    // Delete product actions
    deleteProductStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteProductSuccess: (state, action) => {
      state.loading = false;
      state.products = state.products.filter(p => p.id !== action.payload);
      if (state.currentProduct?.id === action.payload) {
        state.currentProduct = null;
      }
    },
    deleteProductFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to delete product';
    },

    // Filter actions
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearProductError: (state) => {
      state.error = null;
    }
  }
});

export const {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  fetchProductByIdStart,
  fetchProductByIdSuccess,
  fetchProductByIdFailure,
  createProductStart,
  createProductSuccess,
  createProductFailure,
  updateProductStart,
  updateProductSuccess,
  updateProductFailure,
  deleteProductStart,
  deleteProductSuccess,
  deleteProductFailure,
  setFilters,
  clearFilters,
  clearProductError
} = productSlice.actions;

export default productSlice.reducer;