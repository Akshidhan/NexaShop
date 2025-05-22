import './products.scss'
import { useState, useEffect } from 'react'
import api from '../../../../utils/axios';

const Products = () => {
  useEffect(() => {
    document.title = 'Product Management | Nexashop';
    
    return () => {
      document.title = 'Nexashop';
    };
  }, []);

  const [approvedProducts, setApprovedProducts] = useState([])
  const [unapprovedProducts, setUnapprovedProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [actionType, setActionType] = useState(null)
  
  // Pagination for approved products
  const [approvedCurrentPage, setApprovedCurrentPage] = useState(1)
  const [approvedTotalPages, setApprovedTotalPages] = useState(1)
  const [approvedTotalProducts, setApprovedTotalProducts] = useState(0)
  
  // Pagination for unapproved products
  const [unapprovedCurrentPage, setUnapprovedCurrentPage] = useState(1)
  const [unapprovedTotalPages, setUnapprovedTotalPages] = useState(1)
  const [unapprovedTotalProducts, setUnapprovedTotalProducts] = useState(0)
  
  const limit = 10 // products per page

  useEffect(() => {
    fetchProducts()
  }, [approvedCurrentPage, unapprovedCurrentPage])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    
    const baseUrl = import.meta.env.VITE_BASE_URL
    const token = localStorage.getItem('token')
    
    if (!token) {
      setError('No authentication token')
      setLoading(false)
      return
    }
    
    // Fetch unapproved (inactive) products in its own try-catch block
    try {
      const unapprovedResponse = await api.get(`${baseUrl}/products/inactive?page=${unapprovedCurrentPage}&limit=${limit}`)
      setUnapprovedProducts(unapprovedResponse.data.products || [])
      setUnapprovedTotalPages(unapprovedResponse.data.totalPages || 1)
      setUnapprovedTotalProducts(unapprovedResponse.data.totalProducts || 0)
    } catch (unapprovedError) {
      console.error("Error fetching unapproved products:", unapprovedError)
      setError(unapprovedError.response?.data?.message || "Failed to fetch unapproved products")
      setLoading(false)
    }
    
    // Fetch approved (active) products in its own try-catch block
    try {
      const approvedResponse = await api.get(`${baseUrl}/products?page=${approvedCurrentPage}&limit=${limit}`)
      setApprovedProducts(approvedResponse.data.products || [])
      setApprovedTotalPages(approvedResponse.data.pagination.totalPages || 1)
      setApprovedTotalProducts(approvedResponse.data.pagination.totalProducts || 0)
    } catch (approvedError) {
      console.error("Error fetching approved products:", approvedError)
      setError(approvedError.response?.data?.message || "Failed to fetch approved products")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = (product) => {
    setSelectedProduct(product)
    setActionType('approve')
    setShowPopup(true)
  }

  const handleDisapprove = (product) => {
    setSelectedProduct(product)
    setActionType('disapprove')
    setShowPopup(true)
  }

  const confirmAction = async () => {
    if (!selectedProduct) return
    console.log(selectedProduct)
    
    try {
      setLoading(true)
      
      const baseUrl = import.meta.env.VITE_BASE_URL
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('No authentication token')
        setLoading(false)
        return
      }
      
      if (actionType === 'approve') {
        await api.put(`${baseUrl}/products/${selectedProduct._id}`, {
          status: 'active'
        })
      } else if (actionType === 'disapprove') {
        await api.put(`${baseUrl}/products/${selectedProduct._id}`, {
          status: 'inactive'
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      }
      
      // Refresh product lists
      fetchProducts()
      setShowPopup(false)
      setSelectedProduct(null)
      setActionType(null)
    } catch (error) {
      setError(error.response?.data?.message || `Failed to ${actionType} product`)
      setLoading(false)
    }
  }

  const handlePageChange = (section, page) => {
    if (section === 'approved') {
      setApprovedCurrentPage(page)
    } else {
      setUnapprovedCurrentPage(page)
    }
  }

  // Generate page numbers for pagination
  const getPageNumbers = (currentPage, totalPages) => {
    const pageNumbers = []
    const maxPagesToShow = 5
    
    if (totalPages <= maxPagesToShow) {
        
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
        
      pageNumbers.push(1)
      
      
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)
      
      
      if (currentPage <= 2) {
        endPage = 4
      }
      
      
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3
      }
      
      
      if (startPage > 2) {
        pageNumbers.push('...')
      }
      
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }
      
      
      if (endPage < totalPages - 1) {
        pageNumbers.push('...')
      }
      
      
      pageNumbers.push(totalPages)
    }
    
    return pageNumbers
  }

  
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

  // Function to render pagination controls
  const renderPagination = (section, currentPage, totalPages, totalItems) => {
    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
        <div className="flex flex-1 justify-between sm:hidden">
          <button 
            onClick={() => handlePageChange(section, currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Previous
          </button>
          <button 
            onClick={() => handlePageChange(section, currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing
              <span className="font-medium"> {(currentPage - 1) * limit + 1} </span>
              to
              <span className="font-medium"> {Math.min(currentPage * limit, totalItems)} </span>
              of
              <span className="font-medium"> {totalItems} </span>
              results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button 
                onClick={() => handlePageChange(section, currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'cursor-not-allowed' : ''}`}
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                </svg>
              </button>
              
              {getPageNumbers(currentPage, totalPages).map((pageNumber, index) => (
                pageNumber === '...' ? (
                  <span 
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(section, pageNumber)}
                    aria-current={currentPage === pageNumber ? "page" : undefined}
                    className={`relative ${
                      currentPage === pageNumber 
                        ? "z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" 
                        : "inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              ))}
              
              <button 
                onClick={() => handlePageChange(section, currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === totalPages ? 'cursor-not-allowed' : ''}`}
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Confirmation Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Action</h2>
            <p className="mb-6">
              Are you sure you want to {actionType === 'approve' ? 'approve' : 'disapprove'} this product: 
              <span className="font-semibold"> {selectedProduct?.name}</span>?
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAction}
                className={`px-4 py-2 text-white rounded ${
                  actionType === 'approve' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className='text-5xl my-5 pb-3 font-bold'>Product Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {/* Unapproved Products Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-semibold mb-4 text-orange-600">Pending Approval</h2>
        
        <table className="border-collapse border border-gray-400 w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Product Name</th>
              <th className="border border-gray-300 px-4 py-2">Price</th>
              <th className="border border-gray-300 px-4 py-2">Seller</th>
              <th className="border border-gray-300 px-4 py-2">Category</th>
              <th className="border border-gray-300 px-4 py-2">Date Added</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && unapprovedProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="border border-gray-300 text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : unapprovedProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="border border-gray-300 text-center py-4">
                  No unapproved products found
                </td>
              </tr>
            ) : (
              unapprovedProducts.map(product => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{product.name}</td>
                  <td className="border border-gray-300 px-4 py-2">Rs. {product.basePrice}</td>
                  <td className="border border-gray-300 px-4 py-2">{product.seller?.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{product.category?.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{formatDate(product.createdAt)}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleApprove(product)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleDisapprove(product)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {!loading && unapprovedProducts.length > 0 && 
          renderPagination('unapproved', unapprovedCurrentPage, unapprovedTotalPages, unapprovedTotalProducts)
        }
      </div>
      
      {/* Approved Products Section */}
      <div>
        <h2 className="text-3xl font-semibold mb-4 text-green-600">Approved Products</h2>
        
        <table className="border-collapse border border-gray-400 w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Product Image</th>
              <th className="border border-gray-300 px-4 py-2">Product Name</th>
              <th className="border border-gray-300 px-4 py-2">Price</th>
              <th className="border border-gray-300 px-4 py-2">Seller</th>
              <th className="border border-gray-300 px-4 py-2">Category</th>
              <th className="border border-gray-300 px-4 py-2">Date Added</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && approvedProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="border border-gray-300 text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : approvedProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="border border-gray-300 text-center py-4">
                  No approved products found
                </td>
              </tr>
            ) : (
              approvedProducts.map(product => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 max-w-12"><img src={product.mainImage.url} alt="" /></td>
                  <td className="border border-gray-300 px-4 py-2">{product.name}</td>
                  <td className="border border-gray-300 px-4 py-2">Rs. {product.basePrice}</td>
                  <td className="border border-gray-300 px-4 py-2">{product.seller?.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{product.category?.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{formatDate(product.createdAt)}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button 
                      onClick={() => handleDisapprove(product)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Disapprove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {!loading && approvedProducts.length > 0 && 
          renderPagination('approved', approvedCurrentPage, approvedTotalPages, approvedTotalProducts)
        }
      </div>
    </>
  )
}

export default Products