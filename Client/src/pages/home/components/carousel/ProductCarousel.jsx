import { useState, useEffect } from 'react'
import ProductCard from '../productCard/ProductCard'
import './carousel.css'

function ProductCarousel({ products, title = "Featured Products" }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const productsPerView = 4
  
  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex + productsPerView >= products.length ? 0 : prevIndex + 1
    )
    setTimeout(() => setIsAnimating(false), 500); // Match transition duration
  }
  
  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? Math.max(0, products.length - productsPerView) : prevIndex - 1
    )
    setTimeout(() => setIsAnimating(false), 500); // Match transition duration
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate how many slides we need
  const totalSlides = Math.ceil(products.length / productsPerView);
  const activeSlide = Math.floor(currentIndex / productsPerView);

  return (
    <div className="product-carousel py-16 px-8">
      <div className="container mx-auto">
        <h2 className="carousel-title">{title}</h2>
        
        <div className="carousel-container relative">
            
          <button 
            onClick={prevSlide} 
            className="carousel-nav-btn absolute left-0 top-1/2 transform -translate-y-1/2 z-10"
            aria-label="Previous products"
            disabled={isAnimating}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          
          <div className="carousel-viewport overflow-hidden">
            <div 
              className="carousel-content flex gap-6 transition-transform duration-500 ease-in-out" 
              style={{ transform: `translateX(-${currentIndex * (100 / productsPerView)}%)` }}
            >
              {products.map((product, index) => (
                <div 
                  key={product.id} 
                  className="carousel-item flex-shrink-0" 
                  style={{ width: `calc(100% / ${productsPerView})` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
          
          
          <button 
            onClick={nextSlide} 
            className="carousel-nav-btn absolute right-0 top-1/2 transform -translate-y-1/2 z-10"
            aria-label="Next products"
            disabled={isAnimating}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        
        <div className="carousel-indicators">
          {Array.from({ length: totalSlides }, (_, i) => (
            <button 
              key={i} 
              className={`indicator ${i === activeSlide ? 'active' : ''}`}
              onClick={() => {
                if (!isAnimating) {
                  setIsAnimating(true);
                  setCurrentIndex(i * productsPerView);
                  setTimeout(() => setIsAnimating(false), 500);
                }
              }}
              aria-label={`Go to slide ${i + 1}`}
              disabled={isAnimating}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductCarousel