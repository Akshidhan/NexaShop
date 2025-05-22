import './reviews.scss'
import { useState, useEffect } from 'react'
import api from '../../../../utils/axios';
import { useSelector } from 'react-redux';

function Reviews() {
  useEffect(() => {
    document.title = 'Product Reviews | Nexashop';
    
    return () => {
      document.title = 'Nexashop';
    };
  }, []);

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const sellerId = useSelector((state) => state.user.currentUser)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalReviews, setTotalReviews] = useState(0)
  
  const limit = 10 // reviews per page

  useEffect(() => {
    fetchReviews()
  }, [currentPage])

  const fetchReviews = async () => {
    setLoading(true)
    setError(null)
    
    const baseUrl = import.meta.env.VITE_BASE_URL
    const token = localStorage.getItem('token')
    
    if (!token) {
      setError('No authentication token')
      setLoading(false)
      return
    }
    
    try {
      // Get only reviews for seller's products
      const response = await api.get(`${baseUrl}/reviews/seller/${sellerId}?page=${currentPage}&limit=${limit}`)
      setReviews(response.data.reviews || [])
      setTotalPages(response.data.totalPages || 1)
      setTotalReviews(response.data.totalReviews || 0)
    } catch (error) {
      console.error("Error fetching reviews:", error)
      setError(error.response?.data?.message || "Failed to fetch reviews")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
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

  // Function to render ratings as stars
  const renderRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<span key={i} className="text-yellow-500">★</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>);
      }
    }
    return stars;
  }

  // Function to render pagination controls
  const renderPagination = (currentPage, totalPages, totalItems) => {
    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
        <div className="flex flex-1 justify-between sm:hidden">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Previous
          </button>
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
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
                onClick={() => handlePageChange(currentPage - 1)}
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
                    onClick={() => handlePageChange(pageNumber)}
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
                onClick={() => handlePageChange(currentPage + 1)}
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
      <h1 className='text-5xl my-5 pb-3 font-bold'>Product Reviews</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {/* Reviews Section */}
      <div className="mb-12">
        <table className="border-collapse border border-gray-400 w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Product</th>
              <th className="border border-gray-300 px-4 py-2">User</th>
              <th className="border border-gray-300 px-4 py-2">Rating</th>
              <th className="border border-gray-300 px-4 py-2">Review</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
              <th className="border border-gray-300 px-4 py-2">Date Posted</th>
            </tr>
          </thead>
          <tbody>
            {loading && reviews.length === 0 ? (
              <tr>
                <td colSpan="6" className="border border-gray-300 text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan="6" className="border border-gray-300 text-center py-4">
                  No reviews found
                </td>
              </tr>
            ) : (
              reviews.map(review => (
                <tr key={review._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    {review.product?.name || 'Unknown Product'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {review.user?.username || 'Anonymous User'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex">{renderRating(review.rating)}</div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 max-w-md">
                    <div className="truncate max-w-xs">{review.reviewText}</div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${review.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {review.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{formatDate(review.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {!loading && reviews.length > 0 && 
          renderPagination(currentPage, totalPages, totalReviews)
        }
      </div>
    </>
  )
}

export default Reviews