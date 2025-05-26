import React, { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash, HiCheck } from "react-icons/hi";
import api from '../../../../utils/axios';

function AddressBook({ currentUser }) {
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addressFormData, setAddressFormData] = useState({
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isDefault: false
  });

  // Fetch addresses when component mounts
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/users/${currentUser}`);
        if (response.data.addresses && Array.isArray(response.data.addresses)) {
          setAddresses(response.data.addresses);
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

  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData({
      ...addressFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddAddress = () => {
    setShowAddressForm(true);
    setEditingAddress(null);
    setAddressFormData({
      addressLine: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      isDefault: false
    });
  };

  const handleEditAddress = (address, index) => {
    setShowAddressForm(true);
    setEditingAddress(index);
    setAddressFormData({
      addressLine: address.addressLine || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || '',
      isDefault: address.isDefault || false
    });
  };

  const handleCancelAddressEdit = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = async (index) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const updatedAddresses = [...addresses];
        updatedAddresses.splice(index, 1);
        
        await api.put(`/users/address/${currentUser}`, {
          addresses: updatedAddresses
        });
        
        setAddresses(updatedAddresses);
        alert('Address deleted successfully!');
      } catch (error) {
        console.error("Error deleting address:", error);
        alert('Error deleting address: ' + (error.response?.data?.message || 'Unknown error'));
      }
    }
  };

  const handleSetDefaultAddress = async (index) => {
    try {
      const updatedAddresses = addresses.map((address, i) => ({
        ...address,
        isDefault: i === index
      }));
      
      await api.put(`/users/address/${currentUser}`, {
        addresses: updatedAddresses
      });
      
      setAddresses(updatedAddresses);
      alert('Default address updated successfully!');
    } catch (error) {
      console.error("Error updating default address:", error);
      alert('Error updating default address: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!addressFormData.addressLine || !addressFormData.city || 
        !addressFormData.state || !addressFormData.postalCode || 
        !addressFormData.country) {
      alert('Please fill in all address fields');
      return;
    }

    try {
      let updatedAddresses = [...addresses];
      
      if (editingAddress !== null) {
        // Editing existing address
        updatedAddresses[editingAddress] = addressFormData;
      } else {
        // Adding new address
        // If this is the first address or it's marked as default, ensure it's the only default
        if (addressFormData.isDefault || updatedAddresses.length === 0) {
          updatedAddresses = updatedAddresses.map(address => ({
            ...address,
            isDefault: false
          }));
        }
        updatedAddresses.push(addressFormData);
      }

      // If there are no addresses with isDefault=true, set the first one as default
      if (!updatedAddresses.some(address => address.isDefault)) {
        updatedAddresses[0].isDefault = true;
      }
      
      await api.put(`/users/address/${currentUser}`, {
        addresses: updatedAddresses
      });
      
      setAddresses(updatedAddresses);
      setShowAddressForm(false);
      setEditingAddress(null);
      alert('Address saved successfully!');
    } catch (error) {
      console.error("Error saving address:", error);
      alert('Error saving address: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  return (
    <div className="content-section">
      <h2>Address Book</h2>
      
      {isLoading ? (
        <div className="loading">Loading your addresses...</div>
      ) : (
        <>
          {!showAddressForm ? (
            <div className="address-book-container">
              {addresses.length > 0 ? (
                <>
                  <div className="address-list">
                    {addresses.map((address, index) => (
                      <div key={index} className={`address-card ${address.isDefault ? 'default' : ''}`}>
                        {address.isDefault && <span className="default-badge">Default</span>}
                        <div className="address-content">
                          <div className="address-details">
                            <p>{address.addressLine}</p>
                            <p>{address.city}, {address.state} {address.postalCode}</p>
                            <p>{address.country}</p>
                          </div>
                          <div className="address-actions">
                            <button 
                              type="button" 
                              className="btn-edit"
                              onClick={() => handleEditAddress(address, index)}
                            >
                              <HiPencil /> Edit
                            </button>
                            {!address.isDefault && (
                              <>
                                <button 
                                  type="button" 
                                  className="btn-default"
                                  onClick={() => handleSetDefaultAddress(index)}
                                >
                                  <HiCheck /> Set as Default
                                </button>
                                <button 
                                  type="button" 
                                  className="btn-delete"
                                  onClick={() => handleDeleteAddress(index)}
                                >
                                  <HiTrash /> Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    type="button" 
                    className="btn-add-address"
                    onClick={handleAddAddress}
                  >
                    <HiPlus /> Add New Address
                  </button>
                </>
              ) : (
                <div className="empty-state">
                  <p>You don't have any saved addresses yet.</p>
                  <button 
                    type="button" 
                    className="btn-add-address"
                    onClick={handleAddAddress}
                  >
                    <HiPlus /> Add New Address
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="address-form-container">
              <h3>{editingAddress !== null ? 'Edit Address' : 'Add New Address'}</h3>
              <form onSubmit={handleSubmitAddress}>
                <div className="form-group">
                  <label htmlFor="addressLine">Address Line</label>
                  <input
                    type="text"
                    id="addressLine"
                    name="addressLine"
                    value={addressFormData.addressLine}
                    onChange={handleAddressInputChange}
                    placeholder="Street address, P.O. box, company name, etc."
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={addressFormData.city}
                      onChange={handleAddressInputChange}
                      placeholder="City"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="state">State/Province</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={addressFormData.state}
                      onChange={handleAddressInputChange}
                      placeholder="State/Province"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="postalCode">Postal Code</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={addressFormData.postalCode}
                      onChange={handleAddressInputChange}
                      placeholder="Postal Code"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={addressFormData.country}
                      onChange={handleAddressInputChange}
                      placeholder="Country"
                    />
                  </div>
                </div>
                
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={addressFormData.isDefault}
                    onChange={handleAddressInputChange}
                  />
                  <label htmlFor="isDefault">Set as default address</label>
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn-submit">
                    {editingAddress !== null ? 'Update Address' : 'Save Address'}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={handleCancelAddressEdit}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AddressBook;
