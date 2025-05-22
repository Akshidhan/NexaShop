import React from 'react';
import './productCard.css';

function ProductCard({ product }) {
  const { name, price, image, discount, category } = product;
  
  return (
    <div className="product-card">
      <div className="product-card-image">
        <img src={image} alt={name} />
      </div>
      <div className="product-info">
        <span className="product-category">{category}</span>
        <h3 className="product-name">{name}</h3>
        <div className="product-price">
            <span className="regular-price">${price}</span>
        </div>
        <button className="add-to-cart-btn">Add to Cart</button>
      </div>
    </div>
  );
}

export default ProductCard;