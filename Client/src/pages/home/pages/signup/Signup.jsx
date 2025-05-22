import { useState } from 'react';
import './signup.scss';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import signin from '/signin.jpg';
import logo from '/Nexashop.png';

import api from '../../../../utils/axios';

function Signup() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
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

        if(formData.username === '' || formData.email === '' || formData.password === '' || formData.confirmPassword === '') {
            alert("Please fill in all fields");
            return;
        }


        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match");
            return;
        }
        
        try {
            const response = await api.post('/auth/signup', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: 'user'
            })
            
            if (response.data) {
                navigate('/signin')
                
            } else {
                alert("Invalid signup response");
            }
        } catch (error) {
            alert("Signup error:", error);
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
                        <Link to="/"><img src={logo} alt="NexaShop Logo" className='w-[200px]' /></Link>
                    </div>
                    <h1>Sign Up</h1>
                    <p className="signin-subtitle">Create your account to get started</p>

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
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
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
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="signin-button">Create Account</button>
                    </form>

                    <div className="signin-footer">
                        <p>Already have an account? <Link to="/signin">Sign in</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;