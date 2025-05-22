import './users.scss'
import { useEffect, useState } from 'react'
import api from '../../../../utils/axios'

const Users = () => {
  useEffect(() => {
    document.title = 'User Management | Nexashop';
    
    // Optionally restore the original title when component unmounts
    return () => {
      document.title = 'Nexashop';
    };
  }, []);

  const [users, setUsers] = useState([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit, setLimit] = useState(25)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const baseUrl = import.meta.env.VITE_BASE_URL
        const token = localStorage.getItem('token')
        
        if (!token) {
          setError('No authentication token')
          setLoading(false)
          return
        }
        
        const response = await api.get(`${baseUrl}/users/?page=${currentPage}&limit=${limit}`)
        
        const { users, pagination } = response.data
        setUsers(users)
        setTotalUsers(pagination.totalUsers)
        setTotalPages(pagination.totalPages)
        setLoading(false)
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch users')
        setLoading(false)
      }
    }

    fetchUsers()
  }, [currentPage, limit])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5
    
    if (totalPages <= maxPagesToShow) {
      // If we have fewer pages than the max to show, display all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always add first page
      pageNumbers.push(1)
      
      // Calculate start and end of page numbers to show
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)
      
      // Adjust if we're at the start
      if (currentPage <= 2) {
        endPage = 4
      }
      
      // Adjust if we're at the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pageNumbers.push('...')
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('...')
      }
      
      // Always add last page
      pageNumbers.push(totalPages)
    }
    
    return pageNumbers
  }

  // Format date string
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
    <h1 className='text-5xl my-5 pb-3 font-bold'>User List</h1>
    
    {error && (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        Error: {error}
      </div>
    )}
    
    <table className="border-collapse border border-gray-400 w-full">
        <thead className="bg-gray-100">
            <tr>
                <th className="border border-gray-300 px-4 py-2">Username</th>
                <th className="border border-gray-300 px-4 py-2">Email</th>
                <th className="border border-gray-300 px-4 py-2">Created at</th>
            </tr>
        </thead>
        <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="border border-gray-300 text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="3" className="border border-gray-300 text-center py-4">
                  No users found
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user._id || user.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{user.username}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              ))
            )}
        </tbody>
    </table>
    
    {!loading && users.length > 0 && (
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
                <span className="font-medium"> {Math.min(currentPage * limit, totalUsers)} </span>
                of
                <span className="font-medium"> {totalUsers} </span>
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
                
                {getPageNumbers().map((pageNumber, index) => (
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
    )}
    </>
  )
}

export default Users