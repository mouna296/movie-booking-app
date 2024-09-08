import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import MovieLists from '../components/MovieLists'
import Navbar from '../components/Navbar'
import { AuthContext } from '../context/AuthContext'

const Movie = () => {
	const { auth } = useContext(AuthContext)
	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors }
	} = useForm()

	const [movies, setMovies] = useState([])
	const [isFetchingMoviesDone, setIsFetchingMoviesDone] = useState(false)
	const [isAddingMovie, SetIsAddingMovie] = useState(false)
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  	const [selectedMovie, setSelectedMovie] = useState(null);

	const fetchMovies = async (data) => {
		try {
			setIsFetchingMoviesDone(false)
			const response = await axios.get('/movie')
			// console.log(response.data.data)
			reset()
			setMovies(response.data.data)
		} catch (error) {
			console.error(error)
		} finally {
			setIsFetchingMoviesDone(true)
		}
	}

	useEffect(() => {
		fetchMovies()
	}, [])

	const onAddMovie = async (data) => {
		try {
			data.length = (parseInt(data.lengthHr) || 0) * 60 + (parseInt(data.lengthMin) || 0)
			SetIsAddingMovie(true)
			const response = await axios.post('/movie', data, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// console.log(response.data)
			fetchMovies()
			toast.success('Add movie successful!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error('Error', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			SetIsAddingMovie(false)
		}
	}

	const handleDelete = (movie) => {
		// console.log(movie);
		const confirmed = window.confirm(
			`Do you want to delete movie ${movie.name}, including its showtimes and tickets?`
		)
		if (confirmed) {
			onDeleteMovie(movie._id)
		}
	}

	const onDeleteMovie = async (id) => {
		try {
			const response = await axios.delete(`/movie/${id}`, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// console.log(response.data)
			fetchMovies()
			toast.success('Delete movie successful!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error('Error', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		}
	}

	//update for movies

	const handleUpdateClick = (movie) => {
		setSelectedMovie(movie);
		setIsUpdateModalOpen(true);
		console.log(movie);
	  };

	const closeUpdateModal = () => {
		setIsUpdateModalOpen(false);
		setSelectedMovie(null);
	  };

	const handleUpdate = (movie) => {
		const confirmed = window.confirm(
			`Do you want to update movie ${movie.name}, including its showtimes and tickets?`
		)
		if (confirmed) {
			onUpdateMovie(movie._id, movie);
		}
	}

	const onUpdateMovie = async () => {
		try {
			const response = await axios.put(`/movie/${selectedMovie._id}`,selectedMovie, {
				headers: {
					Authorization: `Bearer ${auth.token}`,
					'Content-Type': 'application/json',	
				}
			})
			// console.log(response.data)
			fetchMovies()
			toast.success('Update movie successful!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error('Error', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		}
	}
	const changeUpdateMovie = (name) => {
		// console.log(name.target.value, "Gan Fall");
		setSelectedMovie((prevSelectedMovie) => ({
			...prevSelectedMovie,
			name: name.target.value
		  }));
	}
	const changeUpdateImgUrl = (url) => {
		// console.log(name.target.value, "Gan Fall");
		setSelectedMovie((prevSelectedMovie) => ({
			...prevSelectedMovie,
			img: url.target.value
		  }));
	}
	const changeUpdateLength = (length) => {
		// console.log(name.target.value, "Gan Fall");
		setSelectedMovie((prevSelectedMovie) => ({
			...prevSelectedMovie,
			length: length.target.value
		  }));
	}
	// const movieIdToUpdate = 'movie_id_to_update';
	// const updatedMovieDetails = {
	// name: 'Updated Title',
	// posterUrl: 'Updated Description',
	// lengthHr:'',
	// lengthMin:'',
	// }

	// onUpdateMovie(movieIdToUpdate, updatedMovieDetails)
		

	const inputHr = parseInt(watch('lengthHr')) || 0
	const inputMin = parseInt(watch('lengthMin')) || 0
	const sumMin = inputHr * 60 + inputMin
	const hr = Math.floor(sumMin / 60)
	const min = sumMin % 60

	return (
		<div className="flex min-h-screen flex-col gap-4 bg-gradient-to-br   pb-8 text-gray-900 sm:gap-8">
			<Navbar />
			<div className="mx-4 flex h-fit flex-col gap-4 rounded-md bg-slate-100 p-4 drop-shadow-xl sm:mx-8 sm:p-6">
				<h2 className="text-3xl font-bold text-gray-900">Movie Lists</h2>
				<form
					onSubmit={handleSubmit(onAddMovie)}
					className="flex flex-col items-stretch justify-end gap-x-4 gap-y-2 rounded-md bg-slate-200 to-white p-4 drop-shadow-md lg:flex-row"
				>
					<div className="flex w-full grow flex-col flex-wrap justify-start gap-4 lg:w-auto">
						<h3 className="text-xl font-bold">Add Movie</h3>
						<div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
							<label className="text-lg font-semibold leading-5">Name :</label>
							<input
								type="text"
								required
								className="w-full flex-grow rounded px-3 py-1 font-semibold drop-shadow-sm sm:w-auto"
								{...register('name', {
									required: true
								})}
							/>
						</div>
						<div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
							<label className="text-lg font-semibold leading-5">Poster URL :</label>
							<input
								type="text"
								required
								className="w-full flex-grow rounded px-3 py-1 font-semibold drop-shadow-sm sm:w-auto"
								{...register('img', {
									required: true
								})}
							/>
						</div>
						<div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
							<label className="text-lg font-semibold leading-5">Length (hr.):</label>
							<input
								type="number"
								min="0"
								max="20"
								maxLength="2"
								className="w-full flex-grow rounded px-3 py-1 font-semibold drop-shadow-sm sm:w-auto"
								{...register('lengthHr')}
							/>
						</div>
						<div>
							<div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
								<label className="text-lg font-semibold leading-5">Length (min.):</label>
								<input
									type="number"
									min="0"
									max="2000"
									maxLength="4"
									required
									className="w-full flex-grow rounded px-3 py-1 font-semibold drop-shadow-sm sm:w-auto"
									{...register('lengthMin', {
										required: true
									})}
								/>
							</div>
							<div className="pt-1 text-right">{`${hr}h ${min}m / ${sumMin}m `}</div>
						</div>
					</div>
					<div className="flex w-full flex-col gap-4 lg:w-auto lg:flex-row">
						{watch('img') && (
							<img src={watch('img')} className="h-48 rounded-md object-contain drop-shadow-md lg:h-64" />
						)}
						<button
							className="w-full min-w-fit items-center rounded-md bg-lime-600  px-2 py-1 text-center font-medium text-white drop-shadow-md hover:from-red-500 hover: disabled:from-slate-500 disabled:to-slate-400 lg:w-24 xl:w-32 xl:text-xl"
							type="submit"
							disabled={isAddingMovie}
						>
							{isAddingMovie ? 'Processing...' : 'ADD +'}
						</button>
					</div>
				</form>
				<div className="relative drop-shadow-sm">
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<MagnifyingGlassIcon className="h-5 w-5 stroke-2 text-gray-500" />
					</div>
					<input
						type="search"
						className="block w-full rounded-lg border border-gray-300 p-2 pl-10 text-gray-900"
						placeholder="Search movie"
						{...register('search')}
					/>
				</div>
				{isFetchingMoviesDone ? (
					<MovieLists
						movies={movies}
						search={watch('search')}
						handleDelete={handleDelete}
						handleUpdate={handleUpdateClick} // Pass handleUpdateClick to MovieLists component
					/>
					) : (
					<Loading />
					)}
				{isUpdateModalOpen && selectedMovie && (
					<div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
					<div className="bg-white p-4 rounded-md shadow-md">
						<h2 className="text-lg font-semibold mb-4">Update Movie: {selectedMovie.name}</h2>
						<form onSubmit={onUpdateMovie}>
						{/* Update form fields */}

						<div className="flex w-full grow flex-col flex-wrap justify-start gap-4 lg:w-auto">
						{/* <h3 className="text-xl font-bold">Update Movie</h3> */}

						<div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
							<label className="text-lg font-semibold leading-5">Name :</label>
							<input
								type="text"
								value={selectedMovie.name}
								onChange={changeUpdateMovie}
								required
								className="w-full flex-grow rounded px-3 py-1 font-semibold drop-shadow-sm sm:w-auto"
								// {...register('name', {
								// 	required: true
								// })}
							/>
						</div>
						<div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
							<label className="text-lg font-semibold leading-5">Poster URL :</label>
							<input
								type="text"
								value={selectedMovie.img}
								onChange={changeUpdateImgUrl}
								required
								className="w-full flex-grow rounded px-3 py-1 font-semibold drop-shadow-sm sm:w-auto"
								// {...register('img', {
								// 	required: true
								// })}
							/>
						</div>
						{/* <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
							<label className="text-lg font-semibold leading-5">Length (hr.):</label>
							<input
								type="number"
								value={selectedMovie.length}
								min="0"
								max="20"
								maxLength="2"
								className="w-full flex-grow rounded px-3 py-1 font-semibold drop-shadow-sm sm:w-auto"
								// {...register('lengthHr')}
							/>
						</div> */}
						<div>
							<div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
								<label className="text-lg font-semibold leading-5">Length (min.):</label>
								<input
									type="number"
									min="0"
									onChange={changeUpdateLength}
									value={selectedMovie.length}
									max="2000"
									maxLength="4"
									required
									className="w-full flex-grow rounded px-3 py-1 font-semibold drop-shadow-sm sm:w-auto"
									// {...register('lengthMin', {
									// 	required: true
									// })}
								/>
							</div>
							{/* <div className="pt-1 text-right">{`${hr}h ${min}m / ${sumMin}m `}</div> */}
						</div>
					</div>
						{/* <input
							type="text"
							defaultValue={selectedMovie.name}
							className="border rounded-md px-2 py-1 mb-2"
							{...register('name', { required: true })}
						/> */}
						{/* Add more input fields for updating movie details */}
						<div className='flex mt-4'>
						<button type="submit" className="flex-1 bg-blue-500 text-white rounded-md px-3 py-1">
							Update
						</button>
						<button type="button" className="flex-1 ml-2 text-gray-600" onClick={closeUpdateModal}>
							Cancel
						</button>
						</div>
						</form>
					</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default Movie