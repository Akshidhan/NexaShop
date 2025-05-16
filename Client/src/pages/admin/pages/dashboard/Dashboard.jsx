import DetailCard from '../../components/detailCard/DetailCard'
import './dashboard.scss'
import { HiUsers, HiShoppingBag, HiCurrencyDollar } from "react-icons/hi2"
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        setIsLoading(true);
        // Replace with your actual API endpoint
        const response = await axios.get('/api/users/count');
        setUserCount(response.data.count);
      } catch (error) {
        console.error('Failed to fetch user count:', error);
        // Fallback to default value if API call fails
        setUserCount(1205);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserCount();
  }, []);

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
        data: [12, 19, 10, 15, 22, 30, 25],
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
          detail="354"
        />
        <DetailCard
          name="Revenue"
          icon={<HiCurrencyDollar className="size-15" />}
          detail="$24,350"
        />
      </div>

      <div className="chart mt-10">
        <Line data={data} options={options} />
      </div>
    </>
  )
}

export default Dashboard