import { useState, useEffect } from 'react'
import api from '../../../../utils/axios';
import './categories.scss'
import { HiPlus, HiXMark, HiPencil, HiTrash, HiXCircle } from "react-icons/hi2";

function Categories() {
  useEffect(() => {
    document.title = 'Category Management | Nexashop';
    
    return () => {
      document.title = 'Nexashop';
    };
  }, []);

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  
  // Form states
  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')
  const [categoryImage, setCategoryImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get('/category')
      setCategories(response.data || [])
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError(err.response?.data?.message || "Failed to fetch categories")
    } finally {
      setLoading(false)
    }
  }

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCategoryImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Open add category modal
  const openAddModal = () => {
    setCategoryName('')
    setCategoryDescription('')
    setCategoryImage(null)
    setImagePreview('')
    setShowAddModal(true)
  }

  // Open edit category modal
  const openEditModal = (category) => {
    setSelectedCategory(category)
    setCategoryName(category.name)
    setCategoryDescription(category.description)
    setImagePreview(category.image?.url || '')
    setShowEditModal(true)
  }

  // Open delete confirmation modal
  const openDeleteModal = (category) => {
    setSelectedCategory(category)
    setShowDeleteModal(true)
  }

  // Add new category
  const handleAddCategory = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('name', categoryName)
      formData.append('description', categoryDescription)
      if (categoryImage) {
        formData.append('image', categoryImage)
      }
      
      await api.post('/categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setShowAddModal(false)
      fetchCategories()
    } catch (err) {
      console.error("Error adding category:", err)
      setError(err.response?.data?.message || "Failed to add category")
      setLoading(false)
    }
  }

  // Update existing category
  const handleUpdateCategory = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('name', categoryName)
      formData.append('description', categoryDescription)
      if (categoryImage) {
        formData.append('image', categoryImage)
      }
      
      await api.put(`/categories/${selectedCategory._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setShowEditModal(false)
      fetchCategories()
    } catch (err) {
      console.error("Error updating category:", err)
      setError(err.response?.data?.message || "Failed to update category")
      setLoading(false)
    }
  }

  // Delete category
  const handleDeleteCategory = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await api.delete(`/category/${selectedCategory._id}`)
      setShowDeleteModal(false)
      fetchCategories()
    } catch (err) {
      console.error("Error deleting category:", err)
      setError(err.response?.data?.message || "Failed to delete category")
      setLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  return (
    <>
      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Category</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <HiXMark className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddCategory}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryName">
                  Category Name*
                </label>
                <input 
                  type="text" 
                  id="categoryName" 
                  value={categoryName} 
                  onChange={(e) => setCategoryName(e.target.value)} 
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryDescription">
                  Description
                </label>
                <textarea 
                  id="categoryDescription" 
                  value={categoryDescription} 
                  onChange={(e) => setCategoryDescription(e.target.value)} 
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryImage">
                  Category Image
                </label>
                <input 
                  type="file" 
                  id="categoryImage" 
                  onChange={handleImageChange} 
                  className="w-full py-2 px-3 border border-gray-300 rounded"
                  accept="image/*"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Category'}
                  {loading && <span className="ml-2 animate-spin">⟳</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Category</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <HiXMark className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateCategory}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="editCategoryName">
                  Category Name*
                </label>
                <input 
                  type="text" 
                  id="editCategoryName" 
                  value={categoryName} 
                  onChange={(e) => setCategoryName(e.target.value)} 
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="editCategoryDescription">
                  Description
                </label>
                <textarea 
                  id="editCategoryDescription" 
                  value={categoryDescription} 
                  onChange={(e) => setCategoryDescription(e.target.value)} 
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="editCategoryImage">
                  Category Image
                </label>
                <input 
                  type="file" 
                  id="editCategoryImage" 
                  onChange={handleImageChange} 
                  className="w-full py-2 px-3 border border-gray-300 rounded"
                  accept="image/*"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Category'}
                  {loading && <span className="ml-2 animate-spin">⟳</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Delete Category</h2>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <HiXCircle className="w-6 h-6" />
              </button>
            </div>
            
            <p className="mb-6">
              Are you sure you want to delete the category: <span className="font-semibold">{selectedCategory.name}</span>?
              <br/>
              This action cannot be undone and may affect products associated with this category.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteCategory}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Category'}
                {loading && <span className="ml-2 animate-spin">⟳</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className='text-5xl my-5 pb-3 font-bold'>Category Management</h1>
      
      {/* Action Button */}
      <div className="mb-6">
        <button 
          onClick={openAddModal}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <HiPlus className="mr-2" /> Add New Category
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {/* Categories List */}
      <div>
        <table className="border-collapse border border-gray-400 w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Category Image</th>
              <th className="border border-gray-300 px-4 py-2">Category Name</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="border border-gray-300 text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="border border-gray-300 text-center py-4">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map(category => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 w-24">
                    {category.image?.url ? (
                      <img src={category.image.url} alt={category.name} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                        No image
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{category.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{category.description || 'No description'}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openEditModal(category)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm flex items-center"
                      >
                        <HiPencil className="mr-1" /> Edit
                      </button>
                      <button 
                        onClick={() => openDeleteModal(category)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center"
                      >
                        <HiTrash className="mr-1" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default Categories