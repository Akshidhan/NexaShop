import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, createCart, addToCart } from '../../../../store/slices/cartSlice';
import api from '../../../../utils/axios';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import FloatingCart from '../../components/floatingCart/FloatingCart';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import './ProductView.css';

function ProductView() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, isAuthenticated } = useSelector((state) => state.user);
  
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    reviewText: '',
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [allProductImages, setAllProductImages] = useState([]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/products/${productId}`);
        
        let productData = response.data;
        
        setProduct(productData);
        
        const images = [
          productData.mainImage?.url,
          ...(productData.additionalImages?.map(img => img.url) || [])
        ].filter(Boolean);
        setAllProductImages(images);
        
        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
          
          const initialAttributes = {};
          if (productData.variants[0].attributes) {
            Object.keys(productData.variants[0].attributes).forEach(key => {
              initialAttributes[key] = productData.variants[0].attributes[key];
            });
          }
          setSelectedAttributes(initialAttributes);
        }
        
        if (productData.category) {
          try {
            const categoryId = productData.category._id
            const relatedResponse = await api.get(`/products/category/${categoryId}`);
            const filteredRelated = (relatedResponse.data.data || [])
              .filter(relatedProduct => relatedProduct._id !== productId)
              .slice(0, 4);
            setRelatedProducts(filteredRelated);
          } catch (error) {
            console.error('Error fetching related products:', error);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError('Failed to load product details. Please try again later.');
        setIsLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await api.get(`/review/product/${productId}`);
        setReviews(response.data);
      } catch (error) {
        console.error('Error fetching product reviews:', error);
      }
    };

    if (productId) {
      fetchProductDetails();
      fetchReviews();
    }
  }, [productId]);

  const handleAttributeChange = (attributeName, attributeValue) => {
    const newSelectedAttributes = {
      ...selectedAttributes,
      [attributeName]: attributeValue
    };
    setSelectedAttributes(newSelectedAttributes);
    
    if (product && product.variants) {
      const matchingVariant = product.variants.find(variant => {
        if (!variant.attributes) return false;
        
        return Object.keys(newSelectedAttributes).every(key => 
          variant.attributes[key] === newSelectedAttributes[key]
        );
      });
      
      if (matchingVariant) {
        setSelectedVariant(matchingVariant);
      }
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/signin?redirect=back');
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

      const variantToAdd = selectedVariant || {};
      const priceToUse = selectedVariant?.price || product.basePrice;
      
      await dispatch(addToCart({
        userId: currentUser,
        product: {
          _id: product._id,
          basePrice: priceToUse,
          imageUrl: product.mainImage?.url
        },
        quantity: quantity,
        variant: variantToAdd.sku ? {
          sku: variantToAdd.sku,
          attributes: variantToAdd.attributes || {}
        } : undefined
      }));

    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle review form changes
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm({
      ...reviewForm,
      [name]: name === 'rating' ? parseInt(value) : value
    });
  };

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/signin?redirect=back');
      return;
    }
    
    if (!reviewForm.reviewText.trim()) {
      setReviewError('Please enter a review');
      return;
    }
    
    setIsSubmittingReview(true);
    setReviewError(null);
    
    try {
      const reviewData = {
        user: currentUser,
        product: productId,
        rating: reviewForm.rating,
        reviewText: reviewForm.reviewText
      };
      
      const response = await api.post('/review', reviewData);
      
      // Add the new review to the reviews list
      setReviews([
        ...reviews,
        {
          ...response.data,
          user: { username: 'You' } // We don't have the full user object, so display "You" as the username
        }
      ]);
      
      // Reset the form
      setReviewForm({
        rating: 5,
        reviewText: ''
      });
      
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewError('Failed to submit review. Please try again later.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Function to render star ratings
  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-yellow-500" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-500" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-500" />);
    }
    
    return stars;
  };
  
  // Function to handle image navigation
  const handleImageChange = (index) => {
    setActiveImageIndex(index);
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="spinner"></div>
            <p className="mt-4 text-gray-600">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error || 'Product not found'}</span>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="product-view-container">
        <div className="product-view-content">
          <div className="product-view-grid">
            {/* Product Image Section */}
            <div className="product-image-section">
              <div className="main-image">
                <img 
                  src={allProductImages[activeImageIndex] || product.mainImage?.url} 
                  alt={product.name} 
                  className="rounded-lg shadow-md"
                />
              </div>
              {/* Thumbnail gallery for product images */}
              {allProductImages.length > 1 && (
                <div className="image-thumbnails">
                  {allProductImages.map((imageUrl, index) => (
                    <div 
                      key={index}
                      className={`image-thumbnail ${activeImageIndex === index ? 'active' : ''}`}
                      onClick={() => handleImageChange(index)}
                    >
                      <img 
                        src={imageUrl} 
                        alt={`${product.name} ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Section */}
            <div className="product-details-section">
              <nav className="breadcrumbs text-sm mb-4">
                <ul className="flex items-center space-x-1">
                  <li><a href="/" className="text-blue-500 hover:text-blue-700">Home</a></li>
                  <li><span className="mx-1">/</span></li>
                  {product.category && (
                    <>
                      <li>
                        <a href={`/category/${product.category._id}`} className="text-blue-500 hover:text-blue-700">
                          {product.category.name}
                        </a>
                      </li>
                      <li><span className="mx-1">/</span></li>
                    </>
                  )}
                  <li className="text-gray-600">{product.name}</li>
                </ul>
              </nav>

              <h1 className="product-title">{product.name}</h1>
              
              <div className="flex items-center mt-2 mb-4">
                <div className="flex items-center">
                  {renderRatingStars(product.ratingsAverage || 0)}
                  <span className="text-sm text-gray-500 ml-2">
                    ({product.ratingsAverage || 0}/5) - {reviews.length} reviews
                  </span>
                </div>
              </div>
              
              <div className="product-price">
                <span className="price-label">Price:</span>
                <span className="price-amount">
                  Rs. {selectedVariant?.price || product.basePrice}
                </span>
              </div>

              <div className="product-description">
                <h3 className="text-lg font-medium mb-2">Description:</h3>
                <p>{product.description}</p>
              </div>

              {/* Variant Selection */}
              {product.variants && product.variants.length > 0 && (
                <div className="product-variants mt-6">
                  {/* Group attributes by type */}
                  {Object.keys(product.variants[0].attributes || {}).map((attributeKey) => {
                    // Find unique values for this attribute
                    const uniqueValues = [...new Set(
                      product.variants
                        .map(variant => variant.attributes?.[attributeKey])
                        .filter(Boolean)
                    )];

                    return (
                      <div key={attributeKey} className="mb-4">
                        <h3 className="text-sm font-medium mb-2">{attributeKey.charAt(0).toUpperCase() + attributeKey.slice(1)}:</h3>
                        <div className="flex flex-wrap gap-2">
                          {uniqueValues.map((value) => (
                            <button
                              key={value}
                              className={`attribute-button ${selectedAttributes[attributeKey] === value ? 'selected' : ''}`}
                              onClick={() => handleAttributeChange(attributeKey, value)}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="quantity-selector mt-6">
                <label htmlFor="quantity" className="block text-sm font-medium mb-2">Quantity:</label>
                <div className="flex items-center">
                  <button 
                    className="quantity-btn" 
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    id="quantity" 
                    name="quantity"
                    min="1" 
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="quantity-input"
                  />
                  <button 
                    className="quantity-btn"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button 
                className={`add-to-cart-btn ${isAddingToCart ? 'loading' : ''}`} 
                onClick={handleAddToCart}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              
              {/* Product Details */}
              <div className="product-details mt-8">
                <h3 className="text-lg font-medium mb-2">Details:</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Category: {product.category?.name}</li>
                  <li>Seller: {product.seller?.sellerName}</li>
                  <li>Availability: {selectedVariant?.stock > 0 ? 'In Stock' : 'Out of Stock'}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="reviews-section mt-12">
            <h2 className="section-title">Customer Reviews</h2>
            
            {/* Write a Review Form */}
            {isAuthenticated ? (
              <div className="write-review-container mb-8">
                <h3 className="write-review-title">Write a Review</h3>
                {reviewSuccess && (
                  <div className="success-message">
                    Your review has been submitted successfully!
                  </div>
                )}
                {reviewError && (
                  <div className="error-message">
                    {reviewError}
                  </div>
                )}
                <form onSubmit={handleSubmitReview} className="review-form">
                  <div className="form-group mb-4">
                    <label htmlFor="rating" className="block text-sm font-medium mb-2">Rating:</label>
                    <div className="rating-input">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <label key={star} className="rating-label">
                          <input 
                            type="radio" 
                            name="rating"
                            value={star}
                            checked={reviewForm.rating === star}
                            onChange={handleReviewChange}
                            className="sr-only"
                          />
                          <FaStar 
                            className={`rating-star ${reviewForm.rating >= star ? 'active' : ''}`}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group mb-4">
                    <label htmlFor="reviewText" className="block text-sm font-medium mb-2">Review:</label>
                    <textarea
                      id="reviewText"
                      name="reviewText"
                      value={reviewForm.reviewText}
                      onChange={handleReviewChange}
                      placeholder="Share your thoughts about this product..."
                      className="review-textarea"
                      rows="4"
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    className="submit-review-btn"
                    disabled={isSubmittingReview}
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="login-to-review">
                <p>Please <a href={`/signin?redirect=product/${productId}`} className="text-blue-500 hover:underline">sign in</a> to write a review.</p>
              </div>
            )}
            
            {reviews.length === 0 ? (
              <p className="text-gray-600 italic">No reviews yet. Be the first to review this product!</p>
            ) : (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review._id} className="review-card">
                    <div className="review-header">
                      <div className="flex items-center">
                        <span className="font-medium">{review.user.username}</span>
                        <span className="mx-2">•</span>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex mt-1">
                        {renderRatingStars(review.rating)}
                      </div>
                    </div>
                    <div className="review-content">
                      <p>{review.reviewText}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="related-products mt-12">
              <h2 className="section-title">Related Products</h2>
              <div className="related-products-grid">
                {relatedProducts.map((relatedProduct) => (
                  <a 
                    key={relatedProduct._id} 
                    href={`/product/${relatedProduct._id}`}
                    className="related-product-card"
                  >
                    <div className="related-product-image">
                      <img 
                        src={relatedProduct.mainImage?.url} 
                        alt={relatedProduct.name} 
                      />
                    </div>
                    <div className="related-product-info">
                      <h3 className="related-product-name">{relatedProduct.name}</h3>
                      <p className="related-product-price">Rs. {relatedProduct.basePrice}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <FloatingCart />
      <Footer />
    </>
  );
}

export default ProductView;