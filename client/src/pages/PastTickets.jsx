import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from "react-router-dom";
import Navbar from '../components/Navbar';
import ShowtimeDetails from '../components/ShowtimeDetails'; // Adjust if needed
import Loading from '../components/Loading';
import { AuthContext } from "../context/AuthContext";

const PastTickets = () => {

  const { auth } = useContext(AuthContext);
  const location = useLocation();
  const [moviesWatched, setMoviesWatched] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const pastShowtimeIds = location.state?.pastShowtimeIds || [];

  useEffect(() => {
    // const fetchPastTickets = async () => {
    //   try {
    //     // Replace with your actual API endpoint
    //     const response = await axios.get('/past-tickets', {
    //         headers: {
    //           Authorization: `Bearer ${auth.token}`
    //         }
    //       });
    //     setTickets(response.data.tickets);
    //   } catch (error) {
    //     console.error('Error fetching past tickets:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    
    const fetchMoviesWatched = async (showtimeIds) => {
        try {
          // Step 1: Send Tickets Data to Backend
          const response = await axios.post(
            "/movie/fetchMoviesWatched",
            { showtimeIds },
            {
              headers: {
                Authorization: `Bearer ${auth.token}`,
              },
            }
          );
      
          // Step 2: Receive Movies Data from Backend
          const moviesWatched  = response.data.data;
      
          // Step 3: Update State to Display Movies
          setMoviesWatched(moviesWatched);
          console.log(moviesWatched);
        } catch (error) {
          console.error("Error fetching movies watched:", error);
        } finally {
          setLoading(false);
        }
      };

    // fetchPastTickets();
    // fetchMoviesWatched(tickets.map(ticket => ticket.showtime._id));
    fetchMoviesWatched(pastShowtimeIds);
  }, []);

  // return (
  //   <div>
  //     <Navbar />
  //     <div className="container">
  //       <h1>Past Tickets</h1>
  //       {loading ? (
  //         <Loading />
  //       ) : (
  //         tickets.map((ticket, index) => (
  //           <div key={index}>
  //             <ShowtimeDetails showtime={ticket.showtime} />
  //             {/* Display other ticket details as needed */}
  //           </div>
  //         ))
  //       )}
  //     </div>
  //   </div>
  // );
  return (
    <div className="flex min-h-screen flex-col gap-4 bg-gradient-to-br pb-8 text-gray-900 sm:gap-8">
      <Navbar />
      <div className="mx-4 flex h-fit flex-col gap-4 rounded-md bg-gradient-to-br p-4 drop-shadow-xl sm:mx-8 sm:p-6">
        <h2 className="text-3xl font-bold text-gray-900">Past Tickets</h2>
        {loading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {moviesWatched.map((movie, index) => (
              <div className="flex flex-col items-center p-4 bg-white rounded shadow" key={index}>
                <img
                  src={movie.movieImg}
                  alt={movie.movieName}
                  className="w-32 px-4 drop-shadow-md" // Fixed size for images
                />
                <div className="mt-2 text-center">
                  <h3 className="text-lg font-bold">{movie.movieName}</h3>
                  <p className="text-sm">{new Date(movie.showtimeDateTime).toLocaleString()}</p>
                  {/* Include other details you want to show */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PastTickets;
