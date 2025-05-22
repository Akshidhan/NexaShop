import { useState } from 'react';
import './signin.scss';
import { Link } from 'react-router-dom';

import signin from '/signin.jpg';
import logo from '/Nexashop.png';

function Signin() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        

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