import {
  ClockIcon,
  FilmIcon,
  HomeModernIcon,
  MagnifyingGlassIcon,
  TicketIcon,
  UsersIcon,
  VideoCameraIcon,
  ChartBarIcon,
  MapPinIcon,
  PlayIcon
} from "@heroicons/react/24/outline";

import { Bars3Icon } from "@heroicons/react/24/solid";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { useLocation } from "../context/LocationContext";
import Modal from "react-modal";
import './Style.css';

const Navbar = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, SetLoggingOut] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const { selectedLocation, updateLocation } = useLocation();
  const [allLocations, setAllLocations] = useState([]);

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
  const handleLocation = (location) => {
    updateLocation(location);
    setLocationModalOpen(false);
  };
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const openLocationModal = async () => {
    await fetchLocations();

  };

  const closeLocationModal = () => {
    setLocationModalOpen(false);
  };

  useEffect(() => {
    if (allLocations.length > 0) {
      setLocationModalOpen(true);
    }
  }, [allLocations]);

  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      SetLoggingOut(true);
      const response = await axios.get("/auth/logout");
      // console.log(response)
      setAuth({ username: null, email: null, role: null, token: null });
      sessionStorage.clear();
      navigate("/");
      toast.success("Logout successful!", {
        position: "top-center",
        autoClose: 2000,
        pauseOnHover: false,
      });
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        position: "top-center",
        autoClose: 2000,
        pauseOnHover: false,
      });
    } finally {
      SetLoggingOut(false);
    }
  };

  const menuLists = () => {
    return (
      <>
      <div className="flex margin-top-4">
      <div className="flex flex-row gap-4">
            <>
              <Link
                to={"/cinema"}
                className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-white hover:bg-gray-500 ${window.location.pathname === "/cinema"
                    ? "bg-gradient-to-br from-red-800 to-red-700"
                    : "bg-#6c757d"
                  }`}
              >
                <HomeModernIcon className="h-6 w-6" />
                <p>Cinema</p>
              </Link>
            </>

            <Link
              to={"/schedule"}
              className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-white hover:bg-gray-500 ${window.location.pathname === "/schedule"
                  ? "bg-gradient-to-br from-red-800 to-red-700"
                  : "bg-#6c757d"
                }`}
            >
              <ClockIcon className="h-6 w-6" />
              <p>Schedule</p>
            </Link>

            {auth.role === "admin" && (
              <>
                <div className="flex lg:gap-4">
                  <Link
                    to={"/movie"}
                    className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-white hover:bg-gray-500 ${window.location.pathname === "/movie"
                        ? "bg-gradient-to-br from-red-800 to-red-700"
                        : "bg-#6c757d"
                      }`}
                  >
                    <VideoCameraIcon className="h-6 w-6" />
                    <p>Movie</p>
                  </Link>
                  {/* <Link
                to={"/search"}
                className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-white hover:bg-gray-500 ${
                  window.location.pathname === "/search"
                    ? "bg-gradient-to-br from-red-800 to-red-700"
                    : "bg-gray-600"
                }`}
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
                <p>Search</p>
              </Link> */}
                  <Link
                    to={"/user"}
                    className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-white hover:bg-gray-500 ${window.location.pathname === "/user"
                        ? "bg-gradient-to-br from-red-800 to-red-700"
                        : "bg-#6c757d"
                      }`}
                  >
                    <UsersIcon className="h-6 w-6" />
                    <p>User</p>
                  </Link>
                </div >
                <div className="flex flex-row lg:flex-col lg:gap-4">
                  <Link
                    to={'/dashboard'}
                    className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-white hover:bg-gray-500 ${window.location.pathname === '/dashboard'
                        ? 'bg-gradient-to-br from-red-800 to-red-700'
                        : 'bg-#6c757d'
                      }`}
                  >
                    <ChartBarIcon className="h-6 w-6" />
                    <p>Dashboard</p>
                  </Link>
                </div>

              </>
            )}
          </div>
      <div className="hidden lg:flex lg:items-center lg:ml-auto lg:gap-4">
          <button
            className="rounded-lg bg-gradient-to-br bg-gray-600 px-2 py-1 text-white drop-shadow-md hover:from-indigo-500 hover:to-blue-400"
            onClick={openLocationModal}
          >
            <div className="flex">
              <MapPinIcon className="flex-shrink h-6 w-6" />
              <div className="flex-grow">
                {selectedLocation ? <>{selectedLocation}</> : "Location"}
              </div>
            </div>
          </button>

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

          {auth.username && (
            <p className="text-md whitespace-nowrap leading-none text-white">
              Welcome {auth.username}!
            </p>
          )}
          <div className="flex flex-col gap-2 lg:flex-row">
            {auth.token ? (
              <button
                className="rounded-lg bg-gradient-to-br from-red-600 px-2 py-1 text-white drop-shadow-md hover:from-red-500 hover:to-red-400 disabled:from-slate-500 disabled:to-slate-400"
                onClick={() => onLogout()}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Processing..." : "Logout"}
              </button>
            ) : (
              <button className="rounded-lg bg-gradient-to-br from-red-600 px-2 py-1 text-white drop-shadow-md hover:from-red-500 hover:to-red-400">
                <Link to={"/login"}>Login</Link>
              </button>
            )}
          </div>
          {auth.role && (


            <Link
              to={"/ticket"}
              className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-white hover:bg-gray-500 ${window.location.pathname === "/ticket"
                  ? "bg-gradient-to-br from-red-800 to-red-700"
                  : "bg-gray-600"
                }`}
            >
              <TicketIcon className="h-4 w-4" />
              <p className="text-xs">My Profile</p>
            </Link>


          )}
        </div>
      </div>
      </>
    );
  };

  return (
    <div>
      <nav className="flex flex-col items-center justify-between gap-2 bg-gray-900 px-4 py-3 drop-shadow-lg lg:flex-row lg:justify-start sm:px-8">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <button
            className="flex items-center gap-2"
            onClick={() => navigate("/")}
          >
            <PlayIcon className="h-8 w-8 text-white 500" />
            <h1 style={{ color: 'rgb(239, 100, 0)', fontSize: '24px' }} className="mr-2 text-4xl text-white font-custom">ITSshowtime</h1>
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-700 lg:hidden"
            onClick={() => toggleMenu()}
          >
            <Bars3Icon className="h-6 w-6 text-white" />
          </button>
        </div>
      
      </nav>
      <nav>
      <div className="bottom-nav">
          <div>
            {menuLists()}
            <div>
            {menuOpen && (
              <div>
            {menuLists()}
            </div> )}
            </div>

          </div>
        </div>

        
      </nav>
    </div>

  );
};

export default Navbar;
