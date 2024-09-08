import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import Loading from './Loading';

const NowShowing = ({ movies, selectedMovieIndex, setSelectedMovieIndex, isFetchingMoviesDone }) => {
  return (
    <div className="p-6 bg-gray-100 rounded-md shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Now Showing</h2>
      <p className="text-m font-bold text-gray-600 mb-3">Recommended movies</p>
      {isFetchingMoviesDone ? (
        movies.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {movies?.map((movie, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedMovieIndex(index);
                  sessionStorage.setItem('selectedMovieIndex', index);
                }}
              >
                <img
                  src={movie.img}
                  alt={movie.name}
                  className="image-container h-48 rounded-md object-cover drop-shadow-md transition duration-300 ease-in-out transform hover:scale-105 sm:h-48"
                />
                <div className="p-4">
                  <p className="text-lg font-semibold leading-6 text-gray-800">{movie.name}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-center text-gray-800">There are no movies available</p>
        )
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default NowShowing;
