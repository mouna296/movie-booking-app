import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables} from 'chart.js';

Chart.register(...registerables);
const Analytics = () => {
    const { auth } = useContext(AuthContext);
    const [rawData, setRawData] = useState([]);
    const [occupancyData, setOccupancyData] = useState([]);
    const [period, setPeriod] = useState(30);
    const [locationFilter, setLocationFilter] = useState('All');
    const [movieFilter, setMovieFilter] = useState('All');
    const [chartMovieData, setCharMovieData] = useState();
    const [charLoctionData, setCharLoctionData] = useState();

    
    const [showBarMovieGraph, setshowBarMovieGraph] = useState(false);

    useEffect(() => {
        const fetchOccupancyData = async () => {
            try {
                const response = await axios.get(`/dashboard/occupancy?period=${period}`, {
                    headers: {
                        Authorization: `Bearer ${auth.token}`
                    }
                });
                setRawData(response.data.data);
                processOccupancyData(response.data.data, 'All', 'All');

            } catch (error) {
                console.error('Error fetching occupancy data:', error);
            }
        };

        fetchOccupancyData();
    }, [period, auth.token]);

    const processOccupancyData = (data, location, movie) => {

        let filteredData_ = data;
        if(location !== "All"){
            filteredData_ = data.filter((movieData) => movieData.location === location);
        }
        if(movie !== "All"){
            filteredData_ = filteredData_.filter((movieData) => movieData.movie === movie);
        }

        let charMovieCustom = {};
        
        filteredData_.map((data) => {
            if(data.movie in charMovieCustom){
                let num = charMovieCustom[data.movie];
                num += data.totalSeatsSold;
                charMovieCustom[data.movie] = num;
            }
            else{
                charMovieCustom[data.movie] = data.totalSeatsSold;
            }
        })
        console.log(charMovieCustom);

        let charLocationCustom = {};
        filteredData_.map((data) => {
            if(data.location in charLocationCustom){
                let num = charLocationCustom[data.location];
                num += data.totalSeatsSold;
                charLocationCustom[data.location] = num;
            }
            else{
                charLocationCustom[data.location] = data.totalSeatsSold;
            }
        })

        console.log(charLocationCustom);

        let movieLabels = [];
        let moviesSeats = [];
        for(let key in charMovieCustom){
            movieLabels.push(key);
            moviesSeats.push(charMovieCustom[key]);
        }

        let charMovieData = {};
        charMovieData["labels"] = movieLabels;
        let movieDataset = [];
        let singleMovieDataset = {};
        singleMovieDataset["label"] = "Movies Over Total Seats solds"
        singleMovieDataset["data"] = moviesSeats;
        let backgroundMovies = [];
        
        let borderMovies = [];
        movieLabels.map((movie) => {
            backgroundMovies.push('rgba(255, 99, 132, 0.6)');
            borderMovies.push('rgba(255, 99, 132, 1)');
        })
        singleMovieDataset["backgroundColor"] = backgroundMovies;
        singleMovieDataset["borderColor"] = borderMovies;
        movieDataset.push(singleMovieDataset);
        charMovieData["datasets"] = movieDataset;

        console.log(charMovieData);
        setCharMovieData(charMovieData);

        let LocationLabels = [];
        let LocationsSeats = [];
        for(let key in charLocationCustom){
            LocationLabels.push(key);
            LocationsSeats.push(charLocationCustom[key]);
        }

        let charLocationData = {};
        charLocationData["labels"] = LocationLabels;
        let LocationDataset = [];
        let singleLocationDataset = {};
        singleLocationDataset["label"] = "Locations Over Total Seats solds"
        singleLocationDataset["data"] = LocationsSeats;
        let backgroundLocations = [];
        
        let borderLocations = [];
        LocationLabels.map((Location) => {
            backgroundLocations.push('rgba(54, 162, 235, 0.6)');
            borderLocations.push('rgba(255, 99, 132, 1)');
        })
        singleLocationDataset["backgroundColor"] = backgroundLocations;
        singleLocationDataset["borderColor"] = borderLocations;
        LocationDataset.push(singleLocationDataset);
        charLocationData["datasets"] = LocationDataset;

        console.log(charLocationData);
        setCharLoctionData(charLocationData);

        let locationLabels = [];
        let locationsSeats = [];
        for(let key in charLocationCustom){
            locationLabels.push(key);
            locationsSeats.push(charLocationCustom[key]);
        }

        const processedData = filteredData_.reduce((acc, curr) => {
            const key = `${curr.movie} - ${curr.location}`;
            if (acc[key]) {
                acc[key].totalSeatsSold += curr.totalSeatsSold;
            } else {
                acc[key] = {...curr};
            }
            return acc;
        }, {});

        setOccupancyData(Object.values(processedData));

    };


    const handleLocationChange = (e) => {
        setLocationFilter(e.target.value);
        processOccupancyData(rawData, e.target.value, movieFilter);
    };

    const handleMovieChange = (e) => {
        setMovieFilter(e.target.value);
        processOccupancyData(rawData, locationFilter, e.target.value);
    };

    const uniqueLocations = ['All', ...new Set(rawData.map(item => item.location))];
    const uniqueMovies = ['All', ...new Set(rawData.map(item => item.movie))];

    return (
        <div className="flex min-h-screen flex-col gap-4  pb-8 text-gray-900 sm:gap-8">
            <Navbar />
            <div className="mx-4 flex h-fit flex-col gap-4 rounded-md  p-4 drop-shadow-xl sm:mx-8 sm:p-6">
                <h2 className="text-3xl font-bold text-gray-900">Theater Occupancy Analytics</h2>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="my-4 w-full">
                        <label htmlFor="period-select" className="block text-lg font-medium text-gray-700">Select Period:</label>
                        <select id="period-select" value={period} onChange={(e) => {setPeriod(e.target.value);setLocationFilter('All');setMovi}} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="30">Last 30 Days</option>
                            <option value="60">Last 60 Days</option>
                            <option value="90">Last 90 Days</option>
                        </select>
                    </div>
                    <div className="my-4 w-full">
                        <label htmlFor="location-select" className="block text-lg font-medium text-gray-700">Select Location:</label>
                        <select id="location-select" value={locationFilter} onChange={handleLocationChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            {uniqueLocations.map(location => (
                                <option key={location} value={location}>{location}</option>
                            ))}
                        </select>
                    </div>
                    <div className="my-4 w-full">
                        <label htmlFor="movie-select" className="block text-lg font-medium text-gray-700">Select Movie:</label>
                        <select id="movie-select" value={movieFilter} onChange={handleMovieChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            {uniqueMovies.map(movie => (
                                <option key={movie} value={movie}>{movie}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <div>
                    {occupancyData.length > 0 ? (
                        <div>
                            {occupancyData.map((data, index) => (
                                <div key={index} className="mb-4 p-4 rounded bg-white shadow">
                                    <h4 className="text-xl font-semibold">{data.movie} - {data.location}</h4>
                                    <p>Total Seats Sold: {data.totalSeatsSold}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No data available for the selected period, location, or movie.</p>
                    )}
                    </div>
                    <div>
                        {chartMovieData && 
                            <Bar
                            data={chartMovieData}
                            options={{
                                indexAxis: 'x', // Change 'x' to 'y' for horizontal bars
                                responsive: true,
                                scales: {
                                x: {
                                    beginAtZero: true,
                                },
                                y: {
                                    beginAtZero: true,
                                },
                                },
                            }}
                            />
                        }
                        {charLoctionData && 
                            <Bar
                            data={charLoctionData}
                            options={{
                                indexAxis: 'x', // Change 'x' to 'y' for horizontal bars
                                responsive: true,
                                scales: {
                                x: {
                                    beginAtZero: true,
                                },
                                y: {
                                    beginAtZero: true,
                                },
                                },
                            }}
                            />
                        }
                    
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;