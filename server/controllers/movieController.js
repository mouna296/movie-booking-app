const Movie = require('../models/Movie')
const Showtime = require('../models/Showtime')
const moment = require('moment');



// controllers/userController.js

const User = require('../models/User')

// exports.getWatchedMoviesLast30Days = async (req, res, next) => {
//   try {
//     const userId = req.params.userId;
    
//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

//     const user = await User.findById(userId).populate({
//       path: 'tickets.showtime',
//       populate: {
//         path: 'movie',
//         model: 'Movie'
//       }
//     });

//     // Extract movies watched in the last 30 days
//     const watchedMovies = user.tickets
//       .filter((ticket) => ticket.showtime.showtime >= thirtyDaysAgo)
//       .map((ticket) => ticket.showtime.movie);
// 	console.log('watcheed movies last 30 days',watchedMovies)
//     res.status(200).json({
//       success: true,
//       count: watchedMovies.length,
//       data: watchedMovies,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.getMoviesWatchedByUser = async (req, res, next) => {
//     const userId = req.params.userId;  // Assuming the user ID is passed as a URL parameter
//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

//     try {
//         // Fetch showtimes in the last 30 days for the specified user
//         const showtimes = await Showtime.find({
//             'seats.user': userId,
//             showtime: { $gte: thirtyDaysAgo }
//         }).populate('movie');

//         // Extract movie details from the showtimes
//         const movies = showtimes.map(showtime => showtime.movie);

//         res.status(200).json({ success: true, data: movies });
//     } catch (err) {
//         res.status(400).json({ success: false, message: err });
//     }
// };

exports.fetchMoviesWatched= async (req, res,next) => {
	try {
		const { showtimeIds } = req.body;
		console.log('request body', req.body)
		// Find showtimes less than 30 days from the current date
		const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
		const showtimes = await Showtime.find({
		  _id: { $in: showtimeIds },
		  showtime: { $gte: thirtyDaysAgo },
		}).populate('movie');
	
		// Extract movie data from the showtimes
		const moviesWatched = showtimes.map((showtime) => {
		  return {
			movieId: showtime.movie._id,
			movieName: showtime.movie.name,
			movieLength: showtime.movie.length,
			movieImg: showtime.movie.img,
			showtimeId: showtime._id,
			showtimeDateTime: showtime.showtime,
		  };
		});
		console
		//res.json({ moviesWatched });
		res.status(200).json({ success: true, data: moviesWatched })

	} catch (error) {
	  console.error('Error fetching movies watched:', error);
	  res.status(500).json({ success: false, message: 'Internal Server Error' });
	}
  };

//@desc     GET all movies
//@route    GET /movie
//@access   Public
exports.getMovies = async (req, res, next) => {
	try {
		const movies = await Movie.find().sort({ createdAt: -1 })
		res.status(200).json({ success: true, count: movies.length, data: movies })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET showing movies
//@route    GET /movie/showing
//@access   Public
exports.getShowingMovies = async (req, res, next) => {
	try {
		const showingShowtime = await Showtime.aggregate([
			{ $match: { showtime: { $gte: new Date() }, isRelease: true } },
			{
				$lookup: {
					from: 'movies', // Replace "movies" with the actual collection name of your movies
					localField: 'movie',
					foreignField: '_id',
					as: 'movie'
				}
			},
			{
				$group: {
					_id: '$movie',
					count: { $sum: 1 }
				}
			},
			{
				$unwind: '$_id'
			},
			{
				$replaceRoot: {
					newRoot: {
						$mergeObjects: ['$$ROOT', '$_id']
					}
				}
			},
			{
				$sort: { count: -1 }
			}
		])

		res.status(200).json({ success: true, data: showingShowtime })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET showing movies with all unreleased showtime
//@route    GET /movie/unreleased/showing
//@access   Private admin
exports.getUnreleasedShowingMovies = async (req, res, next) => {
	try {
		const showingShowtime = await Showtime.aggregate([
			{ $match: { showtime: { $gte: new Date() }, isRelease: true } },
			{
				$lookup: {
					from: 'movies', // Replace "movies" with the actual collection name of your movies
					localField: 'movie',
					foreignField: '_id',
					as: 'movie'
				}
			},
			{
				$group: {
					_id: '$movie',
					count: { $sum: 1 }
				}
			},
			{
				$unwind: '$_id'
			},
			{
				$replaceRoot: {
					newRoot: {
						$mergeObjects: ['$$ROOT', '$_id']
					}
				}
			},
			{
				$sort: { count: -1, updatedAt: -1 }
			}
		])

		res.status(200).json({ success: true, data: showingShowtime })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}


//@desc     GET showing movies with all unreleased showtime
//@route    GET /movie/unreleased/showing
//@access   Private admin
exports.getUnreleasedShowingMoviesForUser = async (req, res, next) => {
	try {
		const showingShowtime = await Showtime.aggregate([
			{ $match: { showtime: { $gte: new Date() }, isRelease: false } },
			{
				$lookup: {
					from: 'movies', // Replace "movies" with the actual collection name of your movies
					localField: 'movie',
					foreignField: '_id',
					as: 'movie'
				}
			},
			{
				$group: {
					_id: '$movie',
					count: { $sum: 1 }
				}
			},
			{
				$unwind: '$_id'
			},
			{
				$replaceRoot: {
					newRoot: {
						$mergeObjects: ['$$ROOT', '$_id']
					}
				}
			},
			{
				$sort: { count: -1, updatedAt: -1 }
			}
		])

		res.status(200).json({ success: true, data: showingShowtime })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}



//@desc     GET single movie
//@route    GET /movie/:id
//@access   Public
exports.getMovie = async (req, res, next) => {
	try {
		const movie = await Movie.findById(req.params.id)

		if (!movie) {
			return res.status(400).json({ success: false, message: `Movie not found with id of ${req.params.id}` })
		}

		res.status(200).json({ success: true, data: movie })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Create movie
//@route    POST /movie
//@access   Private
exports.createMovie = async (req, res, next) => {
	try {
		const movie = await Movie.create(req.body)
		res.status(201).json({
			success: true,
			data: movie
		})
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Update movies
//@route    PUT /movie/:id
//@access   Private Admin
exports.updateMovie = async (req, res, next) => {
	try {
		const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!movie) {
			return res.status(400).json({ success: false, message: `Movie not found with id of ${req.params.id}` })
		}
		res.status(200).json({ success: true, data: movie })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Delete single movies
//@route    DELETE /movie/:id
//@access   Private Admin
exports.deleteMovie = async (req, res, next) => {
	try {
		const movie = await Movie.findById(req.params.id)

		if (!movie) {
			return res.status(400).json({ success: false, message: `Movie not found with id of ${req.params.id}` })
		}

		await movie.deleteOne()
		res.status(200).json({ success: true })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}
