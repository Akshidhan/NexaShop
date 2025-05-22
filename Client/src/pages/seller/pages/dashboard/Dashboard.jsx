import DetailCard from '../../components/detailCard/DetailCard'
import './dashboard.scss'
import { HiShoppingBag, HiCurrencyDollar } from "react-icons/hi2"
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useState, useEffect } from 'react';
import api from '../../../../utils/axios';
import { useSelector } from 'react-redux';

const Dashboard = () => {
    const [productCount, setProductCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [Past7Days, setPast7Days] = useState([]);
    const { isAuthenticated, currentUser } = useSelector(state => state.user);

    const baseUrl = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        document.title = 'Seller Dashboard | Nexashop';
        
        return () => {
        document.title = 'Nexashop';
        };
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
        try {
            setIsLoading(true);

            const token = localStorage.getItem('token');
            
            const [productsResponse, orderResponse, weekResponse] = await Promise.all([
            api.get(`${baseUrl}/count/products/${currentUser}`),
            api.get(`${baseUrl}/count/orders/${currentUser}`),
            api.get(`${baseUrl}/count/orders/${currentUser}/last-7-days`),
            ]);

            // Update state with fetched data
            setProductCount(productsResponse.data.count);
            setOrderCount(orderResponse.data.count);
            setPast7Days(weekResponse.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
        };

        if (isAuthenticated) {
        fetchDashboardData();
        }
    }, [isAuthenticated]);


    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

    const getPast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        return days;
    };

    const data = {
        labels: getPast7Days(),
        datasets: [
        {
            label: 'Orders',
            data: Past7Days,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0,
        },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
        legend: {
            position: 'bottom',
        },
        title: {
            display: true,
            text: 'Weekly Order Count',
            font: {
            size: 20
            },
        },
        },
    };

    return (
        <>
        <div className="dashboard-container flex gap-4">
            <DetailCard
            name="Total Products"
            icon={<HiShoppingBag className="size-15" />}
            detail={isLoading ? 'Loading...' : productCount}
            />
            <DetailCard
            name="Pending Orders"
            icon={<HiCurrencyDollar className="size-15" />}
            detail={isLoading ? 'Loading...' : `${orderCount.toLocaleString()}`}
            />
        </div>

        <div className="chart mt-10 max-w-3/4 mx-auto">
            <Line data={data} options={options} />
        </div>
        </>
    )
}

export default Dashboard