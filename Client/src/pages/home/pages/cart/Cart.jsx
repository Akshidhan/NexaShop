import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart, updateCart, createCart, removeFromCart } from '../../../../store/slices/cartSlice';
import './Cart.css';

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useSelector((state) => state.user);
  const { items, loading, error, totalItems, totalPrice } = useSelector((state) => state.cart);
  
  const [localItems, setLocalItems] = useState([]);
  
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      dispatch(fetchCart(currentUser))
        .catch((error) => {
          if (error.response?.data?.message === 'Cart not found') {
            dispatch(createCart(currentUser));
          }
        });
    } else {
      // Redirect to login if not authenticated
      navigate('/signin', { state: { from: '/cart' } });
    }
  }, [dispatch, currentUser, isAuthenticated, navigate]);
  
  useEffect(() => {
    setLocalItems(items);
  }, [items]);
  
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = localItems.map(item => 
      item._id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    setLocalItems(updatedItems);
    
    const timeoutId = setTimeout(() => {
      dispatch(updateCart({ userId: currentUser, items: updatedItems }))
        .catch(error => console.error('Error updating cart:', error));
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };
  
  const handleRemoveItem = (itemId) => {
    const updatedItems = localItems.filter(item => item._id !== itemId);
    setLocalItems(updatedItems);
    dispatch(updateCart({ userId: currentUser, items: updatedItems }))
      .catch(error => console.error('Error removing item from cart:', error));
  };
  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
//   if (loading) {
//     return (
//       <div className="cart-container">
//         <h1 className="cart-title">Your Cart</h1>
//         <div className="loading">Loading your cart...</div>
//       </div>
//     );
//   }
  
  if (error) {
    return (
      <div className="cart-container">
        <h1 className="cart-title">Your Cart</h1>
        <div className="error-message">Error: {error}</div>
        <div className="continue-shopping">
          <Link to="/" className="continue-link">Continue Shopping</Link>
        </div>
      </div>
    );
  }
  
  if (!localItems.length) {
    return (
      <div className="cart-container">
        <h1 className="cart-title">Your Cart</h1>
        <div className="cart-empty">
          <p className="cart-empty-message">Your cart is empty</p>
          <div className="continue-shopping">
            <Link to="/" className="continue-link">Start Shopping</Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="cart-container">
      <h1 className="cart-title">Your Cart</h1>
      
      <div className="cart-items">
        {localItems.map((item) => (
          <div key={item._id} className="cart-item">
            <img 
              src={item.product?.mainImage?.url || '/image.png'} 
              alt={item.product?.name} 
              className="cart-item-image" 
            />
            
            <div className="item-details">
              <span className="item-name">{item.product?.name}</span>
              {item.variant && (
                <span className="item-variant">
                  {Object.entries(item.variant.attributes).map(([key, value]) => 
                    `${key}: ${value}`
                  ).join(', ')}
                </span>
              )}
            </div>
            
            <div className="quantity-controls">
              <button 
                className="quantity-btn"
                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                className="quantity-input"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value))}
              />
              <button 
                className="quantity-btn"
                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
              >
                +
              </button>
            </div>
            
            <div className="item-price">
              ${(item.priceAtAddition * item.quantity).toFixed(2)}
            </div>
            
            <button 
              className="remove-btn"
              onClick={() => handleRemoveItem(item._id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      <div className="cart-summary">
        <div className="summary-row">
          <span className="subtotal-label">Subtotal ({totalItems} items):</span>
          <span className="subtotal-value">${totalPrice.toFixed(2)}</span>
        </div>
        
        <div className="summary-row total">
          <span className="total-label">Total:</span>
          <span className="total-value">${totalPrice.toFixed(2)}</span>
        </div>
        
        <button 
          className="checkout-btn"
          onClick={handleCheckout}
          disabled={!localItems.length}
        >
          Proceed to Checkout
        </button>
      </div>
      
      <div className="continue-shopping">
        <Link to="/" className="continue-link">Continue Shopping</Link>
      </div>
    </div>
  );
}

export default Cart;