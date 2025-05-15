import { useState } from 'react';
import axios from 'axios';
import './login.scss';

const Login = () => {
    const [username, setUsername] =  useState("");
    const [password, setPassword] =  useState("");
    const role = "admin";

    const baseurl = import.meta.env.VITE_BASE_URL;
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${baseurl}/auth`, {
                username,
                password,
                role
            });
            if (response.data.accessToken) {
                localStorage.setItem('token', response.data.token);
                window.location.href = '/admin/adminPanel';
            } else {
                alert('Login failed: ' + (response.data.message || 'Unknown error'));
            }
        } catch (error) {
            alert('Login error: ' + (error.response?.data?.message || error.message));
        }
    }
    
    return(
        <>
        <div className="flex flex-col items-center justify-center h-screen ">
            <form className='size-fit bg-gray-100 p-4 rounded-md'>
            <div className='w-100 flex justify-center pb-2'><a href="/" className=''><img src="/Nexashop.png" alt="logo" className='w-[200px]' /></a></div>
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
                />
            </label>
            <button className='bg-black text-white p-[7px] rounded-md mt-4 w-100' onClick={handleLogin}>
                <span className="text-2xl">
                    Login
                </span>
            </button>
            </form>
        </div>
        </>
    )
}

export default Login;