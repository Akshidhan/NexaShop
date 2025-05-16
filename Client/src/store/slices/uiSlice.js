import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  modals: {
    cart: false,
    login: false,
    productDetail: false,
    checkout: false,
    orderConfirmation: false
  },
  activeProductId: null,
  activeOrderId: null,
  isMobileMenuOpen: false,
  isSidebarExpanded: true,
  isDarkMode: false,
  loadingStates: {}
};

let nextNotificationId = 1;

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Notification actions
    addNotification: (state, action) => {
      const { message, type = 'info', duration = 5000 } = action.payload;
      const id = nextNotificationId++;
      
      state.notifications.push({
        id,
        message,
        type,
        duration
      });
    },
    
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    
    // Modal actions
    openModal: (state, action) => {
      const { name, data } = action.payload;
      state.modals[name] = true;
      
      // Store active IDs if provided
      if (name === 'productDetail' && data?.productId) {
        state.activeProductId = data.productId;
      }
      
      if (name === 'orderConfirmation' && data?.orderId) {
        state.activeOrderId = data.orderId;
      }
    },
    
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
      
      // Clear active IDs when closing related modals
      if (action.payload === 'productDetail') {
        state.activeProductId = null;
      }
      
      if (action.payload === 'orderConfirmation') {
        state.activeOrderId = null;
      }
    },
    
    // Mobile menu actions
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false;
    },
    
    // Sidebar actions
    toggleSidebar: (state) => {
      state.isSidebarExpanded = !state.isSidebarExpanded;
    },
    
    // Theme actions
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem('darkMode', String(state.isDarkMode));
    },
    
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
      localStorage.setItem('darkMode', String(state.isDarkMode));
    },
    
    // Loading state actions
    setLoadingState: (state, action) => {
      const { key, isLoading } = action.payload;
      state.loadingStates[key] = isLoading;
    }
  }
});

export const {
  addNotification,
  removeNotification,
  clearAllNotifications,
  openModal,
  closeModal,
  toggleMobileMenu,
  closeMobileMenu,
  toggleSidebar,
  toggleDarkMode,
  setDarkMode,
  setLoadingState
} = uiSlice.actions;

export default uiSlice.reducer;