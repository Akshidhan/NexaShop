import './navbar.css'
import logo from '/Nexashop.png'
import { FaSearch } from "react-icons/fa";
import { HiOutlineShoppingCart, HiOutlineUser } from "react-icons/hi2";

function Navbar() {
  return (
    <div className="w-full flex items-center justify-between px-20 py-[30px]">
        <div className="logo">
            <img src={logo} alt="" className='w-[200px]'/>
        </div>
        <div className="flex items-center justify-center gap-2 search">
            <input type="text" placeholder='Search for products, brands and more' className='search-input'/>
            <button className='search-button'><FaSearch /></button>
        </div>
        <div>
            <div className="flex items-center justify-center gap-10">
                    <HiOutlineShoppingCart className='text-4xl'/>
                    <HiOutlineUser className='text-4xl'/>
            </div>
        </div>
    </div>
  )
}

export default Navbar