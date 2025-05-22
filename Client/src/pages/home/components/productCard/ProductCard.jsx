import React from 'react';
import './productCard.css';

function ProductCard({ product }) {
  const name = product.name;
  const price = product.basePrice;
  const image = product.mainImage?.url;
  const category = product.category?.name || 'Product';
  
  return (
    <div className="product-card">
      <div className="product-card-image">
        <img src={image} alt={name} />
      </div>
      <div className="product-info">
        <span className="product-category">{category}</span>
        <h3 className="product-name">{name}</h3>
        <div className="product-price">
            <span className="regular-price">Rs. {price}</span>
        </div>
        <button className="add-to-cart-btn">Add to Cart</button>
      </div>
    </div>
  );
}

export default ProductCard;