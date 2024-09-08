import axios from "axios";
import { useEffect, useState } from "react";
import Loading from "./Loading";

const UpcomingMovies = ({ auth }) => {
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const fetchUpcomingMovies = async () => {
      try {
        setIsFetching(true);
        const response = await axios.get("movie/unreleased/showingForUser", {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        setUpcomingMovies(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchUpcomingMovies();
  }, [auth.token]);


  return (
    <div className="mx-4 flex flex-col bg-gradient-to-br from-slate-200 to-slate-200 p-4 text-gray-900 drop-shadow-md sm:mx-8 sm:p-6">
      <h2 className="text-5xl items-center justify-center text-center font-bold">Upcoming Movies</h2>
      {isFetching ? (
        <Loading />
      ) : (
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '40px',
          padding: '10px',
        }}>
          {upcomingMovies.map((movie, index) => (
            <div key={index} style={{
              flex: '0 0 auto',
              minWidth: '160px',
              textAlign: 'center',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              borderRadius: '10px',
              overflow: 'hidden',
            }}>
              <img
                src={movie.img}
                alt={movie.name}
                style={{
                  width: '90%',
                  height: '80%',
                  display: 'block',
                }}
              />
              <div style={{
                padding: '10px',
              }}>
                <p style={{
                  fontWeight: 'bold',
                  marginBottom: '5px',
                }}>{movie.name}</p>
                <p>{movie.releaseDate}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingMovies;