import {MagnifyingGlassIcon} from '@heroicons/react/24/solid'

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

const DashboardChart = () => {
  const [occupancyData, setOccupancyData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/dashboard/occupancy'); 
      setOccupancyData(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

 
  const chartData = {
    labels: occupancyData.map((data) => data.movie),
    datasets: [
      {
        label: 'Occupancy',
        data: occupancyData.map((data) => data.occupancy),
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
			scales: {
			  yAxes: [
				{
				  ticks: {
					beginAtZero: true,
				  },
				},
			  ],
			},
		  };



  return <Line data={chartData} />;
};

export default DashboardChart;