import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { HiUser, HiLockClosed, HiShoppingBag, HiStar, HiPhotograph, HiEye, HiEyeOff, HiLocationMarker } from "react-icons/hi";
import { Link, useNavigate } from 'react-router-dom';
import './userpanel.scss'
import api from './../../../../utils/axios'
import AddressBook from './AddressBook'

function Userpanel() {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useSelector(state => state.user);
  const [userdata, setUserdata] = useState({});
  const dispatch = useDispatch();

  if (isAuthenticated === false) {
    navigate('/signin');
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get(`/users/${currentUser}`);
        const userData = response.data;
        setUserdata(userData);

        // Update form data with user data
        setFormData(prevState => ({
          ...prevState,
          username: userData.username || ''
        }));

        // Set profile image if available
        if (userData.userImage && userData.userImage.url) {
          setPreviewImage(userData.userImage.url);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({
    username: userdata?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(userdata?.userImage?.url || null);

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // No longer need address book state as it's managed by the AddressBook component

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const ordersResponse = await api.get(`/orders/user/${currentUser}`);
        setOrders(ordersResponse.data);

        const reviewsResponse = await api.get(`/reviews/user/${currentUser}`);
        setReviews(reviewsResponse.data);

        const addressesResponse = await api.get(`/addresses/user/${currentUser}`);
        setAddresses(addressesResponse.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setOrders([
          { id: '12345', date: '2025-04-15', status: 'Delivered', total: 149.99, items: 3 },
          { id: '12344', date: '2025-03-22', status: 'Processing', total: 89.95, items: 2 },
          { id: '12343', date: '2025-02-10', status: 'Delivered', total: 214.50, items: 4 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    console.log(orders)
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitUsername = async (e) => {
    e.preventDefault();
    if (!formData.username) {
      alert('Username is required');
      return;
    }

    try {
      await api.put(`/users/username/${currentUser}`, {
        username: formData.username
      });

      // Update the local user data
      setUserdata({
        ...userdata,
        username: formData.username
      });

      alert('Username updated successfully!');
    } catch (error) {
      console.error("Error updating username:", error);
      alert('Error updating username');
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert("New password and confirm password don't match");
      return;
    }

    try {
      await api.put(`/users/password/${currentUser}`, {
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      alert('Password updated successfully!');
    } catch (error) {
      console.error("Error updating password:", error);
      alert('Error updating password: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleSubmitImage = async (e) => {
    e.preventDefault();
    if (profileImage) {
      try {
        const formData = new FormData();
        formData.append('userImage', profileImage);

        const response = await api.put(`/users/image/${currentUser}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.userImage && response.data.userImage.url) {
          setPreviewImage(response.data.userImage.url);

          setUserdata(prev => ({
            ...prev,
            userImage: response.data.userImage
          }));

          alert('Profile image updated successfully!');
        } else {
          try {
            const userData = await api.get(`/users/${currentUser}`);
            setUserdata(userData.data);

            if (userData.data.userImage && userData.data.userImage.url) {
              setPreviewImage(userData.data.userImage.url);
            }

            alert('Profile image updated successfully!');
          } catch (refreshError) {
            console.error("Error refreshing user data:", refreshError);
            alert('Profile image updated successfully! Please refresh to see changes.');
          }
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Unknown error';
        alert(`Error updating profile image: ${errorMessage}`);
      }
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  const renderStarRating = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={i < rating ? 'star filled' : 'star'}>★</span>
    ));
  };

  // Address management functions are now handled by the AddressBook component

  return (
    <div className="userpanel-container">
      <div className="userpanel-sidebar">
        <div className="user-info">
          <Link to="/"><img src='/Nexashop.png' className='mb-8' /></Link>
          <div className="user-avatar">
            <img src={previewImage} alt="Profile" />
          </div>
          <h3>{userdata?.username}</h3>
        </div>

        <nav className="userpanel-nav">
          <button
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <HiUser className="nav-icon" />
            <span>Profile</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <HiLockClosed className="nav-icon" />
            <span>Password</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <HiShoppingBag className="nav-icon" />
            <span>My Orders</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <HiStar className="nav-icon" />
            <span>My Reviews</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'photo' ? 'active' : ''}`}
            onClick={() => setActiveTab('photo')}
          >
            <HiPhotograph className="nav-icon" />
            <span>Profile Photo</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            <HiLocationMarker className="nav-icon" />
            <span>Address Book</span>
          </button>
        </nav>
      </div>

      <div className="userpanel-content">
        {activeTab === 'profile' && (
          <div className="content-section">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmitUsername}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                />
              </div>
              <button type="submit" className="btn-submit">Update Username</button>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="content-section">
            <h2>Change Password</h2>
            <form onSubmit={handleSubmitPassword}>
              <div className="form-group password-group">
                <label htmlFor="currentPassword">Current Password</label>
                <div className="password-input">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPassword.current ? <HiEyeOff /> : <HiEye />}
                  </button>
                </div>
              </div>

              <div className="form-group password-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="password-input">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPassword.new ? <HiEyeOff /> : <HiEye />}
                  </button>
                </div>
              </div>

              <div className="form-group password-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="password-input">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPassword.confirm ? <HiEyeOff /> : <HiEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-submit">Update Password</button>
            </form>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="content-section">
            <h2>My Orders</h2>
            {isLoading ? (
              <div className="loading">Loading your orders...</div>
            ) : orders.length > 0 ? (
              <div className="orders-container">
                {orders.map(order => (
                  <div className="order-card" key={order.id}>
                    <div className="order-header">
                      <h3>Order<br />#{order.id}</h3>
                      <span className={`order-status ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-details">
                      <div className="detail-item">
                        <span className="detail-label">Order Date:</span>
                        <span className="detail-value">{order.date}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Items:</span>
                        <span className="detail-value">{order.items}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Total:</span>
                        <span className="detail-value">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't placed any orders yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="content-section">
            <h2>My Reviews</h2>
            {isLoading ? (
              <div className="loading">Loading your reviews...</div>
            ) : reviews.length > 0 ? (
              <div className="reviews-container">
                {reviews.map(review => (
                  <div className="review-card" key={review.id}>
                    <h3 className="product-name">{review.product.name}</h3>
                    <div className="rating">
                      {renderStarRating(review.rating)}
                    </div>
                    <p className="review-comment">{review.reviewText}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't written any reviews yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'photo' && (
          <div className="content-section">
            <h2>Update Profile Photo</h2>
            <form onSubmit={handleSubmitImage}>
              <div className="profile-image-preview">
                <img
                  src={previewImage || profileImage || "https://via.placeholder.com/150"}
                  alt="Profile Preview"
                />
              </div>
              <div className="form-group">
                <label htmlFor="profileImage" className="file-input-label">
                  <span>Choose Image</span>
                </label>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
              </div>
              <button
                type="submit"
                className="btn-submit"
                disabled={!profileImage}
              >
                Update Profile Image
              </button>
            </form>
          </div>
        )}

        {activeTab === 'addresses' && (
          <AddressBook currentUser={currentUser} />
        )}
      </div>
    </div>
  )
}

export default Userpanel