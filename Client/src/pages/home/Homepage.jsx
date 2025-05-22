import Navbar from './components/navbar/Navbar'
import ProductCarousel from './components/carousel/ProductCarousel'
import Footer from './components/footer/Footer'

import hero from '/image.png'
import { useRef } from 'react';

function Homepage() {
  // Mock product data for carousel
  const mockProducts = [
    {
      id: 1,
      name: 'Casual T-Shirt',
      price: 29.99,
      image: '/Nexashop.png',
      category: 'Clothing'
    },
    {
      id: 2,
      name: 'Denim Jeans',
      price: 59.99,
      image: '/Nexashop.png',
      category: 'Clothing'
    },
    {
      id: 3,
      name: 'Sports Shoes',
      price: 79.99,
      image: '/Nexashop.png',
      category: 'Footwear'
    },
    {
      id: 4,
      name: 'Watch Classic',
      price: 129.99,
      image: '/Nexashop.png',
      category: 'Accessories'
    },
    {
      id: 5,
      name: 'Leather Bag',
      price: 89.99,
      image: '/Nexashop.png',
      category: 'Accessories'
    },
    {
      id: 6,
      name: 'Sunglasses',
      price: 49.99,
      image: '/Nexashop.png',
      category: 'Accessories'
    },
  ]

    const categories = [
        {
            name: "Clothing",
            image: "/Nexashop.png"
        },
        {
            name: "Footwear",
            image: "/Nexashop.png"
        },
        {
            name: "Accessories",
            image: "/Nexashop.png"
        },
        {
            name: "Electronics",
            image: "/Nexashop.png"
        },
        {
            name: "Home Decor",
            image: "/Nexashop.png"
        }
        ,
        {
            name: "Home Decor",
            image: "/Nexashop.png"
        },
        {
            name: "Home Decor",
            image: "/Nexashop.png"
        }
    ]

const productSectionRef = useRef(null);

const scrollToProducts = () => {
    productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
};

return (
    <>
            <Navbar />
            <div className="hero">
                    <div className="hero-content flex-col lg:flex-row-reverse relative">
                            <img src={hero} className="w-full h-1/3 object-cover" />
                            <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center'>
                                    <p className='text-9xl text-bold text-[white] DMSerif'>What you wear</p>
                                    <p className='text-5xl mt-5 text-[white]'>Says a lot about you</p>

                                    <div>
                                            <button className='px-15 py-4 bg-[white] border-[2px] rounded-4xl text-2xl m-8 text-[black]' onClick={scrollToProducts}>Shop Now</button>
                                    </div>
                            </div>
                    </div>
            </div>

            <div>
                <div className="categories-section py-16 px-4">
                    <div className="container mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12 DMSerif">Shop by Category</h2>
                        
                        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${categories.length < 5 ? 'justify-center' : 'justify-items-center'}`}>
                            {categories.map(category => (
                                <div key={category.name} className="category-item flex flex-col items-center">
                                    <div className="category-image-container mb-3">
                                        <img 
                                            src={category.image}
                                            alt={category.name} 
                                            className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-gray-200 hover:border-black transition-all"
                                        />
                                    </div>
                                    <p className="text-lg font-medium text-center">{category.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add product carousel after the hero section */}
            <div ref={productSectionRef}>
                <ProductCarousel products={mockProducts} title="Featured Products" />
            </div>

            <Footer />
    </>
)
}

export default Homepage