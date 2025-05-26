import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../../../store/slices/cartSlice';
import './OrderConfirmation.css';

function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { orderId, items, totalPrice, shippingAddress, paymentMethod } = location.state || {};
  
  // If no order details are present, redirect to homepage
  React.useEffect(() => {
    if (!orderId) {
      navigate('/');
    } else {
      // Clear the cart since the order has been placed
      dispatch(clearCart());
    }
  }, [orderId, navigate, dispatch]);
  
  if (!orderId) {
    return null; // Will redirect in the useEffect
  }
  
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  const getEstimatedDeliveryDate = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5); // Estimated delivery in 5 days
    return formatDate(deliveryDate);
  };
  
  return (
    <div className="order-confirmation-container">
      <div className="confirmation-header">
        <div className="check-icon">✓</div>
        <h1>Order Confirmed!</h1>
        <p>Your order has been received and is being processed.</p>
      </div>
      
      <div className="confirmation-details">
        <div className="confirmation-section">
          <h2>Order Details</h2>
          <div className="detail-row">
            <span>Order Number:</span>
            <span className="detail-value">{orderId}</span>
          </div>
          <div className="detail-row">
            <span>Order Date:</span>
            <span className="detail-value">{formatDate(new Date())}</span>
          </div>
          <div className="detail-row">
            <span>Estimated Delivery:</span>
            <span className="detail-value">{getEstimatedDeliveryDate()}</span>
          </div>
          <div className="detail-row">
            <span>Payment Method:</span>
            <span className="detail-value">
              {paymentMethod === 'creditCard' ? 'Credit Card' : 
               paymentMethod === 'paypal' ? 'PayPal' : 'Bank Transfer'}
            </span>
          </div>
        </div>
        
        <div className="confirmation-section">
          <h2>Shipping Address</h2>
          <address>
            {shippingAddress?.fullName}<br />
            {shippingAddress?.address}<br />
            {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.postalCode}<br />
            {shippingAddress?.country}<br />
            Phone: {shippingAddress?.phone}
          </address>
        </div>
      </div>
      
      <div className="order-summary">
        <h2>Order Summary</h2>
        <div className="order-items">
          {items?.map((item) => (
            <div key={item._id} className="order-item">
              <div className="item-info">
                <span className="item-quantity">{item.quantity}x</span>
                <span className="item-name">{item.product?.name}</span>
              </div>
              <span className="item-price">${(item.priceAtAddition * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <div className="order-totals">
          <div className="total-row">
            <span>Subtotal:</span>
            <span>${totalPrice?.toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>Shipping:</span>
            <span>$0.00</span>
          </div>
          <div className="total-row">
            <span>Tax:</span>
            <span>${(totalPrice * 0.1).toFixed(2)}</span>
          </div>
          <div className="total-row final-total">
            <span>Total:</span>
            <span>${(totalPrice * 1.1).toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="confirmation-actions">
        <button 
          className="continue-shopping-btn"
          onClick={() => navigate('/')}
        >
          Continue Shopping
        </button>
        
        <button 
          className="view-orders-btn"
          onClick={() => navigate('/userpanel/orders')}
        >
          View My Orders
        </button>
      </div>
    </div>
  );
}

export default OrderConfirmation;
