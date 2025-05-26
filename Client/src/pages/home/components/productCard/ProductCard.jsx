import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCart, createCart, addToCart } from '../../../../store/slices/cartSlice';
import './productCard.css';

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useSelector((state) => state.user);
  const { items } = useSelector((state) => state.cart);

  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const name = product.name;
  const price = product.basePrice;
  const image = product.mainImage?.url;
  const category = product.category?.name || 'Product';

  const handleProductClick = () => {
    navigate(`/product/${product._id}`);
  };
  
  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevent triggering product click when add to cart is clicked
    
    if (!isAuthenticated) {
      window.location.href = '/signin?redirect=back';
      return;
    }

    setIsAddingToCart(true);

    try {
      try {
        await dispatch(fetchCart(currentUser));
      } catch (error) {
        if (error.response?.data?.message === 'Cart not found') {
          await dispatch(createCart(currentUser));
        }
      }

      await dispatch(addToCart({
        userId: currentUser,
        product: {
          _id: product._id,
          basePrice: price,
          imageUrl: image
        },
        quantity: 1
      }));

      // Show success feedback
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="product-card" onClick={handleProductClick}>
      <div className="product-card-image">
        <img src={image} alt={name} />
      </div>
      <div className="product-info">
        <span className="product-category">{category}</span>
        <h3 className="product-name">{name}</h3>
        <div className="product-price">
          <span className="regular-price">Rs. {price}</span>
        </div>
        <button
          className={`add-to-cart-btn ${isAddingToCart ? 'loading' : ''}`}
          onClick={handleAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;