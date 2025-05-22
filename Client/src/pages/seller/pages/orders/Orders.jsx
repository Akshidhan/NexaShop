import './orders.scss';
import api from '../../../../utils/axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

function Orders() {
  useEffect(() => {
    document.title = 'Order Management | Nexashop';
    
    return () => {
      document.title = 'Nexashop';
    };
  }, []);

  // State for order management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for pending payment orders
  const [pendingPaymentOrders, setPendingPaymentOrders] = useState([]);
  const [pendingPaymentCurrentPage, setPendingPaymentCurrentPage] = useState(1);
  const [pendingPaymentTotalPages, setPendingPaymentTotalPages] = useState(1);
  const [pendingPaymentTotalOrders, setPendingPaymentTotalOrders] = useState(0);
  
  // State for pending orders (processing & shipped)
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pendingOrdersCurrentPage, setPendingOrdersCurrentPage] = useState(1);
  const [pendingOrdersTotalPages, setPendingOrdersTotalPages] = useState(1);
  const [pendingOrdersTotalOrders, setPendingOrdersTotalOrders] = useState(0);
  
  // State for finished orders (delivered & cancelled)
  const [finishedOrders, setFinishedOrders] = useState([]);
  const [finishedOrdersCurrentPage, setFinishedOrdersCurrentPage] = useState(1);
  const [finishedOrdersTotalPages, setFinishedOrdersTotalPages] = useState(1);
  const [finishedOrdersTotalOrders, setFinishedOrdersTotalOrders] = useState(0);

  // State for popup and action confirmation
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionType, setActionType] = useState(null);

  const sellerId = useSelector(state => state.user.currentUser);
  
  const limit = 10; // orders per page

  useEffect(() => {
    fetchOrders();
  }, [pendingPaymentCurrentPage, pendingOrdersCurrentPage, finishedOrdersCurrentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No authentication token');
      setLoading(false);
      return;
    }
    
    try {
      // Fetch pending payment orders
      const pendingPaymentResponse = await api.get(
        `${baseUrl}/orders/seller/${sellerId}?status=pending&page=${pendingPaymentCurrentPage}&limit=${limit}`
      );
      setPendingPaymentOrders(pendingPaymentResponse.data.orders || []);
      setPendingPaymentTotalPages(pendingPaymentResponse.data.totalPages || 1);
      setPendingPaymentTotalOrders(pendingPaymentResponse.data.totalOrders || 0);
      
      // Fetch pending orders (processing & shipped)
      const pendingOrdersResponse = await api.get(
        `${baseUrl}/orders/seller/${sellerId}?status=processing,shipped&page=${pendingOrdersCurrentPage}&limit=${limit}`
      );
      setPendingOrders(pendingOrdersResponse.data.orders || []);
      setPendingOrdersTotalPages(pendingOrdersResponse.data.totalPages || 1);
      setPendingOrdersTotalOrders(pendingOrdersResponse.data.totalOrders || 0);
      
      // Fetch finished orders (delivered & cancelled)
      const finishedOrdersResponse = await api.get(
        `${baseUrl}/orders/seller/${sellerId}?status=delivered,cancelled&page=${finishedOrdersCurrentPage}&limit=${limit}`
      );
      setFinishedOrders(finishedOrdersResponse.data.orders || []);
      setFinishedOrdersTotalPages(finishedOrdersResponse.data.totalPages || 1);
      setFinishedOrdersTotalOrders(finishedOrdersResponse.data.totalOrders || 0);
      
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (order, newStatus) => {
    setSelectedOrder({ ...order, newStatus });
    setActionType('updateStatus');
    setShowPopup(true);
  };

  const confirmAction = async () => {
    if (!selectedOrder) return;
    
    try {
      setLoading(true);
      
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token');
        setLoading(false);
        return;
      }
      
      if (actionType === 'updateStatus') {
        await api.patch(`${baseUrl}/orders/${selectedOrder._id}/status`, {
          status: selectedOrder.newStatus
        });
      }
      
      // Refresh order lists
      fetchOrders();
      setShowPopup(false);
      setSelectedOrder(null);
      setActionType(null);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update order status");
      setLoading(false);
    }
  };

  const handlePageChange = (section, page) => {
    if (section === 'pendingPayment') {
      setPendingPaymentCurrentPage(page);
    } else if (section === 'pendingOrders') {
      setPendingOrdersCurrentPage(page);
    } else {
      setFinishedOrdersCurrentPage(page);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = (currentPage, totalPages) => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 2) {
        endPage = 4;
      }
      
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }
      
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

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
  };

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
    );
  };

  // Get appropriate status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Confirmation Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Action</h2>
            <p className="mb-6">
              Are you sure you want to update this order's status to 
              <span className="font-semibold"> {selectedOrder?.newStatus}</span>?
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
                className="px-4 py-2 text-white rounded bg-blue-500 hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className='text-5xl my-5 pb-3 font-bold'>Order Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {/* Pending Payment Orders Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-semibold mb-4 text-yellow-600">Pending Payment</h2>
        
        <table className="border-collapse border border-gray-400 w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Order ID</th>
              <th className="border border-gray-300 px-4 py-2">Customer</th>
              <th className="border border-gray-300 px-4 py-2">Total Amount</th>
              <th className="border border-gray-300 px-4 py-2">Date Ordered</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && pendingPaymentOrders.length === 0 ? (
              <tr>
                <td colSpan="5" className="border border-gray-300 text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : pendingPaymentOrders.length === 0 ? (
              <tr>
                <td colSpan="5" className="border border-gray-300 text-center py-4">
                  No pending payment orders found
                </td>
              </tr>
            ) : (
              pendingPaymentOrders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{order.orderNumber || order._id}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.user?.firstName} {order.user?.lastName}</td>
                  <td className="border border-gray-300 px-4 py-2">Rs. {order.totalAmount}</td>
                  <td className="border border-gray-300 px-4 py-2">{formatDate(order.createdAt)}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {!loading && pendingPaymentOrders.length > 0 && 
          renderPagination('pendingPayment', pendingPaymentCurrentPage, pendingPaymentTotalPages, pendingPaymentTotalOrders)
        }
      </div>
      
      {/* Pending Orders Section (Processing & Shipped) */}
      <div className="mb-12">
        <h2 className="text-3xl font-semibold mb-4 text-blue-600">Pending Orders</h2>
        
        <table className="border-collapse border border-gray-400 w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Order ID</th>
              <th className="border border-gray-300 px-4 py-2">Customer</th>
              <th className="border border-gray-300 px-4 py-2">Total Amount</th>
              <th className="border border-gray-300 px-4 py-2">Date Ordered</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && pendingOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="border border-gray-300 text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : pendingOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="border border-gray-300 text-center py-4">
                  No pending orders found
                </td>
              </tr>
            ) : (
              pendingOrders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{order.orderNumber || order._id}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.user?.firstName} {order.user?.lastName}</td>
                  <td className="border border-gray-300 px-4 py-2">Rs. {order.totalAmount}</td>
                  <td className="border border-gray-300 px-4 py-2">{formatDate(order.createdAt)}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex space-x-2">
                      {order.status === 'processing' && (
                        <button 
                          onClick={() => handleUpdateStatus(order, 'shipped')}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Mark Shipped
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button 
                          onClick={() => handleUpdateStatus(order, 'delivered')}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Mark Delivered
                        </button>
                      )}
                      <button 
                        onClick={() => handleUpdateStatus(order, 'cancelled')}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {!loading && pendingOrders.length > 0 && 
          renderPagination('pendingOrders', pendingOrdersCurrentPage, pendingOrdersTotalPages, pendingOrdersTotalOrders)
        }
      </div>
      
      {/* Finished Orders Section (Delivered & Cancelled) */}
      <div>
        <h2 className="text-3xl font-semibold mb-4 text-green-600">Finished Orders</h2>
        
        <table className="border-collapse border border-gray-400 w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Order ID</th>
              <th className="border border-gray-300 px-4 py-2">Customer</th>
              <th className="border border-gray-300 px-4 py-2">Total Amount</th>
              <th className="border border-gray-300 px-4 py-2">Date Ordered</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
              <th className="border border-gray-300 px-4 py-2">Completed Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && finishedOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="border border-gray-300 text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : finishedOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="border border-gray-300 text-center py-4">
                  No finished orders found
                </td>
              </tr>
            ) : (
              finishedOrders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{order.orderNumber || order._id}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.user?.firstName} {order.user?.lastName}</td>
                  <td className="border border-gray-300 px-4 py-2">Rs. {order.totalAmount}</td>
                  <td className="border border-gray-300 px-4 py-2">{formatDate(order.createdAt)}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{formatDate(order.updatedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {!loading && finishedOrders.length > 0 && 
          renderPagination('finishedOrders', finishedOrdersCurrentPage, finishedOrdersTotalPages, finishedOrdersTotalOrders)
        }
      </div>
    </>
  );
}

export default Orders;