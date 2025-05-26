import React, { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { HiArrowNarrowLeft } from "react-icons/hi";
import "./Checkout.css";

const CheckoutStripeForm = ({ 
  clientSecret, 
  totalAmount, 
  onPaymentComplete, 
  onBack,
  onPaymentSubmit,
  processing, 
  error 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCardChange = (e) => {
    if (e.error) {
      setCardError(e.error.message);
    } else {
      setCardError(null);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Call the parent component's payment submit handler
      await onPaymentSubmit(stripe, elements);
    } catch (error) {
      console.error('Payment submission error:', error);
      setCardError(error.message || 'An error occurred during payment processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-payment-form">
      <div className="stripe-card-container">
        <label htmlFor="card-element">Credit or debit card</label>
        <CardElement
          id="card-element"
          onChange={handleCardChange}
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
            hidePostalCode: true,
          }}
        />
        {cardError && <div className="card-error">{cardError}</div>}
        {error && <div className="payment-error">{error}</div>}
      </div>
      
      <div className="payment-summary">
        <div className="payment-total">
          <span>Total Payment:</span>
          <span className="amount">${totalAmount.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="checkout-actions">
        <button 
          type="button" 
          className="back-button" 
          onClick={onBack}
        >
          <HiArrowNarrowLeft className="icon" /> Back to Address
        </button>
        <button 
          type="submit" 
          className="place-order-button"
          disabled={processing || !stripe || !clientSecret}
        >
          {processing ? 'Processing Payment...' : 'Pay Now'}
        </button>
      </div>
    </form>
  );
};

export default CheckoutStripeForm;
