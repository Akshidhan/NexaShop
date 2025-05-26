import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCart } from '../../../../store/slices/cartSlice';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { HiShoppingBag, HiArrowNarrowLeft } from 'react-icons/hi';
import CheckoutAddressSelector from './CheckoutAddressSelector';
import CheckoutAddressForm from './CheckoutAddressForm';
import CheckoutStripeForm from './CheckoutStripeForm';
import api from '../../../../utils/axios';
import './Checkout.css';

// Initialize Stripe with your publishable key - use test key if env variable is not set
const STRIPE_KEY = 'pk_test_51HoPzuKhBnEG0cL2TuGT2sljli2ucf6xqofMI7tFAp3d9lDHC7qlgXATmUocp7E84Q9EkuDnRYYQdDHbeJT4N5te00lGWUBp81';
let stripeApiKey = '';
try {
  stripeApiKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || STRIPE_KEY;
  if (!stripeApiKey) {
    throw new Error('Stripe API Key is missing');
  }
} catch (err) {
  console.warn('Using fallback Stripe test key', err);
  stripeApiKey = STRIPE_KEY;
}

console.log('Using Stripe publishable key:', stripeApiKey.substring(0, 10) + '...');

const stripePromise = loadStripe(stripeApiKey).catch(error => {
  console.error('Failed to initialize Stripe:', error);
  return Promise.resolve(null);
});

function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useSelector((state) => state.user);
  const { items, loading, error, totalItems, totalPrice } = useSelector((state) => state.cart);

  const [currentStep, setCurrentStep] = useState('address');
  
  // Address management
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isDefault: false
  });

  // Payment management
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentError, setPaymentError] = useState(null);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      console.log('Current user in checkout:', currentUser);
      dispatch(fetchCart(currentUser))
        .catch(error => console.error('Error fetching cart:', error));
    } else {
      // Redirect to login if not authenticated
      navigate('/signin', { state: { from: '/checkout' } });
    }
  }, [dispatch, currentUser, isAuthenticated, navigate]);

  useEffect(() => {
    // Redirect back to cart if there are no items
    if (!loading && items.length === 0) {
      navigate('/cart');
    }
  }, [items, loading, navigate]);

  // Handle address selection
  const handleAddressSelect = (address, index) => {
    setSelectedAddress(address);
    setSelectedAddressId(index);
  };

  // Handle showing address form
  const handleShowAddressForm = (address = null, index = null) => {
    if (address) {
      setEditingAddress(index);
      setAddressFormData({
        addressLine: address.addressLine || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || '',
        isDefault: address.isDefault || false
      });
    } else {
      setEditingAddress(null);
      setAddressFormData({
        addressLine: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        isDefault: false
      });
    }
    setShowAddressForm(true);
  };

  // Handle address form input changes
  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData({
      ...addressFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission for addresses
  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.get(`/users/${currentUser}`);
      let userAddresses = response.data.addresses || [];
      
      if (editingAddress !== null) {
        // Update existing address
        userAddresses[editingAddress] = addressFormData;
        
        // If making this address default, update others
        if (addressFormData.isDefault) {
          userAddresses = userAddresses.map((addr, idx) => ({
            ...addr,
            isDefault: idx === editingAddress
          }));
        }
      } else {
        // Add new address
        // If this is the first address or it's marked as default, ensure it's the only default
        if (addressFormData.isDefault || userAddresses.length === 0) {
          userAddresses = userAddresses.map(addr => ({
            ...addr,
            isDefault: false
          }));
        }
        userAddresses.push(addressFormData);
      }

      // If there are no addresses with isDefault=true, set the first one as default
      if (!userAddresses.some(addr => addr.isDefault)) {
        userAddresses[0].isDefault = true;
      }
      
      await api.put(`/users/address/${currentUser}`, {
        addresses: userAddresses
      });
      
      // Select the new/edited address if applicable
      const addressIndex = editingAddress !== null ? editingAddress : userAddresses.length - 1;
      setSelectedAddress(addressFormData);
      setSelectedAddressId(addressIndex);
      
      setShowAddressForm(false);
      setEditingAddress(null);
      
    } catch (error) {
      console.error("Error saving address:", error);
      alert('Error saving address: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleCancelAddressEdit = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const proceedToPayment = async () => {
    if (!selectedAddress) {
      alert("Please select a shipping address or add a new one.");
      return;
    }
    
    if (!currentUser) {
      alert("User authentication error. Please login again.");
      navigate('/signin');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Make sure currentUser is a string
      const userId = String(currentUser);
      
      console.log('Creating order with userId:', userId);
      
      const orderResponse = await api.post(`/orders/${userId}`, {
        total: finalTotal,
        shippingAddress: selectedAddress,
        items: items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          subTotal: item.priceAtAddition * item.quantity
        }))
      });
      
      if (!orderResponse.data._id) {
        console.error('Order created but no ID returned:', orderResponse.data);
        throw new Error('No order ID returned from server');
      }
      
      const newOrderId = orderResponse.data._id;
      console.log('Order created successfully with ID:', newOrderId);
      setOrderId(newOrderId);
      
      // Create payment intent
      console.log('Creating payment intent for orderId:', newOrderId);
      const paymentResponse = await api.post('/payments/intent', {
        orderId: newOrderId
      });
      
      if (!paymentResponse.data.clientSecret) {
        throw new Error('No client secret returned from the server');
      }
      
      setClientSecret(paymentResponse.data.clientSecret);
      setCurrentStep('payment');
    } catch (error) {
      console.error('Error creating order:', error);
      const errorMsg = error.response?.data?.message || 'Unknown error';
      console.log('Request failed with status:', error.response?.status);
      console.log('Error details:', error.response?.data);
      console.log('User ID used:', currentUser);
      alert('There was a problem processing your order: ' + errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment submission
  const handlePaymentSubmit = async (stripe, elements) => {
    if (!stripe || !elements) {
      throw new Error('Stripe has not been properly initialized.');
    }
    
    const cardElement = elements.getElement('card');
    if (!cardElement) {
      throw new Error('Card element not found.');
    }

    setIsProcessing(true);
    
    try {
      if (!clientSecret) {
        throw new Error('Payment intent not created. Please try again.');
      }
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });
      
      if (error) {
        setPaymentError(error.message);
        setIsProcessing(false);
        throw error;
      } else if (paymentIntent.status === 'succeeded') {
        // Update order payment status in database
        try {
          await api.put(`/orders/payment/${orderId}`, {
            paymentStatus: 'paid'
          });
          console.log('Order payment status updated to paid');
        } catch (updateError) {
          console.error('Error updating order payment status:', updateError);
          // Continue with navigation even if status update fails
        }
        
        // Payment successful, redirect to confirmation
        navigate('/order-confirmation', { 
          state: { 
            orderId: orderId,
            items,
            totalPrice,
            selectedAddress,
            paymentMethod
          }
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('An unexpected error occurred while processing your payment.');
      setIsProcessing(false);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="checkout-container">
        <h1 className="checkout-title">Checkout</h1>
        <div className="loading">Loading checkout information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-container">
        <h1 className="checkout-title">Checkout</h1>
        <div className="error-message">Error: {error}</div>
        <button className="back-button" onClick={() => navigate('/cart')}>
          <HiArrowNarrowLeft className="icon" /> Back to Cart
        </button>
      </div>
    );
  }

  // Calculate final totals
  const shippingCost = 0;
  const taxRate = 0.1;
  const taxAmount = totalPrice * taxRate;
  const finalTotal = totalPrice + taxAmount + shippingCost;

  // Render content based on current checkout step
  const renderCheckoutContent = () => {
    switch (currentStep) {
      case 'address':
        return (
          <>
            <div className="checkout-step-indicator">
              <div className="step active">1. Address</div>
              <div className="step">2. Payment</div>
              <div className="step">3. Review</div>
            </div>
            
            <div className="checkout-grid">
              <div className="checkout-main">
                {showAddressForm ? (
                  <CheckoutAddressForm
                    addressFormData={addressFormData}
                    handleAddressInputChange={handleAddressInputChange}
                    handleSubmitAddress={handleSubmitAddress}
                    handleCancelAddressEdit={handleCancelAddressEdit}
                    isEditMode={editingAddress !== null}
                  />
                ) : (
                  <CheckoutAddressSelector
                    currentUser={currentUser}
                    selectedAddressId={selectedAddressId}
                    onAddressSelect={handleAddressSelect}
                    onShowAddressForm={handleShowAddressForm}
                  />
                )}
                
                <div className="checkout-actions">
                  <button type="button" className="back-button" onClick={() => navigate('/cart')}>
                    <HiArrowNarrowLeft className="icon" /> Back to Cart
                  </button>
                  {!showAddressForm && (
                    <button 
                      type="button" 
                      className="next-button" 
                      onClick={proceedToPayment}
                      disabled={isProcessing || !selectedAddress}
                    >
                      {isProcessing ? 'Processing...' : 'Continue to Payment'}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="order-summary">
                <h2><HiShoppingBag className="icon" /> Order Summary</h2>
                <div className="summary-items">
                  {items.map((item) => (
                    <div key={item._id} className="summary-item">
                      <div className="item-info">
                        <span className="item-quantity">{item.quantity}x</span>
                        <span className="item-name">{item.product?.name}</span>
                      </div>
                      <span className="item-price">${(item.priceAtAddition * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="summary-totals">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span>${shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax:</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
        
      case 'payment':
        return (
          <>
            <div className="checkout-step-indicator">
              <div className="step completed">1. Address</div>
              <div className="step active">2. Payment</div>
              <div className="step">3. Review</div>
            </div>
            
            <div className="checkout-grid">
              <div className="checkout-main">
                <div className="payment-container">
                  <h2>Payment Method</h2>
                  
                  {clientSecret ? (
                    <Elements stripe={stripePromise}>
                      <CheckoutStripeForm
                        clientSecret={clientSecret}
                        totalAmount={finalTotal}
                        onPaymentComplete={() => setCurrentStep('review')}
                        processing={isProcessing}
                        error={paymentError}
                        onBack={() => setCurrentStep('address')}
                        onPaymentSubmit={handlePaymentSubmit}
                      />
                    </Elements>
                  ) : (
                    <div className="loading-payment">
                      <p>Preparing payment form...</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="order-summary">
                <h2><HiShoppingBag className="icon" /> Order Summary</h2>
                <div className="summary-items">
                  {items.map((item) => (
                    <div key={item._id} className="summary-item">
                      <div className="item-info">
                        <span className="item-quantity">{item.quantity}x</span>
                        <span className="item-name">{item.product?.name}</span>
                      </div>
                      <span className="item-price">${(item.priceAtAddition * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="shipping-address-summary">
                  <h3>Shipping to:</h3>
                  <p>{selectedAddress.addressLine}</p>
                  <p>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}</p>
                  <p>{selectedAddress.country}</p>
                </div>
                
                <div className="summary-totals">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span>${shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax:</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Checkout</h1>
      {renderCheckoutContent()}
    </div>
  );
}

export default Checkout;
