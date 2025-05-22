import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../../../../store/slices/userSlice';
import './login.scss';
import api from '../../../../utils/axios';

const AdminLogin = () => {
    if(useSelector((state) => state.user.isAuthenticated)){
        window.location.href = "/admin/adminPanel";
    }

    useEffect(() => {
        document.title = 'Admin Login | Nexashop';
        
        return () => {
          document.title = 'Nexashop';
        };
      }, []);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const role = "admin";
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.user);

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
                
                navigate('/admin')
                
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
            <div className='w-100 flex justify-center pb-2'><a href="/" className=''><img src="/Nexashop.png" alt="logo" className='w-[200px]' /></a></div>
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
            <label htmlFor="username" className="flex flex-col">
                <span className="text-2xl">
                    Password
                </span>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="p-[7px]"
                    disabled={loading}
                />
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

export default AdminLogin;