import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../../../../store/slices/userSlice';
import './login.scss';
import api from '../../../../utils/axios';

const SellerLogin = () => {
    if(useSelector((state) => state.user.isAuthenticated)){
        window.location.href = "/seller/sellerPanel";
    }

    useEffect(() => {
        document.title = 'Seller Login | Nexashop';
        
        return () => {
          document.title = 'Nexashop';
        };
      }, []);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const role = "seller";
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.user);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        dispatch(loginStart());
        
        try {
            const response = await api.post(`/auth/login`, {
                username,
                password,
                role
            });
            
            console.log("Login response:", response.data);
            
            if (response.data.accessToken) {
                dispatch(loginSuccess({
                    id: response.data.user.id,
                    role: role,
                    accessToken: response.data.accessToken
                }));
                
                navigate('/seller')
                
            } else {
                dispatch(loginFailure("Invalid login response"));
            }
        } catch (error) {
            console.error("Login error:", error);
            const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
            dispatch(loginFailure({errorMessage}));
        }
    }
    
    return(
        <>
        <div className="flex flex-col items-center justify-center h-screen ">
            <form className='size-fit bg-gray-100 p-4 rounded-md'>
            <div className='w-100 flex justify-center pb-2 flex-col items-center'>
                <a href="/" className=''><img src="/Nexashop.png" alt="logo" className='w-[200px]' /></a>
                <p className='text-3xl font-bold'>Seller</p>
            </div>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            <label htmlFor="username" className="flex flex-col">
                <span className="text-2xl">
                    Username
                </span>
                <input
                    type="username"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="p-[7px]"
                    disabled={loading}
                />
            </label>
            <label htmlFor="password" className="flex flex-col">
                <span className="text-2xl">
                    Password
                </span>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="p-[7px] w-full"
                        disabled={loading}
                    />
                    <button 
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={togglePasswordVisibility}
                        tabIndex="-1"
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                </div>
            </label>
            <button 
                className='bg-black text-white p-[7px] rounded-md mt-4 w-100' 
                onClick={handleLogin}
                disabled={loading}
            >
                <span className="text-2xl">
                    {loading ? 'Loading...' : 'Login'}
                </span>
            </button>
            </form>
        </div>
        </>
    )
}

export default SellerLogin

