import axios from "axios";
import { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import CinemaLists from "./CinemaLists";
import DateSelector from "./DateSelector";
import Loading from "./Loading";
import TheaterShort from "./TheaterShort";
import { useLocation } from "../context/LocationContext";


const TheaterListsByMovie = ({
  movies,
  selectedMovieIndex,
  setSelectedMovieIndex,
  auth,
  isFetchingMoviesDone,
}) => {
  const [selectedDate, setSelectedDate] = useState(
    (sessionStorage.getItem("selectedDate") &&
      new Date(sessionStorage.getItem("selectedDate"))) ||
      new Date()
  );
  const [theaters, setTheaters] = useState([]);
  const [isFetchingTheatersDone, setIsFetchingTheatersDone] = useState(false);
  const [selectedCinemaIndex, setSelectedCinemaIndex] = useState(
    parseInt(sessionStorage.getItem("selectedCinemaIndex"))
  );
  const [cinemas, setCinemas] = useState([]);
  const [isFetchingCinemas, setIsFetchingCinemas] = useState(true);
  const { selectedLocation, updateLocation } = useLocation();

  const fetchCinemas = async (data) => {
    try {
      setIsFetchingCinemas(true);
      let response;
      if (auth.role === "admin") {
        response = await axios.get("/cinema/unreleased", {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
      } else {
        response = await axios.get("/cinema");
      }
      console.log(response.data.data);
      let filteredCinemas = response.data.data;
      if (selectedLocation !== null) {
        filteredCinemas = response.data.data.filter(
          (cinema) => cinema.location === selectedLocation
        );
      }  
	  console.log(filteredCinemas);
	  setCinemas(filteredCinemas);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingCinemas(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const fetchTheaters = async (data) => {
    try {
      setIsFetchingTheatersDone(false);
      let response;
      if (auth.role === "admin") {
        response = await axios.get(
          `/theater/movie/unreleased/${
            movies[selectedMovieIndex]._id
          }/${selectedDate.toISOString()}/${new Date().getTimezoneOffset()}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );
      } else {
        response = await axios.get(
          `/theater/movie/${
            movies[selectedMovieIndex]._id
          }/${selectedDate.toISOString()}/${new Date().getTimezoneOffset()}`
        );
      }
      setTheaters(
        response.data.data.sort((a, b) => {
          if (a.cinema.name > b.cinema.name) return 1;
          if (a.cinema.name === b.cinema.name && a.number > b.number) return 1;
          return -1;
        })
      );
      setIsFetchingTheatersDone(true);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTheaters();
  }, [selectedMovieIndex, selectedDate]);

  const props = {
    cinemas,
    selectedCinemaIndex,
    setSelectedCinemaIndex,
    fetchCinemas,
    auth,
    isFetchingCinemas,
  };

  const filteredTheaters = theaters.filter((theater) => {
    if (selectedCinemaIndex === 0 || !!selectedCinemaIndex) {
      return theater.cinema?.name === cinemas[selectedCinemaIndex]?.name;
    }
    return true;
  });

  
  return (
    <div className="flex flex-col min-h-screen bg-white via-red-500 to-pink-500 p-4">
      <CinemaLists {...props} />
      <div className="container mx-auto mt-4 p-4 rounded-lg shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white p-4 rounded-md shadow-md">
          <div className="flex items-center space-x-4">
            <img
              src={movies[selectedMovieIndex].img}
              alt={`Poster of ${movies[selectedMovieIndex].name}`}
              className="w-32 h-auto rounded-md shadow-lg"
            />
            <div>
              <h4 className="text-2xl font-semibold">
                {movies[selectedMovieIndex].name}
              </h4>
              <p className="text-md font-medium">
                Length: {movies[selectedMovieIndex].length || "-"} min
              </p>
            </div>
          </div>
          <DateSelector
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {isFetchingMoviesDone ? (
            filteredTheaters.map((theater, index) => (
              <TheaterShort
                key={theater._id}
                theaterId={theater._id}
                movies={movies}
                selectedDate={selectedDate}
                filterMovie={movies[selectedMovieIndex]}
              />
            ))
          ) : (
            <Loading />
          )}
        </div>
        {filteredTheaters.length === 0 && isFetchingMoviesDone && (
          <p className="text-center text-xl font-semibold text-white">
            No showtimes available
          </p>
        )}
      </div>
    </div>
  );
};

export default TheaterListsByMovie;