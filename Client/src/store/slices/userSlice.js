import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  currentUser: null,
  isAuthenticated: false,
  role: null,
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
      console.log("Login Success Payload:", action.payload); // Debug payload
      
      state.loading = false;
      state.isAuthenticated = true;
      state.currentUser = action.payload.id;
      state.role = action.payload.role; // Explicitly ensure role is set

      // Log the state after update for debugging
      console.log("Redux state after login:", {
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        role: state.role
      });

      if (action.payload.accessToken) {
        localStorage.setItem('token', action.payload.accessToken);
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload?.errorMessage || 'Login failed';
    },
    logout: (state) => {
      // Set the state changes first (synchronous)
      state.currentUser = null;
      state.isAuthenticated = false;
      state.role = null;
      state.loading = false;
      // Remove token
      localStorage.removeItem('token');
      
      axios.post(`${import.meta.env.VITE_BASE_URL}/auth/logout`, {
        withCredentials: true
      })
        .then(response => {
          console.log('Logout successful:', response.data);
      })
        .catch(error => console.error('Logout API error:', error));
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
  logout,
  clearError 
} = userSlice.actions;


export default userSlice.reducer;