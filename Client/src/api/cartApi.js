import axios from 'axios';

const baseUrl = import.meta.env.VITE_BASE_URL;

// Get user's cart from the database
export const fetchUserCartFromDB = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token');
  }
  
  const response = await axios.get(`${baseUrl}/cart`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data;
};

// Save cart to database
export const saveCartToDB = async (cartItems) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token');
  }
  
  const response = await axios.post(`${baseUrl}/cart`, {
    items: cartItems
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data;
};

// Add a single item to the cart in the database
export const addItemToDB = async (item) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token');
  }
  
  const response = await axios.post(`${baseUrl}/cart/item`, item, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data;
};

// Update a cart item quantity in the database
export const updateItemQuantityInDB = async (itemId, quantity) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token');
  }
  
  const response = await axios.patch(`${baseUrl}/cart/item/${itemId}`, {
    quantity
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data;
};

// Remove an item from the cart in the database
export const removeItemFromDB = async (itemId) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token');
  }
  
  const response = await axios.delete(`${baseUrl}/cart/item/${itemId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data;
};

// Clear the entire cart in the database
export const clearCartInDB = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token');
  }
  
  const response = await axios.delete(`${baseUrl}/cart`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data;
};