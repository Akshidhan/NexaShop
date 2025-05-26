import React, { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiLocationMarker } from "react-icons/hi";
import api from '../../../../utils/axios';

const CheckoutAddressSelector = ({ 
  currentUser, 
  selectedAddressId,
  onAddressSelect, 
  onShowAddressForm 
}) => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/users/${currentUser}`);
        if (response.data.addresses && Array.isArray(response.data.addresses)) {
          setAddresses(response.data.addresses);
          
          if (response.data.addresses.length > 0 && !selectedAddressId) {
            const defaultAddress = response.data.addresses.find(addr => addr.isDefault) || response.data.addresses[0];
            onAddressSelect(defaultAddress, addresses.indexOf(defaultAddress));
          }
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchAddresses();
    }
  }, [currentUser]);

  if (isLoading) {
    return <div className="loading">Loading your addresses...</div>;
  }

  return (
    <div className="checkout-addresses">
      <div className="section-header">
        <h2>Shipping Address</h2>
        <button 
          type="button" 
          className="btn-add-address"
          onClick={onShowAddressForm}
        >
          <HiPlus /> New Address
        </button>
      </div>
      
      {addresses.length === 0 ? (
        <div className="empty-addresses">
          <HiLocationMarker className="icon" />
          <p>You don't have any saved addresses yet.</p>
          <button 
            type="button" 
            className="btn-add-first-address"
            onClick={onShowAddressForm}
          >
            Add a Shipping Address
          </button>
        </div>
      ) : (
        <div className="address-grid">
          {addresses.map((address, index) => (
            <div 
              key={index} 
              className={`address-card ${selectedAddressId === index ? 'selected' : ''}`}
              onClick={() => onAddressSelect(address, index)}
            >
              <div className="address-content">
                <div className="address-details">
                  <p>{address.addressLine}</p>
                  <p>{address.city}, {address.state} {address.postalCode}</p>
                  <p>{address.country}</p>
                </div>
                {address.isDefault && <span className="default-badge">Default</span>}
              </div>
              <button 
                type="button" 
                className="btn-edit"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowAddressForm(address, index);
                }}
              >
                <HiPencil />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckoutAddressSelector;
