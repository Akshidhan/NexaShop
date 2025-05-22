import './footer.scss'
import logo from '/Nexashop.png'

function Footer() {
return (
    <div className='px-20 p-10'>
            <div><img src={logo} alt="" className='w-65' /></div>
            <div className='flex justify-between items-center mt-10 text-l font-bold'>
                    <div className='flex flex-row gap-10'>
                            <p>Sell your product</p>
                            <p>Contact us</p>
                            <p>About us</p>
                    </div>
                    <div className='flex flex-row gap-10'>
                            <p>Terms & Conditions</p>
                            <p>Privacy Policy</p>
                    </div>
            </div>
            <div className='flex justify-center items-center mt-10 text-l'>
                    <p className='text-center'>© {new Date().getFullYear()} Nexashop. All rights reserved.</p>
            </div>
    </div>
)
}

export default Footer