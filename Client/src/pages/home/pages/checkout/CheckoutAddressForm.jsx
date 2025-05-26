import React from 'react';

const CheckoutAddressForm = ({ 
  addressFormData, 
  handleAddressInputChange, 
  handleSubmitAddress, 
  handleCancelAddressEdit,
  isEditMode
}) => {
  return (
    <div className="checkout-address-form">
      <h3>{isEditMode ? 'Edit Address' : 'Add New Address'}</h3>
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
            required
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
              required
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
              required
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
              required
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
              required
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
            {isEditMode ? 'Update Address' : 'Save Address'}
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
  );
};

export default CheckoutAddressForm;
