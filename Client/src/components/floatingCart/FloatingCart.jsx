import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import '../../pages/home/components/floatingCart/FloatingCart.css';

function FloatingCart() {
  const { items, totalItems, totalPrice } = useSelector((state) => state.cart);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    // Show floating cart when items exist and we're not already on the cart page
    if (totalItems > 0 && !window.location.pathname.includes('/cart')) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
      setIsExpanded(false);
    }
  }, [totalItems, window.location.pathname]);
  
  if (!isVisible) return null;
  
  return (
    <div className={`floating-cart ${isExpanded ? 'expanded' : ''}`}>
      <div className="floating-cart-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="cart-icon">
          <i className="fas fa-shopping-cart"></i>
          <span className="cart-count">{totalItems}</span>
        </div>
        <div className="cart-total">${totalPrice.toFixed(2)}</div>
        <button className="toggle-button">
          {isExpanded ? '▼' : '▲'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="floating-cart-content">
          <div className="mini-cart-items">
            {items.slice(0, 3).map((item) => (
              <div key={item._id} className="mini-cart-item">
                <img 
                  src={item.product?.mainImage?.url || '/image.png'} 
                  alt={item.product?.name} 
                />
                <div className="mini-item-details">
                  <span className="mini-item-name">{item.product?.name}</span>
                  <span className="mini-item-price">
                    {item.quantity} × ${item.priceAtAddition.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
            
            {items.length > 3 && (
              <div className="more-items">
                +{items.length - 3} more items
              </div>
            )}
          </div>
          
          <div className="mini-cart-actions">
            <Link to="/cart" className="view-cart-btn">
              View Cart
            </Link>
            <Link to="/checkout" className="checkout-btn">
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default FloatingCart;
