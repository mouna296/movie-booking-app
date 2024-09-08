import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";
import NowShowing from "../components/NowShowing";
import TheaterListsByMovie from "../components/TheaterListsByMovie";
import SelectedMovie from "../components/SelectedMovie";
import { AuthContext } from "../context/AuthContext";
import { useLocation } from "../context/LocationContext";
import UpcomingMovies from "../components/UpcomingMovies";


const Home = () => {
  const { auth } = useContext(AuthContext);
  const [selectedMovieIndex, setSelectedMovieIndex] = useState(
    parseInt(sessionStorage.getItem("selectedMovieIndex"))
  );
  const { selectedLocation, updateLocation } = useLocation();
  const [movies, setMovies] = useState([]);
  const [isFetchingMoviesDone, setIsFetchingMoviesDone] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [showLocationModal, setshowLocationModal] = useState(true);
  const [allLocations, setAllLocations] = useState([]);



  const fetchMovies = async () => {
    try {
      setIsFetchingMoviesDone(false);
      let response;
      if (auth.role === "admin") {
        response = await axios.get("/movie/unreleased/showing", {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
      } else {
        response = await axios.get("/movie/showing");
      }
      setMovies(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingMoviesDone(true);
    }
  };
  const fetchLocations = async () => {
    try {
        const response = await axios.get(`/cinema`);
        const cinemas = response.data.data;
        const locations = [];
        cinemas.map((cinema) => {
          locations.push(cinema.location);
        })
        setAllLocations(locations);
        
    } catch (error) {
        console.error('Error fetching occupancy data:', error);
    }
}
  useEffect(() => {
    if(allLocations.length > 0){
      setLocationModalOpen(true);
    }
  }, [allLocations]);

  useEffect(() => {
    fetchMovies();
  }, []);


  useEffect(() => {
    openLocationModal(); 
  }, []);

  const props = {
    movies,
    selectedMovieIndex,
    setSelectedMovieIndex,
    auth,
    isFetchingMoviesDone
  };
   
  const handleLocation = (location) => {
    updateLocation(location);
    setLocationModalOpen(false);
  };

  const closeLocationModal = () => {
    setLocationModalOpen(false);
  };

  const  openLocationModal = async () => {
    await fetchLocations();
    
  };

  const closeModal = () => {
    setshowLocationModal(false);
  };

  return (
    <div className="flex min-h-screen flex-col gap-4 bg-gradient-to-br from-slate-600 to-slate-500 pb-8 sm:gap-8">
      <Navbar />
      {locationModalOpen && (
            <Modal
              isOpen={locationModalOpen}
              onRequestClose={closeLocationModal}
              shouldCloseOnOverlayClick={false}
              contentLabel="Location Modal"
              className="modal w-full max-w-lg overflow-y-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-md z-90 border-4 border-solid border-gray-800"
            >
              <h2 className="text-2xl font-bold bg-white mb-4 p-4 rounded-t-md">
                Select location:
              </h2>
              <div className="flex flex-col gap-4 mb-4 py-4">
                {
                  allLocations.map((location_, index) => (
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex-grow"
                      onClick={() => handleLocation(location_)}
                    >
                    {location_}
                    </button>
                  ))
                }
                
              </div>
              <div className="flex justify-end py-2">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  onClick={closeLocationModal}
                >
                  Close
                </button>
              </div>
            </Modal>
          )}
  
      {movies[selectedMovieIndex]?.name ? (
        <SelectedMovie {...props} />
      ) : (
        <NowShowing {...props} />
        
      )}
      
      {movies[selectedMovieIndex]?.name && <TheaterListsByMovie {...props} />}
      <UpcomingMovies {...props}  />
      

      
    </div>
  );
};

export default Home;
