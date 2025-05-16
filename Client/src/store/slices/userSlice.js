import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.currentUser = action.payload.user;
      state.role = action.paylooad.user.role;
      // Note: You'll need to store the token in your login component
      // localStorage.setItem('token', action.payload.accessToken);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Login failed';
    },
    fetchProfileStart: (state) => {
      state.loading = true;
    },
    fetchProfileSuccess: (state, action) => {
      state.loading = false;
      state.currentUser = action.payload;
      state.isAdmin = action.payload?.role === 'admin';
      state.isAuthenticated = true;
    },
    fetchProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch profile';
    },
    logout: (state) => {
      localStorage.removeItem('token');
      state.currentUser = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  logout, 
  clearError 
} = userSlice.actions;

export default userSlice.reducer;