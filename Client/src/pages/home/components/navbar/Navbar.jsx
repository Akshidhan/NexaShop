import './navbar.css'
import logo from '/Nexashop.png'
import { FaSearch } from "react-icons/fa";
import { HiOutlineShoppingCart, HiOutlineUser } from "react-icons/hi2";
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Navbar() {
  const { isAuthenticated } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const handleUserIconClick = () => {
    if (isAuthenticated) {
      navigate('/userPanel');
    } else {
      navigate('/signin');
    }
  };

  const handleCartClick = () => {
    if (isAuthenticated) {
      navigate('/cart');
    } else {
      navigate('/signin');
    }
  };

  return (
    <div className="w-full flex items-center justify-between px-20 py-[30px]">
        <div className="logo">
            <Link to='/'><img src={logo} alt="" className='w-[200px]'/></Link>
        </div>
        <div className="flex items-center justify-center gap-2 search">
            <input type="text" placeholder='Search for products, brands and more' className='search-input'/>
            <button className='search-button'><FaSearch /></button>
        </div>
        <div>
            <div className="flex items-center justify-center gap-10">
                    <div onClick={handleCartClick} className="cursor-pointer">
                        <HiOutlineShoppingCart className='text-4xl'/>
                    </div>
                    <div onClick={handleUserIconClick} className="cursor-pointer">
                        <HiOutlineUser className='text-4xl'/>
                    </div>
            </div>
        </div>
    </div>
  )
}

export default Navbar