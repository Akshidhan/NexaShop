import { useState } from 'react';
import './signin.scss';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../../../store/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import api from '../../../../utils/axios';

import signin from '/signin.jpg';
import logo from '/Nexashop.png';

function Signin() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.user);

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        dispatch(loginStart());
        
        try {
            const response = await api.post(`/auth/login`, {
                username: formData.username,
                password: formData.password,
                role: 'user'
            });
            
            if (response.data.accessToken) {
                dispatch(loginSuccess({
                    id: response.data.user.id,
                    role: 'user',
                    accessToken: response.data.accessToken
                }));
                
                navigate('/')
                
            } else {
                dispatch(loginFailure("Invalid login response"));
            }
        } catch (error) {
            console.error("Login error:", error);
            const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
            dispatch(loginFailure({errorMessage}));
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-image-section">
                <img src={signin} alt="NexaShop Logo" className='object-cover' />
            </div>
            
            <div className="signin-form-section">
                <div className="signin-form-wrapper">
                    <div className="signin-logo mb-5">
                        <Link to="/signup"><img src={logo} alt="NexaShop Logo" className='w-[200px]' /></Link>
                    </div>
                    <h1>Sign In</h1>
                    <p className="signin-subtitle">Enter your credentials to access your account</p>
                    
                    <form onSubmit={handleSubmit} className="signin-form">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="form-options flex justify-end">
                            <a href="" className="forgot-password">Forgot password?</a>
                        </div>
                        
                        <button type="submit" className="signin-button">Sign In</button>
                    </form>
                    
                    <div className="signin-footer">
                        <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signin;