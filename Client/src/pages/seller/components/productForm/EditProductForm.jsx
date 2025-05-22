import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../../../utils/axios';
import './productForm.scss';

const EditProductForm = ({ product, onProductUpdated, onCancel }) => {
  // State for edit product form
  const [editedProduct, setEditedProduct] = useState({
    id: product?.id || '',
    name: product?.name || '',
    basePrice: product?.basePrice || '',
    description: product?.description || '',
    category: product?.category || '',
    currentMainImage: product?.currentMainImage || '',
    variants: product?.variants || []
  });
  
  const [categories, setCategories] = useState([]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  
  const sellerId = useSelector(state => state.user.currentUser);
  
  useEffect(() => {
    // Initialize the form with the product data whenever the product changes
    if (product) {
      setEditedProduct({
        id: product.id || '',
        name: product.name || '',
        basePrice: product.basePrice || '',
        description: product.description || '',
        category: product.category || '',
        currentMainImage: product.currentMainImage || '',
        variants: product.variants || []
      });
    }
    
    fetchCategories();
  }, [product]);
  
  const fetchCategories = async () => {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await api.get(`${baseUrl}/category`);
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct(prev => ({ ...prev, [name]: value }));
  };
  
  const submitEditForm = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);
    
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const token = localStorage.getItem('token');
      
      if (!token) {
        setFormError('No authentication token');
        setFormSubmitting(false);
        return;
      }
      
      // Create form data for file uploads
      const formData = new FormData();
      formData.append('name', editedProduct.name);
      formData.append('basePrice', editedProduct.basePrice);
      formData.append('description', editedProduct.description);
      formData.append('category', editedProduct.category);
      formData.append('seller', sellerId);
      
      // Process variants if they exist
      if (editedProduct.variants && editedProduct.variants.length > 0) {
        // Process each variant's data
        const processedVariants = editedProduct.variants.map(variant => {
          // Create a clean variant object matching the data model
          const cleanVariant = {
            id: variant.id, // Include the variant ID for updates
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
            attributes: variant.attributes
          };
          
          // Return the cleaned variant
          return cleanVariant;
        });
        
        // Convert variants array to JSON string and append to formData
        formData.append('variants', JSON.stringify(processedVariants));
        
        // Process variant images separately
        editedProduct.variants.forEach((variant, variantIndex) => {
          if (variant.imageFiles && variant.imageFiles.length > 0) {
            variant.imageFiles.forEach((file, fileIndex) => {
              formData.append(`variantImages_${variantIndex}_${fileIndex}`, file);
            });
          }
        });
      }
      
      // Make PUT request to update the product
      await api.put(`${baseUrl}/products/${editedProduct.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Notify the parent component that a product was updated successfully
      if (onProductUpdated) {
        onProductUpdated();
      }
      
    } catch (error) {
      console.error("Error updating product:", error);
      setFormError(error.response?.data?.message || "Failed to update product");
    } finally {
      setFormSubmitting(false);
    }
  };
  
  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md product-form">
      <h2 className="text-2xl font-semibold mb-4 text-blue-600">Edit Product</h2>
      
      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {formError}
        </div>
      )}
      
      <form onSubmit={submitEditForm} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={editedProduct.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product name"
            />
          </div>
          
          <div>
            <label htmlFor="basePrice" className="block text-gray-700 font-medium mb-2">Price (Rs) *</label>
            <input
              type="number"
              id="basePrice"
              name="basePrice"
              value={editedProduct.basePrice}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter price"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="category" className="block text-gray-700 font-medium mb-2">Category *</label>
          <select
            id="category"
            name="category"
            value={editedProduct.category}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">Description *</label>
          <textarea
            id="description"
            name="description"
            value={editedProduct.description}
            onChange={handleInputChange}
            required
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter product description"
          ></textarea>
        </div>
        
        {editedProduct.currentMainImage && (
          <div className="mt-2">
            <p className="text-sm text-gray-700 font-medium mb-2">Current Product Image:</p>
            <img src={editedProduct.currentMainImage} alt="Product" className="h-40 object-contain rounded border border-gray-300" />
          </div>
        )}
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Product Variants</label>
          
          {/* Variants List */}
          {editedProduct.variants && editedProduct.variants.map((variant, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-300 rounded-lg bg-white">
              <div className="flex justify-between mb-2">
                <h4 className="font-medium">Variant #{index + 1}</h4>
                <button 
                  type="button"
                  onClick={() => {
                    const updatedVariants = [...editedProduct.variants];
                    updatedVariants.splice(index, 1);
                    setEditedProduct(prev => ({ ...prev, variants: updatedVariants }));
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    value={variant.sku || ''}
                    onChange={e => {
                      const updatedVariants = [...editedProduct.variants];
                      updatedVariants[index].sku = e.target.value;
                      setEditedProduct(prev => ({ ...prev, variants: updatedVariants }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="SKU identifier"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.price || ''}
                    onChange={e => {
                      const updatedVariants = [...editedProduct.variants];
                      updatedVariants[index].price = e.target.value;
                      setEditedProduct(prev => ({ ...prev, variants: updatedVariants }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Variant specific price (optional)"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Custom Attributes</label>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedVariants = [...editedProduct.variants];
                      // Initialize attributes object if it doesn't exist
                      updatedVariants[index].attributes = updatedVariants[index].attributes || {};
                      updatedVariants[index].attributeList = updatedVariants[index].attributeList || [];
                      
                      // Add a new empty attribute
                      updatedVariants[index].attributeList.push({ name: '', value: '' });
                      setEditedProduct(prev => ({ ...prev, variants: updatedVariants }));
                    }}
                    className="flex items-center text-blue-500 text-sm hover:text-blue-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Add Attribute
                  </button>
                </div>
                
                {/* List of custom attributes */}
                {variant.attributeList && variant.attributeList.map((attr, attrIndex) => (
                  <div key={attrIndex} className="flex gap-2 items-center mb-2">
                    <input
                      type="text"
                      value={attr.name}
                      onChange={e => {
                        const updatedVariants = [...editedProduct.variants];
                        updatedVariants[index].attributeList[attrIndex].name = e.target.value;
                        
                        // Also update the attributes object
                        if (e.target.value) {
                          updatedVariants[index].attributes[e.target.value] = attr.value;
                          // Remove old key if name changed
                          if (attr.name && attr.name !== e.target.value) {
                            delete updatedVariants[index].attributes[attr.name];
                          }
                        }
                        
                        setEditedProduct(prev => ({ ...prev, variants: updatedVariants }));
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Attribute name (e.g., Color, Size)"
                    />
                    <input
                      type="text"
                      value={attr.value}
                      onChange={e => {
                        const updatedVariants = [...editedProduct.variants];
                        updatedVariants[index].attributeList[attrIndex].value = e.target.value;
                        
                        // Also update the attributes object if we have an attribute name
                        if (attr.name) {
                          updatedVariants[index].attributes[attr.name] = e.target.value;
                        }
                        
                        setEditedProduct(prev => ({ ...prev, variants: updatedVariants }));
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Attribute value"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updatedVariants = [...editedProduct.variants];
                        
                        // Remove from attribute list
                        updatedVariants[index].attributeList.splice(attrIndex, 1);
                        
                        // Remove from attributes object
                        if (attr.name) {
                          delete updatedVariants[index].attributes[attr.name];
                        }
                        
                        setEditedProduct(prev => ({ ...prev, variants: updatedVariants }));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                {(!variant.attributeList || variant.attributeList.length === 0) && (
                  <div className="text-gray-500 text-sm italic">No attributes added yet</div>
                )}
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                <input
                  type="number"
                  min="0"
                  value={variant.stock || ''}
                  onChange={e => {
                    const updatedVariants = [...editedProduct.variants];
                    updatedVariants[index].stock = e.target.value;
                    setEditedProduct(prev => ({ ...prev, variants: updatedVariants }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Available stock"
                  required
                />
              </div>
            </div>
          ))}
          
          {/* Add Variant Button */}
          <button
            type="button"
            onClick={() => {
              const newVariant = {
                sku: '',
                attributes: {},
                attributeList: [],
                price: '',
                stock: '',
                imageFiles: [],
                imagePreviews: []
              };
              
              setEditedProduct(prev => ({
                ...prev,
                variants: [...(prev.variants || []), newVariant]
              }));
            }}
            className="mt-2 flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Add Product Variant
          </button>
        </div>
        
        <div className="flex justify-end gap-2">
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={formSubmitting}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {formSubmitting ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductForm;