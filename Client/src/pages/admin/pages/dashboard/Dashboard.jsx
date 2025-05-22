import DetailCard from '../../components/detailCard/DetailCard'
import './dashboard.scss'
import { HiUsers, HiShoppingBag, HiCurrencyDollar } from "react-icons/hi2"
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Dashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [Past7Days, setPast7Days] = useState([]);
  const { isAuthenticated } = useSelector(state => state.user);

  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Update the document title when component mounts
  useEffect(() => {
    document.title = 'Admin Dashboard | Nexashop';
    
    // Optionally restore the original title when component unmounts
    return () => {
      document.title = 'Nexashop';
    };
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const token = localStorage.getItem('adminToken');

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        // Fetch all counts in parallel with auth headers
        const [usersResponse, productsResponse, orderResponse, weekResponse] = await Promise.all([
          axios.get(`${baseUrl}/count/users`, config),
          axios.get(`${baseUrl}/count/products`, config),
          axios.get(`${baseUrl}/count/orders`, config),
          axios.get(`${baseUrl}/count/users-7-days`, config)
        ]);

        // Update state with fetched data
        setUserCount(usersResponse.data.count);
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
  }, [isAuthenticated, baseUrl]);

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
        label: 'New Users',
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
        text: 'Weekly User Growth',
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
          name="Total Users"
          icon={<HiUsers className="size-15" />}
          detail={isLoading ? 'Loading...' : userCount}
        />
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