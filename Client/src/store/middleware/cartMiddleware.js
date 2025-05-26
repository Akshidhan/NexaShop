import { fetchCart } from '../slices/cartSlice';

// Middleware to fetch cart data when a user logs in successfully
const cartMiddleware = store => next => action => {
  // Call the next dispatch method in the middleware chain
  const result = next(action);
  
  // If the action type is loginSuccess (user just logged in)
  if (action.type === 'user/loginSuccess') {
    const userId = action.payload.id;
    if (userId) {
      // Fetch the user's cart
      store.dispatch(fetchCart(userId));
    }
  }
  
  return result;
};

export default cartMiddleware;
